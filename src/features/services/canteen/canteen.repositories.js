const com = require('../../../config/com');
const AppError = require("../../../utils/AppError");
const logger = require("../../../utils/logger");  


exports.showMenu = async ()=>{

    const [result] = await com.pool.query(`
        select 
        canteen_products.id,
        canteen_category.name as category_name,
        canteen_products.name,
        canteen_products.price,
        canteen_products.image_url,
        case when canteen_products.available = 1 then 'true' else 'false' end as available 
        from canteen_products join canteen_category on canteen_products.category_id = canteen_category.id`);

    if(!result)throw new AppError('Failed to show menu',500);
    if(result.length === 0)throw new AppError('Menu not found',404);

    return result;

}