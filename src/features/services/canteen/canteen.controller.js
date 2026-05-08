const services = require('./canteen.services');

class CanteenController{

    async showMenu(req,res,next){

        try{

            const result = await services.showMenu();

            res.status(200).json({
                status: 'success',
                result
            });

        }catch(error){
            next(error);
        }

    }

}

module.exports = new CanteenController();