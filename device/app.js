
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


  var milleage=0;
  var client;
function run(){

  var mqtt    = require('mqtt');
  client  = mqtt.connect('mqtt://' + userName +':'+ password + '@' + hostname + '?clientId=' + clientId );

    setInterval(function(){
      if(milleage<49000)
      {
        milleage=milleage+500;
      }
      //console.log("publishing");

      var message = '{"d":{"v":"4","vin":"1234","lic":"BUS1","mf":76,"mb":73,"mt":' + milleage + ',"t":"-","tilt":"N"}}';
      client.publish('iot-2/evt/status/fmt/json', message);
      //console.log("published");
    },250);

    //go crazy after 30 secs
    setTimeout(function(){
        setInterval(crazy,20000);
      }
    ,5200);
};

function crazy(){

  var crazy = setInterval(function(){

      var message = '{"d":{"v":"4","vin":"1234","lic":"BUS1","mf":76,"mb":73,"mt":20000,"t":"-","tilt":"N"}}';
      client.publish('iot-2/evt/status/fmt/json', message);
      //console.log("published");
    },100);

    setTimeout(function(){
      clearInterval(crazy);
    },5000);
}

setTimeout(run,10000);
//client.end();
