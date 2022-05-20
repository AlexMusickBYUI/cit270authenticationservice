const express = require('express'); // import Express library
const bodyParser = require('body-parser'); //body-parser is middleware
const port = 3000;
const app = express(); // express() returns the express application as an object, and that application object is assigned to const "app"
const md5 = require('md5');
const {createClient} = require('redis');

const redisClient = createClient(
    { 
        socket:{
            port:6379,
            host:'127.0.0.1',
        }
    }
);


app.use(bodyParser.json()); // tell express to use bodyParser.json() (call it before anything else happens on each request)

app.listen(port, async ()=>{
    await redisClient.connect();
    console.log("listening... on port: "+port);
});
// The first parameter is the port to listen on. The second is a function (defined inline with arrow notation) that gets run when starting to listen.
// This function runs just because that's what the syntax of app.listen for express is.

app.get('/',(request,response)=>{
    response.send("Hello");
});

app.post('/login', async(request,response)=>{ //the "post" here is referring to the request type expected, not the type that will be sent
    const redisHashedPassword = await redisClient.hmGet('passwords', request.body.userName);
    const userHashedPassword = md5(request.body.password);
    if (redisHashedPassword == userHashedPassword) {
        response.status(200);
        response.send('Welcome');
        // console.log('ACCEPTED login request');
    } else {
        response.status(401);
        response.send('Unauthorized');
        // console.log('REJECTED login request');
    }
});

/* The above does the following:
-Wait for a post request on /login
-Connect to redis
-Get the password from "passwords" key in redis, using the "userName" field of the request as the field for the redis hashmap. Assign that value to redisHashedPassword
-set userHashedPassword equal to the md5 of the "password" field of the request
-check if userHashedPassword matches redisHashedPassword
-If True, send status 200 and message 'Welcome'
-Else, send status 401 and message 'Unauthorized'
*/