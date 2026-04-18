const logger = require("../../../../utils/logger");
const com = require('../../../../config/com');
const util = require('../../../../utils/tokengenerate');
const uploader = require('@zwehtetpaing55/uploader');


exports.updateProfile = async (
  name,
  dateOfBirth,
  email,
  phone,
  address,
  tokenEmail,
  file
) => {

  let query = "UPDATE createuser SET ";
  let values = [];

  // -------- TEXT FIELDS --------
  if (name !== '') {
    query += "name = ?, ";
    values.push(name);
  }

  if (dateOfBirth !== '') {
    query += "dateOfBirth = ?, ";
    values.push(dateOfBirth);
  }

  if (email !== '') {
    query += "email = ?, ";
    values.push(email);
  }

  if (phone !== '') {
    query += "phone = ?, ";
    values.push(phone);
  }

  if (address !== '') {
    query += "address = ?, ";
    values.push(address);
  }

  // -------- IMAGE --------
  if (file) {
    const [old] = await com.pool.query(
      "SELECT public_Id FROM createuser WHERE email = ?",
      [tokenEmail]
    );

    const pu_id = old[0]?.public_Id;

    if (pu_id) {
      await uploader.delete(pu_id);
    }

    const result = await uploader.upload(file, "profile_images");

    query += "image_url = ?, public_Id = ?, ";
    values.push(result.image_url, result.public_id);
  }

  // ❗️ ဘာမှ update မရှိဘူးဆို
  if (values.length === 0) {
    return false;
  }

  // remove last comma
  query = query.slice(0, -2);

  query += " WHERE email = ?";
  values.push(tokenEmail);

  const [result] = await com.pool.query(query, values);

  if (result.affectedRows > 0) {
    console.log(email);
    console.log(name);
    console.log(phone);

    if(name === ''){
        const [result] = await com.pool.query('select name from createuser where email = ?' ,[tokenEmail]);
        console.log(result[0].name);

        name = result[0].name;
    }

    return util.generateToken({
      name: name,
      email: email || tokenEmail,
      phone: phone
    });
  }

  return false;
};
 
// exports.updateProfile = async (name,dateOfbirth,email,phone,address,tokenEmail,file)=>{
        
//         console.log(tokenEmail);

//         let imageUrl;
//         let publicId;

//         if(file && name === '' && dateOfbirth === '' && email === '' && phone === '' && address === ''){

//         const public_id = await com.pool.query('select public_Id from createuser where email = ?',[tokenEmail]);

//         const pu_id = public_id[0][0].public_Id;

//         if(pu_id > 0 || pu_id !==null){
//             await uploader.delete(pu_id);
//         }

//         const result = await uploader.upload(file,'profile_images');

//         imageUrl = result.image_url;
//         publicId = result.public_id;

//         console.log('imageUrl',imageUrl);
//         console.log('publicId',publicId);

//         const results = await com.pool.query('update createuser set image_url = ?, public_Id = ? where email = ?', [imageUrl,publicId,tokenEmail]);

//         if(results[0].affectedRows > 0){
//             return true;
//         }else{
//             return false;
//         }

//         }

        

//         const public_id = await com.pool.query('select public_Id from createuser where email = ?',[tokenEmail]);

//         const pu_id = public_id[0][0].public_Id;

//         if(pu_id > 0 || pu_id !== null){
//             await uploader.delete(pu_id);
//         }

//         const result = await uploader.upload(file,'profile_images');

//         imageUrl = result.image_url;
//         publicId = result.public_id;

//         console.log('imageUrl',imageUrl);
//         console.log('publicId',publicId);

//         const updateResult = await com.pool.query('update createuser set name = ?, dateOfBirth = ?, email = ?, phone = ?, address = ?,image_url = ?, public_Id = ? where email = ?', [name,dateOfbirth,email,phone,address,imageUrl,publicId,tokenEmail]);

//         if(updateResult[0].affectedRows > 0){
//             return util.generateToken({name,email,phone});
//         }else{
//             return false;
//         }


//         // if((email === '') && (name !== '' && dateOfbirth !== '' && phone !== '' && address !== '' && file !== '')){

//         // const public_id = await com.pool.query('select public_Id from createuser where email = ?',[tokenEmail]);

//         // const pu_id = public_id[0][0].public_Id;

//         // if(pu_id > 0 || pu_id !==null){
//         //     await uploader.delete(pu_id);
//         // }

//         // const result1 = await uploader.upload(file,'profile_images');

//         // imageUrl = result1.image_url;
//         // publicId = result1.public_id;

//         // console.log('imageUrl',imageUrl);
//         // console.log('publicId',publicId);
            
//         //     const result = await com.pool.query('update createuser set name = ?, dateOfBirth = ?, phone = ?, address = ?,image_url = ?, public_Id = ? where email = ?', [name,dateOfbirth,phone,address,imageUrl,publicId,tokenEmail]);

//         //     if(result[0].affectedRows > 0){
//         //         return util.generateToken({name,tokenEmail,phone});
//         //     }else{
//         //         return false;
//         //     }
//         // }
        
//         // if(!file || email !== tokenEmail){

//         // const result = await com.pool.query('update createuser set name = ?, dateOfBirth = ?, email = ?, phone = ?, address = ? where email = ?', [name,dateOfbirth,email,phone,address,tokenEmail]);

//         // if(result[0].affectedRows > 0){
//         //     return util.generateToken({name,email,phone});
//         // }else{
//         //     return false;
//         // }

//         // }

//         // const result = await com.pool.query('update createuser set name = ?, dateOfBirth = ?, email = ?, phone = ?, address = ?,image_url = ?, public_Id = ? where email = ?', [name,dateOfbirth,email,phone,address,imageUrl,publicId,tokenEmail]);

//         // if(result[0].affectedRows > 0){
//         //     return util.generateToken({name,email,phone});
//         // }else{
//         //     return false;
//         // }

// }