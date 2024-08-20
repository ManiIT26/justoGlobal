const app = require('./index')
const config = require('./config');

app.listen(config.PORT,()=>{
    console.log(`Running PORT ${config.PORT}`)
})

 