const AppError = require('../../../utils/AppError');
const repo = require('./categoryShow.repositories');


class categoryShowServices{

    async categoryShow(){

        const result = await repo.allShowCategory();

        // if(!result)throw new AppError('Category not found',404);

        return result;

    }

    async categoryNameShowProduct(name){

        const result = await repo.categoryNameShowProduct(name);

        // if(!result)throw new AppError('Category not found',404);

        return result;
    }

    async allBrandNameShowProduct(){
        const result = await repo.allBrandShowProduct();

        return result;
    }

    async nameBrandShowProduct(name){
        const result = await repo.nameBrandShowProduct(name);

        return result;
    }

    async allTagShowProduct(){
        const result = await repo.allTagsShowProduct();

        return result;
    }

    async tagNameProduct(name){
        const result = await repo.tagNameProduct(name);

        return result;
    }
}

module.exports = new categoryShowServices();