const dotenv = require('dotenv');
 dotenv.config();



 const envConfig = {
    PORT:process.env?.PORT || 9090,
    DB_URL:process.env?.DB_URL || '',
    JWT_SECRET_KEY:process.env?.JWT_SECRET_KEY || '',
    LOGIN_ATTEMPT:process.env?.LOGIN_ATTEMPT || 0,
    LINK_EXPIRE_TIME:process.env?.LINK_EXPIRE_TIME || 0,
 }


 module.exports = envConfig;