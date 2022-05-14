const express = require('express'); // import Express library
const bodyParser = require('body-parser'); //body-parser is middleware
const port = 3000;
const app = express(); // express() returns the express application as an object, and that application object is assigned to const "app"
const md5 = require('md5');
require('redis');

// const redisClient = redis.createClient();

app.use(bodyParser.json()); // tell express to use bodyParser.json() (call it before anything else happens on each request)

app.listen(port, ()=>{
    console.log("listening... on port: "+port);
});
// The first parameter is the port to listen on. The second is a function (defined inline with arrow notation) that gets run when starting to listen.
// This function runs just because that's what the syntax of app.listen for express is.

app.get('/',(request,response)=>{
    response.send("Hello");
});

app.post('/login', async(request,response)=>{ //the "post" here is referring to the request type expected, not the type that will be sent
    const loginRequest = request.body;
    // var userHashedPassword = md5(loginRequest.password);
    // var redisHashedPassword = await redisClient.hGet('passwords', loginRequest.userName);
    if (loginRequest.userName=='notreal_bob_jones@ams.net' && loginRequest.password=='aA1!aa') {
        response.status(200);
        response.send('Welcome');
    } else {
        response.status(401);
        response.send('Unauthorized');
    }
});
//This works the way it looks like it should, but the issue when it didn't work was that the header was missing from the incoming data.
//For JSON, body-parser expects the header "content-type:application/json". In curl, you can add a header using -H "[header]".