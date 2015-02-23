
var hostname = '3siysh.messaging.internetofthings.ibmcloud.com';
var clientId = 'd:3siysh:sparkcore:112233445566';
var password = 'efD9gyS3SSX)ogFtsi';
var userName = 'use-token-auth';
/*
var hostname = 'localhost';
var clientId = 'd:3siysh:sparkcore:112233445566';
var password = 'efD9gyS3SSX)ogFtsi';
var userName = 'use-token-auth';
*/

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://' + userName +':'+ password + '@' + hostname + '?clientId=' + clientId );

var milleage=0;
setInterval(function(){
  milleage=milleage+1;
  console.log("publishing");

  var message = '{"d":{"v":"4","vin":"1234","lic":"BUS1","mf":76,"mb":73,"mt":' + milleage + ',"t":"-","tilt":"N"}}';
  client.publish('iot-2/evt/status/fmt/json', message);
  console.log("published");
},500);


//client.end();
