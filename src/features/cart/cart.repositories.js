const com = require('../../config/com');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');



exports.order = async (user_id,customer_name,phone,email,delivery_address,remark,payment_method,tax,delivery_fee,items,file) => {

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

    const result = await uploader.upload(file, 'orders_payment_image');

    const imageUrl = result.image_url;
    
    console.log('imageUrl',imageUrl);

    const publicId = result.public_id;
    
    console.log('publicId',publicId);

    const [order] = await com.pool.query('insert into orders (user_id,customer_name,phone,email,delivery_address,remark,payment_method,tax,delivery_fee,payment_image_url,public_id) values (?,?,?,?,?,?,?,?,?,?,?)',
    [user_id,customer_name,phone,email,delivery_address,remark,payment_method,tax,delivery_fee,imageUrl,publicId]);

    const orderId = order.insertId;

    console.log('orderId',orderId);

    for(let item of parsedItems){
        const [p] = await com.pool.query('select price from products where id = ?',[item.product_id]);

        const price = p[0].price;

        console.log('price',price);

        const total = price * item.quantity;

        console.log('total',total);

        subtotal +=total;

        await com.pool.query('insert into order_items (order_id,product_id,quantity,price,total) values (?,?,?,?,?)',
        [orderId,item.product_id,item.quantity,price,total]);

        await com.pool.query('update product_variants set stock = stock - ? where product_id = ?',[item.quantity,item.product_id]);

        const finalTotal = subtotal + Number(tax) + Number(delivery_fee);
        
        await com.pool.query('update orders set sub_total = ? , total_amount = ? where id = ?',[subtotal,finalTotal,orderId]);
    }

    const [prindOrder] = await com.pool.query(`
                    SELECT 
                    o.id AS order_id,
                    o.customer_name,
                    o.total_amount,
                    p.name AS product_name,
                    oi.quantity,
                    oi.price,
                    oi.total,
                    convert_tz(o.create_at, '+00:00','+06:30') AS create_at,
                    o.payment_method,
                    o.tax,
                    o.delivery_fee,
                    o.sub_total
                    FROM orders o
                    JOIN order_items oi ON o.id = oi.order_id
                    JOIN products p ON p.id = oi.product_id
                    WHERE o.id = ?;`, 
                    [orderId]);

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