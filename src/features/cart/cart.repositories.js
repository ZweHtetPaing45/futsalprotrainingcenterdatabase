const com = require('../../config/com');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');

const parseItems = (items) => {
    let parsedItems;

    try {
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch {
        throw new AppError('Items must be a valid JSON array', 400);
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new AppError('Items must be a non-empty JSON array', 400);
    }

    const quantitiesByProduct = new Map();

    for (const item of parsedItems) {
        const productId = Number(item?.product_id);
        const quantity = Number(item?.quantity);

        if (!Number.isSafeInteger(productId) || productId <= 0 ||
            !Number.isSafeInteger(quantity) || quantity <= 0) {
            throw new AppError('Each item must have a valid product_id and positive integer quantity', 400);
        }

        const totalQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;
        if (!Number.isSafeInteger(totalQuantity)) {
            throw new AppError(`Quantity is too large for product ID: ${productId}`, 400);
        }
        quantitiesByProduct.set(productId, totalQuantity);
    }

    return [...quantitiesByProduct.entries()]
        .map(([product_id, quantity]) => ({ product_id, quantity }))
        .sort((a, b) => a.product_id - b.product_id);
};

const getOrderDetails = async (db, orderId) => {
    const [rows] = await db.query(
        `SELECT
            o.id AS order_id,
            o.customer_name,
            o.total_amount,
            p2.payment_method,
            t.tax,
            o.order_status,
            p.name AS product_name,
            oi.quantity,
            oi.price,
            oi.total,
            DATE_FORMAT(o.create_at, '%Y-%m-%d') AS date_only,
            DATE_FORMAT(o.create_at, '%h:%i:%s %p') AS time_only,
            o.delivery_fee,
            o.sub_total
        FROM mobile_order o
        JOIN mobile_order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN payment p2 ON p2.id = o.payment_id
        LEFT JOIN tax t ON t.id = o.tax_id
        WHERE o.id = ?`,
        [orderId]
    );

    const grouped = {};

    for (const row of rows) {
        if (!grouped[row.order_id]) {
            grouped[row.order_id] = {
                order_id: row.order_id,
                Date: row.date_only,
                Time: row.time_only,
                order_status: row.order_status,
                customer_name: row.customer_name,
                items: [],
                Sub_total: row.sub_total,
                tax: row.tax,
                delivery_fee: row.delivery_fee,
                Total: row.total_amount,
            };
        }

        grouped[row.order_id].items.push({
            product_name: row.product_name,
            quantity: row.quantity,
            price: row.price,
            total: row.total,
        });
    }

    return Object.values(grouped);
};

const getOrderForIdempotencyKey = async (db, key) => {
    const [rows] = await db.query(
        'SELECT id, user_id FROM mobile_order WHERE idempotency_key = ?',
        [key]
    );

    return rows[0];
};

exports.order = async (
    user_id,
    customer_name,
    phone,
    email,
    delivery_address,
    remark,
    payment_method,
    items,
    file,
    idempotencyKey
) => {
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0 || idempotencyKey.length > 255) {
        throw new AppError('A valid Idempotency-Key header is required', 400);
    }

    const parsedItems = parseItems(items);
    const existingOrder = await getOrderForIdempotencyKey(com.pool, idempotencyKey);
    if (existingOrder) {
        if (Number(existingOrder.user_id) !== Number(user_id)) {
            throw new AppError('Idempotency-Key has already been used', 409);
        }
        return getOrderDetails(com.pool, existingOrder.id);
    }

    let uploadedImage;
    let connection;
    let transactionStarted = false;
    let committed = false;
    let insertingOrder = false;

    try {
        uploadedImage = await uploader.upload(file, 'mobile_orders_payment_image');
        connection = await com.pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const [paymentRows] = await connection.query(
            'SELECT id FROM payment WHERE payment_method = ? LIMIT 1',
            [payment_method]
        );
        if (paymentRows.length === 0) {
            throw new AppError('Payment method was not found', 400);
        }

        const [taxRows] = await connection.query('SELECT id, tax FROM tax LIMIT 1');
        if (taxRows.length === 0) {
            throw new AppError('Tax configuration was not found', 500);
        }

        insertingOrder = true;
        const [order] = await connection.query(
            `INSERT INTO mobile_order
            (user_id, payment_id, tax_id, customer_name, phone, email, delivery_address, remark, mobile_image_url, mobile_public_id, idempotency_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                paymentRows[0].id,
                taxRows[0].id,
                customer_name,
                phone,
                email,
                delivery_address,
                remark,
                uploadedImage.image_url,
                uploadedImage.public_id,
                idempotencyKey,
            ]
        );
        insertingOrder = false;
        const orderId = order.insertId;

        const productDetails = new Map();
        for (const item of parsedItems) {
            const [productRows] = await connection.query(
                `SELECT p.price, pv.id AS variant_id, pv.stock
                FROM products p
                JOIN product_variants pv ON pv.product_id = p.id
                WHERE p.id = ?
                ORDER BY pv.id
                FOR UPDATE`,
                [item.product_id]
            );

            if (productRows.length === 0) {
                throw new AppError(`Product not found or unavailable: ${item.product_id}`, 400);
            }

            const availableStock = productRows.reduce((total, row) => total + Number(row.stock), 0);
            if (availableStock < item.quantity) {
                throw new AppError(`Not enough stock for product ID: ${item.product_id}`, 409);
            }

            productDetails.set(item.product_id, {
                price: Number(productRows[0].price),
                variants: productRows,
            });
        }

        let subtotal = 0;

        for (const item of parsedItems) {
            const { price, variants } = productDetails.get(item.product_id);
            const total = price * item.quantity;
            let stockToReserve = item.quantity;

            for (const variant of variants) {
                const reserveFromVariant = Math.min(Number(variant.stock), stockToReserve);
                if (reserveFromVariant === 0) continue;

                const [stockUpdate] = await connection.query(
                    'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [reserveFromVariant, variant.variant_id, reserveFromVariant]
                );
                if (stockUpdate.affectedRows !== 1) {
                    throw new AppError(`Not enough stock for product ID: ${item.product_id}`, 409);
                }
                stockToReserve -= reserveFromVariant;
                if (stockToReserve === 0) break;
            }

            if (stockToReserve !== 0) {
                throw new AppError(`Not enough stock for product ID: ${item.product_id}`, 409);
            }

            await connection.query(
                'INSERT INTO mobile_order_items (order_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, price, total]
            );
            subtotal += total;
        }

        const finalTotal = subtotal + Number(taxRows[0].tax);

        await connection.query(
            'UPDATE mobile_order SET sub_total = ?, total_amount = ? WHERE id = ?',
            [subtotal, finalTotal, orderId]
        );

        await connection.commit();
        transactionStarted = false;
        committed = true;

        return getOrderDetails(com.pool, orderId);
    } catch (error) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                logger.error(`Failed to roll back cart order transaction: ${rollbackError.message}`);
            }
        }

        if (!committed && uploadedImage?.public_id) {
            try {
                await uploader.delete(uploadedImage.public_id);
            } catch (cleanupError) {
                logger.error(`Failed to remove payment image after order failure: ${cleanupError.message}`);
            }
        }

        if (insertingOrder && error.code === 'ER_DUP_ENTRY') {
            const duplicateOrder = await getOrderForIdempotencyKey(com.pool, idempotencyKey);
            if (duplicateOrder && Number(duplicateOrder.user_id) === Number(user_id)) {
                return getOrderDetails(com.pool, duplicateOrder.id);
            }
            throw new AppError('Idempotency-Key has already been used', 409);
        }

        throw error;
    } finally {
        if (connection) connection.release();
    }
};

exports.orderList = async (userId)=>{

    const [result] = await com.pool.query(
                    `SELECT
                        o.id AS order_id,
                        o.customer_name,
                        o.total_amount,
                        o.phone,
                        o.email,
                        o.delivery_address,
                        p2.payment_method,
                        t.tax,
                        o.order_status,
                        p.name AS product_name,
                        oi.quantity,
                        oi.price,
                        oi.total,
                        DATE_FORMAT(o.create_at, '%Y-%m-%d') AS date_only,
                        DATE_FORMAT(o.create_at, '%h:%i:%s %p') AS time_only,
                        o.delivery_fee,
                        o.sub_total
                    FROM mobile_order o
                    JOIN mobile_order_items oi ON o.id = oi.order_id
                    JOIN products p ON p.id = oi.product_id
                    LEFT JOIN payment p2 ON p2.id = o.payment_id
                    LEFT JOIN tax t ON t.id = o.tax_id
                    WHERE o.user_id = ?;`,[userId]);

    const grouped = {};

            result.forEach(row => {
            if (!grouped[row.order_id]) {
                grouped[row.order_id] = {
                order_id: row.order_id,
                Date: row.date_only,
                Time: row.time_only,
                order_status: row.order_status,
                email: row.email,
                phone: row.phone,
                delivery_address: row.delivery_address,
                customer_name: row.customer_name,
                items: [],
                Sub_total: row.sub_total,
                tax: row.tax,
                delivery_fee: row.delivery_fee,
                Total: row.total_amount,
                };
            }

            grouped[row.order_id].items.push({
                product_name: row.product_name,
                quantity: row.quantity,
                price: row.price,
                total: row.total
            });
            });

            const result1 = Object.values(grouped);

            console.log('result1',result1);

    return result1;
}

exports.showPayment = async ()=>{

    const [result] = await com.pool.query('select id,payment_method,payment_name,payment_image_url,payment_number from payment');

    if(!result)throw new AppError('Payment Error',400);
    if(result.length === 0)throw new AppError('Payment length is 0',400);

    return result;

}

exports.showTax = async ()=>{

    const [result] = await com.pool.query('select id,tax from tax');

    if(!result)throw new AppError('Tax Error',400);
    if(result.length === 0)throw new AppError('Tax length is 0',400);

    return result;

}