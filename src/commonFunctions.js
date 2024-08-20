const bcrypt = require('bcrypt');
const moment = require('moment');

const encryptPassword = async (input)=>{
    if(!input){
        return null;
    }

    return await bcrypt.hash(input,10)
}

const dycryptPassword = async (encryptedInput,input)=>{
    if(!input || !encryptedInput){
        return false;
    } 

    const isCompared = await bcrypt.compare(input,encryptedInput);
    return isCompared;
}

const currentDate = ()=>{
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

module.exports = {
    encryptPassword,
    dycryptPassword,
    currentDate
}