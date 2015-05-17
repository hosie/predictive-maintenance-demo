/*
To connect to service in jhosie org 
org=jk6y1t
type=busSimulator
id=fakeBus01
auth-method=token
auth-token=6a4njnp3+gk2x0R8BH
				 
*/

var hostname = 'jk6y1t.messaging.internetofthings.ibmcloud.com';
var clientId = 'd:jk6y1t:busSimulator:fakeBus01';
var password = '6a4njnp3+gk2x0R8BH';
var userName = 'use-token-auth';
var port     = 1883;

var localmode=false;
if(process.argv[2]=="--localMode")
{
  localmode=true;
}


/*
var hostname = '3siysh.messaging.internetofthings.ibmcloud.com';
var clientId = 'd:3siysh:sparkcore:112233445566';
var password = 'efD9gyS3SSX)ogFtsi';
var userName = 'use-token-auth';
var port     = 1883;
*/
if(localmode)
{
  console.log("Running with local MQTT broker");
  hostname = 'localhost';
  clientId = 'device';
  port = 11883;
  password = '';
  userName = '';
}
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
  client  = mqtt.connect('mqtt://' + userName +':'+ password + '@' + hostname + ':' + port + '?clientId=' + clientId );

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
