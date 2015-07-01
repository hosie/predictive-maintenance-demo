
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


function integrationBusController($scope,$http,iibConnectionFactory){
  var IIBListener =  {
    status:"disconnected",
    msgs:[],
    MQTT:{
      MessagesReceived:0
    },
    File:{      
      BytesWritten:0
    },
    HTTP:{
      TotalMessages:0
    }

  };

  $scope.IIBListener=IIBListener;

  var IIB = {
    host : iibConnectionFactory.host,
    port : iibConnectionFactory.port,
    clientId : "dashboard",    
    topic : "IBM/IntegrationBus/TESTNODE_John/Statistics/JSON/Resource/#"            
  };

  var client = new Paho.MQTT.Client(IIB.host, IIB.port, IIB.clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({
    onSuccess:onConnect
  });  

  function onConnect() {
    $scope.$apply(function(){
      IIBListener.status = "connected";
    });
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
      var resourceStatsObject = JSON.parse(message.payloadString);
      resourceStatsObject.ResourceStatistics.ResourceType.forEach(function(resourceType,i){
        if(resourceType.name == "MQTT")
        {
            
            resourceType.resourceIdentifier.forEach(function(resourceInstance,i){
              if(resourceInstance.name=="tcp://3siysh.messaging.internetofthings.ibmcloud.com:1883"){
                $scope.$apply(function(){
                  
                  IIBListener.MQTT.MessagesReceived = resourceInstance.MessagesReceived;
                });
              }
            });
        }else if(resourceType.name == "File")
        {
            
            resourceType.resourceIdentifier.forEach(function(resourceInstance,i){
              if(resourceInstance.name=="summary"){
                $scope.$apply(function(){
                  
                  IIBListener.File.BytesWritten = resourceInstance.BytesWritten;
                });
              }
            });
        }else if(resourceType.name == "Sockets")
        {
            
            resourceType.resourceIdentifier.forEach(function(resourceInstance,i){
              if(resourceInstance.name=="summary"){
                $scope.$apply(function(){
                  
                  IIBListener.HTTP.TotalMessages = resourceInstance.TotalMessages;
                });
              }

              
            });
        }else{
          //console.log("untracked resource manager " + resourceType.name);
        }
      });
  
  
      $scope.$apply(function(){
        IIBListener.msgs.push(message.destinationName);
      });
    } catch (err)
    {

      console.log("error in onMessageArrived");
      console.dir(err);
    }
  };	
    
};
