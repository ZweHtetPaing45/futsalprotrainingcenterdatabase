const repo = require('./training.repositories');


class TrainingService{

    async TrainingStudent(name,gender,phone,email,age,address,emergency,training_program_id,training_level_id,schedule_id,payment_id,file){

        const result = await repo.TrainingStudent(name,gender,phone,email,age,address,emergency,training_program_id,training_level_id,schedule_id,payment_id,file);

        return result;
    }

    async ShowTraining(){

        const result = await repo.ShowTraining();

        return result;

    }

}

module.exports = new TrainingService();