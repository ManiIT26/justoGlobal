const route = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const apiLimiterHandler =  async (req,res,next) => {
    res.status(400).json({
        title:"Validation Error",
        message:"Exceeded the request limit. Please try again after 5 minutes",
        stackTrace:""
    });
    
}

const apiLimiter  = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: apiLimiterHandler,
    standardHeaders: true,
    legacyHeaders : false
})

const {
    createUser,
    loginUser,
    createLink,
    verifyLink
} = require('../controller/users')

const {
    kickOutUser
} = require('../controller/admin')


route.post('/createUser',
    [
        body('email').isEmail().withMessage('Invalid Email Address'),
        body('mobileNo').isNumeric().isLength({min:10,max:10}).withMessage("Invalid Mobile Number"),
        body('password').isLength({min:5}).withMessage('Invalid password')
    ]
    ,createUser);

route.post('/login',
        [
           // body('username').isEmpty().withMessage('Invalid Email Address'),         
            body('password').isLength({min:5}).withMessage('Invalid password')
        ],
        apiLimiter
        ,loginUser);

route.post('/createLink',createLink);  


route.post('/validateLink',verifyLink);  

route.post('/kickOutUser',kickOutUser);  


module.exports = route;