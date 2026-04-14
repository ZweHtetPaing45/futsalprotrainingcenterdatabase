const AppError = require('../../../utils/AppError');
const repo = require('./tagshowProduct.repositories');



class tagShowProductServices{


    async tagShowProduct(){

        const result = await repo.showProduct();

        return result;

    }
}

module.exports = new tagShowProductServices();