const com = require('../../../config/com');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');



exports.showProduct = async ()=>{

    try{

        const tags = await com.pool.query('select name from tags');

        // console.log(tags[0][0].name);

        const tagsData = [tags[0][0].name,tags[0][1].name];

        console.log(tagsData);

        const listData = [];

        for(let name of tagsData){

            const result = await com.pool.query(`SELECT 
                        p.name AS product_name,
                        p.cost,
                        p.price,
                        pi.image_url

                    FROM tags t

                    JOIN product_tags pt 
                        ON t.id = pt.tag_id

                    JOIN products p 
                        ON pt.product_id = p.id

                    LEFT JOIN product_images pi 
                        ON p.id = pi.product_id

                    WHERE t.name = ?`,[name]);

                    // console.log("Result data",result[0]);

                    if(result[0].length > 0){

                        listData.push({
                            name,
                            data: result[0]
                        })
                    }

                    console.log("List",listData[0]);
        }

        return listData;


    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to show product',500);
    }

}