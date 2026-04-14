const AppError = require("../../../utils/AppError");
const logger = require("../../../utils/logger");
const com = require('../../../config/com');


exports.allShowCategory = async ()=>{
    try{

        const result = await com.pool.query(`
        SELECT 
    p.id AS product_id,
    p.name AS product_name,

    -- c.id AS category_id,
    c.name AS category_name,

    -- b.id AS brand_id,
    b.name AS brand_name,

    p.cost,
    p.price,
    p.made,
    p.description,
    p.warranty,
    p.rating,
    -- p.created_at,

    pi.image_url,

    -- t.id AS tag_id,
    t.name AS tag_name

FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id

LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id;
            `);

        return result[0];

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}


exports.categoryNameShowProduct = async(name)=>{
    try{

        const result = await com.pool.query(`
          SELECT 
    p.id AS product_id,
    p.name AS product_name,

    -- c.id AS category_id,
    c.name AS category_name,

    -- b.id AS brand_id,
    b.name AS brand_name,

    p.cost,
    p.price,
    p.made,
    p.description,
    p.warranty,
    p.rating,
    -- p.created_at,

    pi.image_url,

    -- t.id AS tag_id,
    t.name AS tag_name

FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id

WHERE c.name = ?;  
            `,[name]);

    if(result[0].length === 0){
        return false;
    }else{
        return result[0];
    }

    }catch(error){
        logger.error({
            message : error.message,
            stack : error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}

exports.allBrandShowProduct = async()=>{
    try{

        const result = await com.pool.query(`
        SELECT 
    p.id AS product_id,
    p.name AS product_name,

    b.name AS brand_name,
    c.name AS category_name,

    p.price,
    p.cost,
    p.made,
    p.description,
    p.warranty,
    p.rating,
    p.created_at,

    GROUP_CONCAT(DISTINCT pi.image_url) AS images,
    GROUP_CONCAT(DISTINCT t.name) AS tags

FROM products p
JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id

LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id

GROUP BY p.id;
            `);

    if(result[0].length === 0){
        return false;
    }else{
        return result[0];
    }

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}

exports.nameBrandShowProduct = async(name)=>{
    try{

        const result = await com.pool.query(`
           SELECT 
    p.id AS product_id,
    p.name AS product_name,

    b.name AS brand_name,
    c.name AS category_name,

    p.price,
    p.cost,
    p.made,
    p.description,
    p.warranty,
    p.rating,
    p.created_at,

    GROUP_CONCAT(DISTINCT pi.image_url) AS images,
    GROUP_CONCAT(DISTINCT t.name) AS tags

FROM products p
JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id

LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id

WHERE b.name = ?
GROUP BY p.id; 
            `,[name]);

    if(result[0].length === 0){
        return false;
    }else{
        return result[0];
    }

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}

exports.allTagsShowProduct = async()=>{
    try{

        const result = await com.pool.query(`SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.cost,
    p.description,
    p.warranty,
    p.rating,
    p.made,

    GROUP_CONCAT(DISTINCT t.name) AS tags,
    GROUP_CONCAT(DISTINCT pi.image_url) AS images

FROM products p

LEFT JOIN product_tags pt 
    ON p.id = pt.product_id

LEFT JOIN tags t 
    ON pt.tag_id = t.id

LEFT JOIN product_images pi
    ON p.id = pi.product_id

GROUP BY p.id;`);


    if(result[0].length === 0){
        return false;
    }else{
        return result[0];
    }

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}

exports.tagNameProduct = async(name)=>{
    try{

        const result = await com.pool.query(`SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.cost,
    p.description,
    p.warranty,
    p.rating,
    p.made,

    GROUP_CONCAT(DISTINCT t.name) AS tags,
    GROUP_CONCAT(DISTINCT pi.image_url) AS images

FROM products p

JOIN product_tags pt 
    ON p.id = pt.product_id

JOIN tags t 
    ON pt.tag_id = t.id

LEFT JOIN product_images pi
    ON p.id = pi.product_id

WHERE t.name = ?

GROUP BY p.id;`,[name]);

        if(result[0].length === 0){
                return false;
            }else{
                return result[0];
            }


    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}