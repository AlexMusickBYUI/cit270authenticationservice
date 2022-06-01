const express = require('express'); // import Express library
const bodyParser = require('body-parser'); //body-parser is middleware
const port = 3000;
const https = require('https')
const app = express(); // express() returns the express application as an object, and that application object is assigned to const "app"
const md5 = require('md5');
const fs = require('fs')
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

// app.listen(port, async ()=>{
//     await redisClient.connect();
//     console.log("listening... on port: "+port);
// });

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(port, () => {
    console.log('Listening on port', port)
  }
);

app.get('/',(request,response)=>{
    response.send("Hello");
});

app.post('/login', async(request,response)=>{ //the "post" here is referring to the request type expected, not the type that will be sent
    const redisHashedPassword = await redisClient.hmGet('passwords', request.body.userName);
    const userHashedPassword = md5(request.body.password); //Client sends password in cleartext
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

app.post('/signup', async(request,response)=>{ 
    const userExists = await redisClient.hExists('passwords', request.body.userName); //Returns 1 when exists, 0 when doesn't
    const userHashedPassword = md5(request.body.password); //Client sends password as cleartext

    if ( userExists == 0 ) {
        await redisClient.hSet('passwords', request.body.userName, userHashedPassword);
        response.status(200);
        response.send('Account Created');
    } else if ( userExists == 1 ) {
        response.status(401);
        response.send('Account already exists.')
    } else {
        response.status(500);
        response.send('Server error: could not create account');
        console.log('/signup: Could not verify user existence.');
        console.log('userExists:', userExists);
        console.log('userName from client:', request.body.userName);
    };
});