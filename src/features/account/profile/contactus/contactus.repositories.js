const com = require('../../../../config/com');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');


exports.showgeneralSetting = async ()=>{

    const [showgeneralSetting] = await com.pool.query('select logo_image_url,shop_name,contact_info,address,social_link from general');

    if(!showgeneralSetting)throw new AppError('Failed to show general setting',500);

    console.log('showgeneralSetting',showgeneralSetting);

    return showgeneralSetting;

}