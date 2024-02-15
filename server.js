import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connect from './database/conn.js'
import router from './router/route.js'
import ENV from './config.js'
const app = express()

// middlewares
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.disable('x-powered-by') //less hackers know about our stack

const port = 8080;

// HTTP GET Request
app.get('/',(req,res)=>{
    res.status(201).send('SERVER IS RUNNING')
})

const allowedIPs = ENV.ALLOWED_IPS;

// Middleware to check if request is coming from allowed IP addresses
const allowOnlyFromAllowedIPs = (req, res, next) => {
    const clientIP = req.ip.replace('::ffff:', '');
    console.log(clientIP);
    if (allowedIPs.includes(clientIP)) {
        next(); // Allow request to proceed
    } else {
        res.status(403).send({"warning":'Nikal Laude Pehli Fursat Me Nikal'});
    }
};
// api routes
app.use('/api', allowOnlyFromAllowedIPs, router)

// start server only when we have valid connection
connect().then(()=>{
    try{
        app.listen(port,()=>{
            console.log(`Server connected to  http://localhost:${port}`)
        })
    } catch(error){
        console.log("Can\'t connect to the server");
    }
}).catch(error=>{
    console.log('Invalid database connection!');
})