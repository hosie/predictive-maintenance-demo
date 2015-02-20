

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


function depotController($scope){
  
  var IIB = {
    host : "localhost",
    port : 4414,
    clientId : "depot",    
    topic : "IBM/IntegrationBus/TESTNODE_John/Monitoring/default/ScheduleMaintenance"            
  };

  var client = new Paho.MQTT.Client(IIB.host, IIB.port, IIB.clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({
    onSuccess:onConnect
  });  

  function onConnect() {
    $scope.$apply(function(){
      $scope.status = "connected";
    });
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    
    var options = {
              qos:0,
              onFailure: function(responseObject) {
                      console.log("failure");
              }
          };
          
    client.subscribe(IIB.topic,options);
    
  };
  function onConnectionLost(responseObject) {

    $scope.status="connection lost";
    if (responseObject.errorCode !== 0)
  	console.log("onConnectionLost:"+responseObject.errorMessage);
  };
  function onMessageArrived(message) {
    try
    {
      console.log("onMessageArrived:");//+message.payloadString);
      
  
  
      $scope.$apply(function(){
        $scope.newServiceScheduled=true;
        setTimeout(function(){
          $scope.$apply(function(){
            $scope.newServiceScheduled=false;
          });
        },1000);
        
      });
    } catch (err)
    {

      console.log("error in onMessageArrived");
      console.dir(err);
    }
  };	
  console.log("after connect");
    
};
