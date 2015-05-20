

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


function warehouseEventFactory(){
  var factory = {
    callbacks:[],
    on:function(callback){
      this.callbacks.push(callback);
    }
  };

 var IIB = {
    host : "localhost",
    port : 4414,
    clientId : "warehouse",    
    topic : "IBM/IntegrationBus/TESTNODE_John/Monitoring/default/OrderParts"            
  };
  
  var client = new Paho.MQTT.Client(IIB.host, IIB.port, IIB.clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({
    onSuccess:onConnect
  });  

  function onConnect() {
    
    // Once a connection has been made, make a subscription and send a message.

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

      factory.callbacks.forEach(function(callback){
        callback();
      });

    } catch (err)
    {
      console.log("error in onMessageArrived");
      console.dir(err);
    }
  };

  return factory;

}


function warehouseController($scope,WarehouseEventFactory){
  $scope.numberOfOrders=0;

  WarehouseEventFactory.on(function(){
    $scope.$apply(function(){
      $scope.numberOfOrders++;
      $scope.warehouseOrder=true;
      setTimeout(function(){
        $scope.$apply(function(){
          $scope.warehouseOrder=false;
        });
      },3000);

    });
  });
};
