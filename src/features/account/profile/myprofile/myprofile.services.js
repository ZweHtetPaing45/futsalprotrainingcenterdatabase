const repo = require('./myprofile.repositories');


class MyProfileServices {


    async showProfile(email){

        const userProfile = await repo.showprofile(email);

        if(!userProfile)throw new AppError('User not found',404);

        return userProfile;

    }
}

module.exports = new MyProfileServices();