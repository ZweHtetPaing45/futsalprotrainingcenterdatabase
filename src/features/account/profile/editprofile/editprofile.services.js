const cloudinary = require('../../../../config/cloudinary');
const repo = require('./editprofile.repositories');

class editprofileServices{


    async updateProfile(file,name,dateOfbirth,email,phone,address,tokenEmail){

        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'profile_images',
            });
        
        const imageUrl = result.secure_url;
        const publicId = result.public_id;

        const updateResult = await repo.updateProfile(name,dateOfbirth,email,phone,address,tokenEmail,imageUrl,publicId);

        if(updateResult){
            return true;
        }else{
            return false;
        }
    }
}

module.exports = new editprofileServices();