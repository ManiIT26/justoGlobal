const mongoose = require('mongoose');
const config = require('../config');

const dbConnect = async ()=>{ 

    console.log(config.DB_URL,'sadsd')
 
    mongoose.connect(config.DB_URL)
    .then(()=>{
        console.log("db Connected")
    })
    .catch((err)=>{
        console.log('dbErr', err.message) 
    })
}


module.exports = dbConnect;