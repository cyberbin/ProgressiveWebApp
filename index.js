var express = require('express');
var webPush = require('web-push');
var bodyParser = require('body-parser')
var path = require('path')
var fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, "client")))
app.use(bodyParser.json());

const publicVapidKey = "BCNOp6BV178Hp28qOcfhJmXx4uzjg1DLbWKmQCdKnX6OEhhzKrkMtiN4GWiF97u5q1wGaGuGE7bfKhu8KBlH6sU"
const privateVapidKey = "Xy8zJYCXnRkUILlJlhmX0uqEguRC30JqH17AmvWlOK8"
webPush.setVapidDetails('mailto:rg00496620@techmahindra.com', publicVapidKey, privateVapidKey);

app.post('/subscribe', (req, res) => {
  const subscribtion = req.body;
  res.status(201).json();
  const payload = JSON.stringify({ title: 'Hurricane Alert' });
  fs.writeFile("subscription.txt", JSON.stringify(subscribtion), (err) => {
    if (err) console.log(err);
  });
});


app.listen(5000, () => {
  console.log("Listening on 5000");
})


app.post('/alerter', (req, res) => {
  var subscribtion = "";
  fs.readFile("subscription.txt", function (err, buf) {
    subscribtion = JSON.parse(buf);
    res.status(201).json();
    const payload = JSON.stringify(req.body);
    webPush.sendNotification(subscribtion, payload).catch(err => console.log(err));
  });

});