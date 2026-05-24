
const repo = require('./changepassword.repositories');
const bcrypt = require('bcrypt');

class changePasswordService{

    async changePassword(password,tokenPassword,changePassword,user_id){

        const math = await bcrypt.compare(password,tokenPassword);

        if(math){
            const hashPassword = await bcrypt.hash(changePassword,12);

            const result = await repo.ChangePassword(hashPassword,user_id);

            return result;
        }

        return false;

    }
}

module.exports = new changePasswordService();