// Only Antti can use
//git subtree push --prefix server heroku master
//git push heroku `git subtree split --prefix server master`:master --force

const nearbyDistance = 30;

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
  let us = getNearbyUsers({"lat":p.lat, "lng":p.lng},nearbyDistance);
  res.json(us);
});

// Remove dead users
setInterval(removeUsers,20000);

function removeUsers() {
  users = users.filter(function(user) {
                           return Math.round((Date.now()-user.time)) < 20000;});
  console.log("Removed dead users");
}

function getNearbyUsers(coords, maxDistance) {
  let deg2rad = Math.PI/180;

  let r_og = Math.cos(coords.lat*deg2rad) * 6371;

  let x_og = Math.sin(coords.lng*deg2rad) * r_og;
  let y_og = Math.sin(coords.lat*deg2rad) * 6371;
  let z_og = Math.cos(coords.lng*deg2rad) * r_og;
  let nearbyUsers = users.filter(function(user) {
    let r_u = Math.cos(user.lat*deg2rad) * 6371;

    let x_u = Math.sin(user.lng*deg2rad) * r_u;
    let y_u = Math.sin(user.lat*deg2rad) * 6371;
    let z_u = Math.cos(user.lng*deg2rad) * r_u;
    let distance = Math.pow(x_u-x_og,2)+Math.pow(y_u-y_og,2)+Math.pow(z_u-z_og,2)
    distance = Math.sqrt(distance);
    console.log(distance);
    return distance <= maxDistance;
  });
  return nearbyUsers;
}
// Start server
app.listen(process.env.PORT || port, () => console.log(`BerryMe server listening on port ${process.env.PORT || port}!`));
