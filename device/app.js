var burstMode=false;
var crazyFlag = process.argv[2];
//console.log(crazyFlag);
if(crazyFlag != undefined)
{
  burstMode=true;
}
var intervalBetweenBursts  = 17000; //kick off a crazy burst every 17 seconds
var durationOfBurst        = 5500;  //each crazy busrt lasts for 5 seconds
var messageRateDuringBurst = 100;   //publish a message every 100 ms during the crazy burst
var predictedAverage = ((1000/messageRateDuringBurst)*durationOfBurst/1000)/(intervalBetweenBursts/1000);
var delayToBurst = 26200;
var messageIntervalNormal  = 250;
var durationOfNormalMode   = 22200;
//console.log("predicted average = " + predictedAverage);
var startTime=new Date();
/*
To connect to service in jhosie org 
org=jk6y1t
type=busSimulator
id=fakeBus01
auth-method=token
auth-token=6a4njnp3+gk2x0R8BH
				 
*/

/*
var hostname = 'jk6y1t.messaging.internetofthings.ibmcloud.com';
var clientId = 'd:jk6y1t:busSimulator:fakeBus01';
var password = '6a4njnp3+gk2x0R8BH';
var userName = 'use-token-auth';
var port     = 1883;
*/
/**/
var hostname = "88xzb2.messaging.internetofthings.ibmcloud.com";
var clientId = "d:88xzb2:busSimulator:fakeBus01";
var password = "PfROa-fEwHqKATU6aJ";
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
  //console.log("Running with local MQTT broker");
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

function elapsedTime(){
  var currentTime = new Date();
  return currentTime-startTime;

}

var milleage=0;
var client;
function run(){

  var mqtt    = require('mqtt');
  var connectString = 'mqtt://' + userName +':'+ password + '@' + hostname + ':' + port + '?clientId=' + clientId ;
  //console.log("connecting to " + connectString);
  client  = mqtt.connect(connectString);
  if(durationOfNormalMode>0)
  {
    var normalInterval = setInterval(function(){
      if(milleage<49000)
      {
        milleage=milleage+500;
      }else{
        milleage=500;

      }
      //console.log("publishing");

      var message = '{"d":{"v":"4","vin":"1234","lic":"BUS1","mf":76,"mb":73,"mt":' + milleage + ',"t":"-","tilt":"N"}}';
      client.publish('iot-2/evt/status/fmt/json', message);
      //console.log("published normal");
    },messageIntervalNormal);

    /*if(burstMode)
    {
      setTimeout(function(){
        clearInterval(normalInterval);
      },durationOfNormalMode);
    }*/

  }
  
  if(burstMode)
  {
    setTimeout(function(){
      console.log("Start burstmode");

      crazy();
      setInterval(crazy,intervalBetweenBursts);
    }
    ,delayToBurst);
  }
};
var numberPublished=0;
function crazy(){

  //console.log("start burst " + elapsedTime());
  var average = numberPublished/(elapsedTime()/1000)
  //console.log("average " + average);
  var crazy = setInterval(function(){

    var message = '{"d":{"v":"4","vin":"1234","lic":"BUS1","mf":76,"mb":73,"mt":20000,"t":"-","tilt":"N"}}';
    client.publish('iot-2/evt/status/fmt/json', message);

    numberPublished++;
    //console.log("published crazy");
  },messageRateDuringBurst);

  setTimeout(function(){

    //console.log("end burst " + elapsedTime());
    var average = numberPublished/(elapsedTime()/1000)
    //console.log("average " + average);
    clearInterval(crazy);
    //console.log(elapsedTime());
  },durationOfBurst);
}

setTimeout(run,100);
//client.end();
