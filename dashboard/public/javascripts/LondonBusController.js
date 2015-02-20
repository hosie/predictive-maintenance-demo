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


function londonBusController($scope,$http){
  var bus =  {
    status:"disconnected",
    milleage:0,
    msgs:[]
  };

  $scope.bus=bus;

    var IoT = {
    host : "3siysh.messaging.internetofthings.ibmcloud.com",
    port : 1883,
    clientId : "a:3siysh:dash",
    userName : "a-3siysh-fiux9wzyex",
    password : "bftwcV9@*TZy(iwF)1",
    topic : "iot-2/type/+/id/+/evt/+/fmt/+"
  };
  

  var client = new Paho.MQTT.Client(IoT.host, IoT.port, IoT.clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({
    onSuccess:onConnect,
    userName:IoT.userName,
    password:IoT.password
  });  

  function onConnect() {
    $scope.$apply(function(){
      bus.status = "connected";
    });
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    
    client.subscribe(IoT.topic);
    
  };
  function onConnectionLost(responseObject) {

    $scope.bus.status="connection lost";
    if (responseObject.errorCode !== 0)
  	console.log("onConnectionLost:"+responseObject.errorMessage);
  };
  function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    $scope.$apply(function(){
      bus.msgs.push(message.payloadString);
      var messageObj = JSON.parse(message.payloadString);
      bus.milleage = messageObj.milleage;
    });

    //client.disconnect(); 
  };	
  console.log("after connect");

    
};
