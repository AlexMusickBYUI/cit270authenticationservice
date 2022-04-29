const express = require('express'); // import Express library
const app = express.application; // "App" constant = "application" method of express library (in this case that basically means to actuallly use the library)

app.listen(3000, ()=>{console.log("listening...")}); //listen on port 3000 with (inline-defined) function () that executes (console.log("listening...")) when run.

app.get('/',(request,response)=>{response.send("Hello")})