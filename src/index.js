const express = require("express")
const corsA = require('cors');
const dbConnect = require('./db/dbConnect')
const userRoute = require('./router/userRoutes')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//app.use(corsA)
app.use('/api',userRoute); 
 
dbConnect();
 
 
 

module.exports = app;