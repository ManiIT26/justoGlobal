const userModel = require('../models/userModel');

const kickOutUser = async (req,res)=>{
    const { username } = req.body;
    try{
        const checkUser =await userModel.find({
            $or:[
                {
                    email:username
                },
                {
                    mobileNo:username
                }
            ]
        });

        if(checkUser.length === 1){
            const userDetails = checkUser[0];

            if(userDetails?.status === 2){
                return res.status(401).json({error:`This username ${username} account is locked`}) 
            }
        
            if(!userDetails.token){
                return res.status(401).json({error:`Token not exist by this username ${username}`}) 
            }

            await userModel.findByIdAndUpdate(userDetails._id, {token:''});

            res.status(200).json({
                status:1,
                message:`Successfully token removed by this username:${username}`,
            
            })
        }

        return res.status(401).json({error:'Incorrect username'}) 
    }
    catch(err){
        return res.status(401).json({error:err.message})
    }

    res.status(200).json({message:'success'})
} 

module.exports = {
    kickOutUser,
}