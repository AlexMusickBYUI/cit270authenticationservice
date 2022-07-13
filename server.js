const express = require('express'); // import Express library
const bodyParser = require('body-parser'); //body-parser is middleware
const https = require('https')
const app = express(); // express() returns the express application as an object, and that application object is assigned to const "app"
const md5 = require('md5');
const fs = require('fs')
const {createClient} = require('redis');

// Priveleged port on Ubuntu, must either use root/sudo, change the port, or allow the port:
// sudo setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node)) .
// That last "." is indeed part of the command.
// Full discloure, I don't fully understand what this does so don't blame me if something goes awry.
const port = 3000;

// Obviously the IP address here needs to be the accessible IP of the redis server.
const redisClient = createClient({ url: 'redis://default:@34.132.236.17:6379', });

// const redisClient = createClient(
//     { 
//         socket:{
//             port:6379,
//             host:'127.0.0.1',
//         }
//     }
// );


app.use(bodyParser.json()); // tell express to use bodyParser.json() (call it before anything else happens on each request)

// https.createServer(
//     {
//         key: fs.readFileSync('server.key'),
//         cert: fs.readFileSync('server.cert'),
//         passphrase: 'P@ssw0rd'
//     }, app).listen(port, async() => {
//         await redisClient.connect();
//         console.log('Listening on port ' +port);
//     }
// );

app.listen(port, async()=>{
    await redisClient.connect();
    console.log('Listening in port: ',port);
})

app.get('/',(request,response)=>{
    response.send("Hello");
    console.log("Connection on /");
});

app.post('/login', async(request,response)=>{ //the "post" here is referring to the request type expected, not the type that will be sent
    const redisHashedPassword = await redisClient.hmGet('passwords', request.body.userName);
    const userHashedPassword = md5(request.body.password); //Client sends actual password, not hash
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
    const userHashedPassword = md5(request.body.password); //Client sends actual password, not hash

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