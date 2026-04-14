const cloudinary = require('../../../../config/cloudinary');
const repo = require('./editprofile.repositories');
const uploader = require('@zwehtetpaing55/uploader');

class editprofileServices{


    async updateProfile(file,name,dateOfbirth,email,phone,address,tokenEmail){

        // const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        // const result = await cloudinary.uploader.upload(base64Image, {
        //     folder: 'profile_images',
        //     });
        
        const result = await uploader.upload(file,'profile_images');

        const imageUrl = result.image_url;
        const publicId = result.public_id;

        // console.log('imageUrl',imageUrl);
        // console.log('publicId',publicId);

        const updateResult = await repo.updateProfile(name,dateOfbirth,email,phone,address,tokenEmail,imageUrl,publicId);

        return updateResult;

        // if(updateResult){
        //     return true;
        // }else{
        //     return false;
        // }
    }
}

module.exports = new editprofileServices();