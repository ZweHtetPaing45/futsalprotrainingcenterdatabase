const AppError = require('../../../utils/AppError');
const service = require('./categoryShow.service');


class categoryShowController{


    async categoryShow(req,res,next){
        try{

            const result = await service.categoryShow();

            if(result){
                res.status(200).json({
                    status: 'success',
                    result
                })
            }else{
                res.status(200).json({
                    status: 'success',
                    message: 'No category found'
                })
            }

        }catch(error){
            next(error);
        }
    }

    async CategoryNameShowProduct(req,res,next){
        try{

            const name=req.params.name;

            if(!name)throw new AppError('All fields are required',400);

            const result = await service.categoryNameShowProduct(name);

            // if(!result)throw new AppError('Category not found',404);

            res.status(200).json({
                status: 'success',
                result
            })

        }catch(error){
            next(error);
        }
    }

    async allBandNameProduct(req,res,next){
        try{

            const result = await service.allBrandNameShowProduct();

            res.status(200).json({
                status: 'success',
                result
            })

        }catch(error){
            next(error);
        }
    }

    async nameBrandShowProduct(req,res,next){
        try{

            const name=req.params.name;

            if(!name)throw new AppError('All fields are required',400);

            const result = await service.nameBrandShowProduct(name);

            res.status(200).json({
                status: 'success',
                result
            })

        }catch(error){
            next(error);
        }

    }

    async allTagShowProduct(req,res,next){
        try{

            const result = await service.allTagShowProduct();

            res.status(200).json({
                status: 'success',
                result
            })


        }catch(error){
            next(error);
        }
    }

    async tagNameProduct(req,res,next){
        try{
            const name = req.params.name;

            const result = await service.tagNameProduct(name);

            res.status(200).json({
                status: 'success',
                result
            })

        }catch(error){
            next(error);
        }
    }

    async allCategory(req,res,next){
        try{

            const result = await service.allCategory();

            res.status(200).json({
                status: 'success',
                result
            });

        }catch(error){
            next(error);
        }
    }
}

module.exports = new categoryShowController();