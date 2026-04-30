const com = require('../../config/com');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');



exports.order = async (user_id,customer_name,phone,email,delivery_address,remark,payment_method,items,file) => {

    console.log('user_id',user_id);
    console.log('customer_name',customer_name);
    console.log('phone',phone);
    console.log('email',email);
    console.log('delivery_address',delivery_address);
    console.log('remark',remark);
    console.log('payment_method',payment_method);
    console.log('items',items);
    console.log('file',file);

    let subtotal = 0;

    const parsedItems = JSON.parse(items);

    if(!parsedItems)throw new AppError('Items must be a valid JSON string',400);

    console.log(items.product_id);

    for(let item of parsedItems){

        console.log('item',item);

        const [p] = await com.pool.query('select products.price,product_variants.stock from products join product_variants on product_variants.product_id = products.id where products.id = ?',[item.product_id]);

        console.log('p',p);

        if(p[0].stock < item.quantity){
            throw new AppError(`Not enough stock for product ID: ${item.product_id}`, 400);
        }
    }

    const result = await uploader.upload(file, 'mobile_orders_payment_image');

    const imageUrl = result.image_url;
    
    console.log('imageUrl',imageUrl);

    const publicId = result.public_id;
    
    console.log('publicId',publicId);

    const [payment_id] = await com.pool.query('select id from payment where payment_method = ?',[payment_method]);

    console.log('payment_id',payment_id[0].id);

    const payment_method_id = payment_id[0].id;

    const [tax] = await com.pool.query('select id from tax;');

    console.log('tax',tax[0].id);

    const tax_id  = tax[0].id;

    const [order] = await com.pool.query('insert into mobile_order (user_id,payment_id,tax_id,customer_name,phone,email,delivery_address,remark,mobile_image_url,mobile_public_id) values (?,?,?,?,?,?,?,?,?,?)',
    [user_id,payment_method_id,tax_id,customer_name,phone,email,delivery_address,remark,imageUrl,publicId]);

    const orderId = order.insertId;

    console.log('orderId',orderId);

    for(let item of parsedItems){
        const [p] = await com.pool.query('select price from products where id = ?',[item.product_id]);

        const price = p[0].price;

        console.log('price',price);

        const total = price * item.quantity;

        console.log('total',total);

        subtotal +=total;

        console.log('orderId',orderId);
        console.log('item.product_id',item.product_id);
        console.log('item.quantity',item.quantity);
        console.log('price',price);
        console.log('total',total);

        const [insertmobileorder] = await com.pool.query('insert into mobile_order_items (order_id,product_id,quantity,price,total) values (?,?,?,?,?)',
        [orderId,item.product_id,item.quantity,price,total]);

        if(!insertmobileorder){
            throw new AppError('Failed to create order',500);
        }

        const updateStock = await com.pool.query('update product_variants set stock = stock - ? where product_id = ?',[item.quantity,item.product_id]);

        if(!updateStock){
            throw new AppError('Failed to update stock',500);
        }

        console.log('subtotal',subtotal);

        const [tax] = await com.pool.query('select tax from tax where id = ?',[tax_id]);


        const finalTotal = subtotal + Number(tax[0].tax);
        
        console.log('finalTotal',finalTotal);

        const updateOrder = await com.pool.query('update mobile_order set sub_total = ? , total_amount = ? where id = ?',[subtotal,finalTotal,orderId]);

        if(!updateOrder){
            throw new AppError('Failed to update order',500);
        }
    }

    console.log(true);

    // const [prindOrder] = await com.pool.query(`
    //                 SELECT 
    //                 o.id AS order_id,
    //                 o.customer_name,
    //                 o.total_amount,
    //                 p.name AS product_name,
    //                 oi.quantity,
    //                 oi.price,
    //                 oi.total,
    //                 convert_tz(o.create_at, '+00:00','+06:30') AS create_at,
    //                 o.payment_method,
    //                 o.tax,
    //                 o.delivery_fee,
    //                 o.sub_total
    //                 FROM mobile_order o
    //                 JOIN mobile_order_items oi ON o.id = oi.order_id
    //                 JOIN products p ON p.id = oi.product_id
    //                 WHERE o.id = ?;`, 
    //                 [orderId]);

    const [prindOrder] = await com.pool.query(
                    `SELECT 
                        o.id AS order_id,
                        o.customer_name,
                        o.total_amount,
                        p2.payment_method,
                        t.tax,
                        p.name AS product_name,
                        oi.quantity,
                        oi.price,
                        oi.total,
                        CONVERT_TZ(o.create_at, '+00:00','+06:30') AS create_at,
                        o.delivery_fee,
                        o.sub_total
                    FROM mobile_order o
                    JOIN mobile_order_items oi ON o.id = oi.order_id
                    JOIN products p ON p.id = oi.product_id
                    LEFT JOIN payment p2 ON p2.id = o.payment_id
                    LEFT JOIN tax t ON t.id = o.tax_id
                    WHERE o.id = ?;`
                    , [orderId]);

console.log('prindOrder',prindOrder);


            const grouped = {};

            prindOrder.forEach(row => {
            if (!grouped[row.order_id]) {
                grouped[row.order_id] = {
                order_id: row.order_id,
                create_at: row.create_at,
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


exports.orderList = async (userId)=>{

    const [result] = await com.pool.query(
                    `SELECT 
                        o.id AS order_id,
                        o.customer_name,
                        o.total_amount,
                        p2.payment_method,
                        t.tax,
                        p.name AS product_name,
                        oi.quantity,
                        oi.price,
                        oi.total,
                        CONVERT_TZ(o.create_at, '+00:00','+06:30') AS create_at,
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
                create_at: row.create_at,
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