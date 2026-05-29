const repo = require('./training.repositories');


class TrainingService{

    async TrainingStudent(name,gender,phone,email,age,address,training_program_id,training_level_id,payment_id,file,user_id){

        const result = await repo.TrainingStudent(name,gender,phone,email,age,address,training_program_id,training_level_id,payment_id,file,user_id);

        return result;
    }

    async ShowStudentTraining(user_id){

        const result = await repo.ShowStudentTraining(user_id);

        return result;

    }

    async ShowTraining(id){

        const result = await repo.ShowTraining(id);

        return result;

    }

    async ShowTrainingImage(){

        const result = await repo.ShowTrainingImage();

        return result;

    }

}

module.exports = new TrainingService();