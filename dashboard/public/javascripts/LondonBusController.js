/*
Copyright 2015 IBM
Author John Hosie 
 
The MIT License (MIT) 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

  Contributors:
      John Hosie - initial implementation 
*/

function londonBusEventFactory(){
  var factory = {
    callbacks:[],
    on:function(callback){
      this.callbacks.push(callback);
    }
  };

  /*Pcrockers org*/
    var IoT = {
    host : "88xzb2.messaging.internetofthings.ibmcloud.com",
    port : 1883,
    clientId : "a:88xzb2:dash",
    userName : "a-88xzb2-fcffsvhwxb",
    password : "jRZ!fA)Iw2GDH5eKEm",
    topic : "iot-2/type/+/id/+/evt/+/fmt/+"
  };
  
/*jhosies org
  var IoT = {
    host : "jk6y1t.messaging.internetofthings.ibmcloud.com",
    port : 1883,
    clientId : "a:jk6y1t:dash",
    userName : "a-jk6y1t-jteajwlvon",
    password : "5t?brtl8d+WCUr+VGC",
    topic : "iot-2/type/+/id/+/evt/+/fmt/+"
  };
*/
  var client = new Paho.MQTT.Client(IoT.host, IoT.port, IoT.clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({
    onSuccess:onConnect,
    userName:IoT.userName,
    password:IoT.password
  });  

  function onConnect() {
    
    // Once a connection has been made, make a subscription and send a message.
    
    client.subscribe(IoT.topic);
    
  };
  function onConnectionLost(responseObject) {

    $scope.bus.status="connection lost";
    if (responseObject.errorCode !== 0)
  	console.log("onConnectionLost:"+responseObject.errorMessage);
  };

  function onMessageArrived(message) {
    try
    {

      factory.callbacks.forEach(function(callback){
        callback(message);
      });

    } catch (err)
    {
      console.log("error in onMessageArrived");
      console.dir(err);
    }
  };

  return factory;
  	
}

function londonBusController($rootScope,$scope,LondonBusEventFactory){
  var bus =  {
    status:"disconnected",
    milleage:0,
    msgs:[]
  };
  $rootScope.bleeps={};
  //$scope.bleeps=$rootScope.bleeps;
  $scope.bleeps={};

  $scope.bus=bus;

  LondonBusEventFactory.on( function(message){
    $scope.$apply(function(){
      $scope.bleeps.bleep1=true;
      setTimeout(function(){

        $scope.$apply(function(){
          $scope.bleeps.bleep2=true;
        });
        setTimeout(function(){

            $scope.$apply(function(){
              $scope.bleeps.bleep1=false;
              $scope.bleeps.bleep3=true;
            });
            setTimeout(function(){

              $scope.$apply(function(){
                $scope.bleeps.bleep2=false;

              });
            },50);
            setTimeout(function(){

              $scope.$apply(function(){
                $scope.bleeps.bleep3=false;

              });
            },50);
        },50);


      },50);
      //bus.msgs.push(message.payloadString);
      var messageObj = JSON.parse(message.payloadString);
      bus.milleage = messageObj.d.mt;
    });
  });

    
};
