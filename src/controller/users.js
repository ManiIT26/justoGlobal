const { validationResult } = require('express-validator');
const {encryptPassword,dycryptPassword,currentDate } = require('../commonFunctions')
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const config = require('../config')
const moment = require('moment');

const createUser = async (req,res)=>{  
    const inputErrors = validationResult(req);

    if(!inputErrors.isEmpty()){
        return res.status(400).json({erros:inputErrors.array()});
    } 
    const encPassword = await encryptPassword(req?.body?.password);
    const paylaod = {
        name:req.body?.name,
        email:req.body?.email,
        mobileNo:req.body?.mobileNo, 
        password:encPassword, 
        createdOn:currentDate()
    }
    
    try{
        const checkUser =await userModel.find({
            $or:[
                {
                    email:paylaod?.email
                },
                {
                    mobileNo:paylaod?.mobileNo
                }
            ]
        })
        
        if(checkUser.length !== 0){
            return res.status(400).json({error:'Email or Mobile Number Alreay Exist'});
        }

        const users = new userModel(paylaod);
        const dbRes = await users.save();          
        return res.status(200).json({message:dbRes})
    }
    catch(err){
        return res.status(401).json({message:err.message})
    }
}


const loginUser = async (req,res)=>{ 

    const inputErrors = validationResult(req);
    if(!inputErrors.isEmpty()){
        return res.status(400).json({erros:inputErrors.array()});
    } 

    const { username,password } = req.body;

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
        }) 
        
        if(checkUser.length === 1){
            const userDetails = checkUser[0];
            const validatePassword =await dycryptPassword(userDetails?.password,password)

            const attempts = Number(userDetails?.login_attempt) + 1;
            
            const update = await userModel.findByIdAndUpdate(userDetails._id,{login_attempt:attempts},{new:true,runValidators:true});
            console.log(update,userDetails?.login_attempt,config?.LOGIN_ATTEMPT)
            if(!validatePassword){
                return res.status(401).json({error:'Incorrect Password'})
            }  

            if(userDetails?.login_attempt >= config?.LOGIN_ATTEMPT){
                await userModel.findByIdAndUpdate(userDetails._id,{status:2});
                return res.status(401).json({error:'Your account is locked'})
            }           

            const basicDetails = {
                name:userDetails?.name,
                _id:userDetails?._id,
                email:userDetails?.email,
                mobileNo:userDetails?.mobileNo,
            }

            console.log(basicDetails)

            const token = jwt.sign({users:basicDetails},config?.JWT_SECRET_KEY,{expiresIn:'10m'})            
            await userModel.findByIdAndUpdate(userDetails._id,{token:token},{new:true,runValidators:true});            
            return res.status(200).json({message:'Login Success',toen:token}) 
        }

        return res.status(401).json({error:'Incorrect username'}) 
    }
    catch(err){
        return res.status(401).json({error:err.message})
    }

    
}   

const createLink = async (req,res)=>{
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
            const  uuid = crypto.randomUUID();
            const  link = `www.testLink.com/${uuid}`;
            await userModel.findByIdAndUpdate(userDetails._id,{link_generated_at:currentDate(),code:uuid,link_status:0},{new:true,runValidators:true});   
            return res.status(200).json({
                status:1,
                message:'Link Created Successfully',
                link,
            })
        }

        return res.status(401).json({error:'Incorrect username'}) 
    }
    catch(err){
        return res.status(401).json({error:err.message})
    }

    res.status(200).json({message:'success'})
}

const verifyLink  = async(req,res)=>{

    const {code} = req.body;

    try{
        const userInfo = await userModel.findOne({code:code});

        if(!userInfo){
            return res.status(401).json({error:'User not exist'}) 
        }

        if(userInfo?.link_status === 1){
            return res.status(401).json({error:'Link already used'}) 
        }

        const link_milieseconds = new Date(currentDate()) - userInfo.link_generated_at;;
        const link_minutes = link_milieseconds/(1000 * 60);

        if(link_minutes.toFixed(2) <= config.LINK_EXPIRE_TIME){
            const token = jwt.sign({ 
                user:{id:userInfo._id,name:userInfo.name,email:userInfo.email,phone_no:userInfo.phone_no}
             },
                 config.JWT_SECRET_KEY,
                 {expiresIn:'15m'}                            
             ); 
     
             //access the link
             await userModel.findByIdAndUpdate(userInfo._id,{link_status:1,token:token});

            return res.status(200).json({
                status:1,
                message:"success",
                token
            });
        }
    }
    catch(err){
        return res.status(401).json({error:err.message})
    }

     
}


module.exports = {
    createUser,
    loginUser,
    createLink,
    verifyLink
}