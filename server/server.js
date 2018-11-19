// Only Antti can use
//git subtree push --prefix server heroku master

const express = require('express');

const app = express();
const address = "0.0.0.0";
const port = 8000;

var cors = require('cors');
var bodyparser = require('body-parser');
var uniqid = require('uniqid');

const jsonparser = bodyparser.json();

// CORS-middlewaren käyttöönotto
app.use(cors());
//JSON
//app.use(express.json());
// Sallitaan pääsy selaimen tarvitsemiin tiedostoihin
//app.use(express.static(__dirname+'/client')); 

// User and locations
// {id, lat, lng, time}
let users = [];

app.get("/", (req,res) => {
  res.json({msg:"Hello from the server"});
});

app.post("/",jsonparser,(req,res) => {
  console.log(req.body);
  const p = req.body;
  if(p.id === 'undefined' || p.id == null) {
    p.id = uniqid();
  }
  p.time = Date.now();
  let found = false;
  //Update user's location
  console.log("Loop start");
  for(let i=0;i<users.length;i++) {
    let user = users[i];
    if(user.id === p.id) {
      user.nick=p.nick; user.lat = p.lat; user.lng = p.lng; user.time = p.time;
      found = true;
      break;
    }
  }
  console.log("Loop end");
  // If user does not exist, add him
  if(!found) {
    users.push({"id":p.id,"user":p.nick,"lat":p.lat,"lng":p.lng,"time":p.time});
    //Send id to user
    res.json({"id":p.id,"user":p.nick,"lat":p.lat,"lng":p.lng,"time":p.time});
    return;
  }
  //Send all users to client
  res.json(users);
});
/*
app.post('/api/locations', jsonparser,(req, res) => {

    const p = req.body;
    console.log("POST /api/locations");
    console.log(p);
    console.log(p.id);
    console.log(p.nick);
    console.log(p.lat);
    console.log(p.lng);
    // If user does not have unique id, give him one
    if(p.id === 'undefined' || p.id == null) {
      p.id = uniqid();
    }
    p.time = Date.now();
    let found = false;
    //Update user's location
    console.log("Loop start");
    for(let i=0;i<users.length;i++) {
      let user = users[i];
      if(user.id === p.id) {
        user.nick=p.nick; user.lat = p.lat; user.lng = p.lng; user.time = p.time;
        found = true;
        break;
      }
    }
    console.log("Loop end");
    // If user does not exist, add him
    if(!found) {
      users.push({"id":p.id,"user":p.nick,"lat":p.lat,"lng":p.lng,"time":p.time});
      //Send id to user
      res.json({"id":p.id,"user":p.nick,"lat":p.lat,"lng":p.lng,"time":p.time});
      return;
    }
    //Send all users to client
    
    res.json(users);
});
*/
// Remove dead users
setInterval(removeUsers,20000);

function removeUsers() {
  users = users.filter(function(user) {
                           return Math.round((Date.now()-user.time)) < 20000;});
  console.log("Removed dead users");
}
// Start server
app.listen(process.env.PORT || port, () => console.log(`BerryMe server listening on port ${process.env.PORT || port}!`));
