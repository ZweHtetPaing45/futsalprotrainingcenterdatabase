const AppError = require('../../../utils/AppError');
const service = require('./training.service');


class TrainingController{

    async TrainingStudent(req,res,next){

        try{

            const user_id = req.user[0].id;
            
            const {name,gender,phone,email,age,address,training_program_id,training_level_id,payment_id} = req.body;

            const file = req.file;

            if(!name || !gender || !phone || !email || !age || !address || !training_program_id || !training_level_id ){
                throw new AppError('Please fill all the fields', 400);
            }

            console.log('file',file);
            console.log('body',req.body);

            const result = await service.TrainingStudent(name,gender,phone,email,age,address,training_program_id,training_level_id,payment_id,file,user_id);

            if(result){
                res.status(201).json({
                    success: true,
                    message: 'Training student added successfully',
                    data: result
                });

            }else{

                res.status(400).json({
                    success: false,
                    message: 'Training student added',
                    data: result
                });
            }

        }catch(error){
            next(error);
        }

    }

    async ShowStudentTraining(req,res,next){

        try{

            const user_id = req.user[0].id;

            const result = await service.ShowStudentTraining(user_id);

            res.status(200).json({
                success: true,
                message: 'Training programs retrieved successfully',
                data: result
            });

        }catch(error){
            next(error);
        }

    }

           async ShowTraining(req,res,next){

        try{

            const id = req.params.id;

            const result = await service.ShowTraining(id);

            res.status(200).json({
                success: true,
                message: 'Training programs retrieved successfully',
                data: result
            });

        }catch(error){
            next(error);
        }

    }

    async ShowTrainingImage(req,res,next){

        try{

            const result = await service.ShowTrainingImage();

            res.status(200).json({
                success: true,
                message: 'Training images retrieved successfully',
                data: result
            });

        }catch(error){
            next(error);
        }

    }

}

module.exports = new TrainingController();