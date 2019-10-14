var express = require('express');
var webPush = require('web-push');
var bodyParser = require('body-parser')
var path = require('path')
var fs = require('fs');
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const routes = require('./Route/api');
const Subscription = require('./Model/subscription');

const app = express();

mongoose.connect('mongodb://localhost/gulfCoast')
mongoose.Promise = global.Promise;
app.use(express.static(path.join(__dirname, "client")))
app.use(bodyParser.json());
app.use(routes);

var url = "mongodb://localhost:27017/";




const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'hpwa.eastus.cloudapp.azure.com.crt')),
  key: fs.readFileSync(path.join(__dirname, 'hpwa.eastus.cloudapp.azure.com.key'))
}



const publicVapidKey = "BCNOp6BV178Hp28qOcfhJmXx4uzjg1DLbWKmQCdKnX6OEhhzKrkMtiN4GWiF97u5q1wGaGuGE7bfKhu8KBlH6sU"
const privateVapidKey = "Xy8zJYCXnRkUILlJlhmX0uqEguRC30JqH17AmvWlOK8"
webPush.setVapidDetails('mailto:rg00496620@techmahindra.com', publicVapidKey, privateVapidKey);

app.post('/subscribe', (req, res) => {

  const subscribtion = req.body;
  //console.log("Subscribtion Received :" + JSON.stringify(subscribtion));
  res.status(201).json();
  const payload = JSON.stringify({
    title: 'Hurricane Alert'
  });

  Subscription.find({endpoint :subscribtion.endpoint }).countDocuments()
.then(subs => {
	if(subs == 0){
	  	Subscription.create(req.body).then((info) => {
	  	console.log("Subscription Added");
  		});
	}	
})
.catch(err =>{console.log("Error Adding Subscription")
})


});

https.createServer(httpsOptions, app).listen(443, () => {
  console.log("Listening on 443");
})


app.post('/alerter', (req, res) => {
  console.log("Alert call Received");
  const payload = JSON.stringify(req.body);
  Subscription.find({}).then(subs => {
    subs.forEach((sub) => {
      res.status(201).json();
      webPush.sendNotification(sub, payload).catch(err => console.log(err));
    })
  });
});