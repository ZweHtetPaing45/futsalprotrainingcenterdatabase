const repo = require('./contactus.repositories');

class ContactUsService{

     async showgeneralSetting(){

        const result = await repo.showgeneralSetting();

        return result;
    }

}

module.exports = new ContactUsService();