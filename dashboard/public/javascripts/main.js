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
var app = angular.module('PredictitiveMaintenanceDashboardApp',['iibWidgets','ui.bootstrap']);

app.controller('MainController',mainController);
app.controller('IntegrationBusController',['$scope','$http','iibConnectionFactory',integrationBusController]);
app.controller('DepotController',["$scope","DepotEventFactory",depotController]);
app.factory('AssetRecordFactory',['iibConnectionFactory',assetRecordFactory]);
app.factory('DepotEventFactory',['iibConnectionFactory',depotEventFactory]);
app.factory('WarehouseEventFactory',['iibConnectionFactory',warehouseEventFactory]);
app.factory('LondonBusEventFactory',londonBusEventFactory);
app.controller('LondonBusController',["$rootScope","$scope","LondonBusEventFactory",londonBusController]);
app.controller('AssetRecordController',["$scope","AssetRecordFactory",assetRecordController]);
app.controller('WarehouseController',["$scope","WarehouseEventFactory",warehouseController]);
app.directive('pmdDbInvoke',["$rootScope","AssetRecordFactory",pmdDbInvokeDirective]);
app.directive('pmdDepotEvent',["$rootScope","DepotEventFactory",pmdDepotEventDirective]);
app.directive('pmdWarehouseEvent',["$rootScope","WarehouseEventFactory",pmdWarehouseEventDirective]);
app.directive('pmdLondonBusFeed',["$rootScope","LondonBusEventFactory",pmdLondonBusFeedDirective]);
app.factory('iibConnectionFactory',function(){
  return {
    host : "localhost",
    port : 4569,
    integrationNodeName : "PMDEMO_NODE"
  };
});

function mainController($scope){
  
  $scope.showCharts=false;
  $scope.toggleCharts=function(){
    $scope.showCharts= !$scope.showCharts;
  }
}
function pmdDbInvokeDirective($rootScope,AssetRecordFactory){
    var iibSubscriber=iibSubscriber; 
    
    return {
      restrict: 'EAC',
      scope:{        
      },
      link: link
    };

    function link(scope,iElement,iAttrs){
      AssetRecordFactory.on(function(){
        d3.select(iElement[0]).append("circle")
          .attr("r",8)
          .attr("cx",315)
          .attr("cy",850)      
          .attr("fill","#d9182d")
          .transition()
          .duration(100)
          .delay(0)
          .attr("cy",800)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(300)
            .delay(0)
            .attr("cx",530)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(100)
              .delay(0)
              .attr("cy",740)
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attr("r",85)
                .attrTween("opacity",function(d,i,a){
                  return d3.interpolate(1, 0.01)
                }).each("end",function(){
                  d3.select(this)
                  .transition()
                  .duration(200)            
                  .delay(100)
                  .attr("r",8)
                  .attrTween("opacity",function(d,i,a){
                    return d3.interpolate(0.1, 1)
                  }).each("end",function(){
                    d3.select(this)
                    .transition()
                    .duration(100)            
                    .delay(0)                  
                    .attr("cy",800)
                    .each("end",function(){
                      d3.select(this)
                      .transition()
                      .duration(300)            
                      .delay(0)                  
                      .attr("cx",315)
                      .each("end",function(){
                        d3.select(this)
                        .transition()
                        .duration(100)            
                        .delay(0)                  
                        .attr("cy",850);
                      });                    
                    });
                  });
                });
              });            
            });
          });
      });
    }
};


function pmdDepotEventDirective($rootScope,DepotEventFactory){
    var iibSubscriber=iibSubscriber; 
    
    return {
      restrict: 'EAC',
        
      scope:{        
      },
      link: link
    };

    function link(scope,iElement,iAttrs){
      DepotEventFactory.on(function(){
        d3.select(iElement[0]).append("circle")
          .attr("r",8)
          .attr("cx",315)
          .attr("cy",850)      
          .attr("fill","#d9182d")
          .transition()
          .duration(300)
          .delay(1500)
          .attr("cy",900)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(200)
            .delay(0)
            .attr("cx",108)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(300)            
              .delay(0)
              .attr("cy",950)            
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attr("r",85)              
                .attrTween("opacity",function(d,i,a){
                  return d3.interpolate(1, 0.1)
                }).each("end",function(){
                  d3.select(this)
                  .attr("opacity",0);
                });
              });              
            });            
          });
      });
    }
};


function pmdWarehouseEventDirective($rootScope,WarehouseEventFactory){
    var iibSubscriber=iibSubscriber; 
    
    return {
      restrict: 'EAC',
        
      scope:{        
      },
      link: link
    };

    function link(scope,iElement,iAttrs){
      WarehouseEventFactory.on(function(){
        d3.select(iElement[0]).append("circle")
          .attr("r",8)
          .attr("cx",315)
          .attr("cy",850)      
          .attr("fill","#d9182d")
          .transition()
          .duration(300)
          .delay(1500)
          .attr("cy",900)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(200)
            .delay(0)
            .attr("cx",530)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(300)            
              .delay(0)
              .attr("cy",950)
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attr("r",85)              
                .attrTween("opacity",function(d,i,a){
                  return d3.interpolate(1, 0.01)
                }).each("end",function(){
                  d3.select(this)
                  .attr("opacity",0);
                });
              });              
            });            
          });
      });
    }
};

function pmdLondonBusFeedDirective($rootScope,LondonBusEventFactory){
    var iibSubscriber=iibSubscriber; 
    
        
    return {
      restrict: 'EAC',
        
      scope:{        
      },
      link: link
    };
    
    
    
    function link(scope,iElement,iAttrs){
      
      var interval;
      var pulsing=false;
      var timeout=undefined;
      var line = d3.select(iElement[0]).append("path");
      
      function scheduleExipry(){
        if(timeout!=undefined){
            clearTimeout(timeout);
        }
        timeout = setTimeout(function(){
          pulsing=false;
          
        },1000);//timeout after a second
                    
      }
      
      
      LondonBusEventFactory.on(function(){
        scheduleExipry();
        
        
        function pulseIn(){
          var transistion = d3.select(this)
              .transition()
              .duration(300)
              .delay(0)
              .attr("stroke-width",5);
          
            transistion.each("end",function(){
              if(pulsing){
                pulseOut.call(line);                
              }else{
                line.attr("stroke-width",0)
              }
            });                     
        }
        
        function pulseOut(){
          this
            .transition()
            .duration(300)
            .delay(0)
            .attr("stroke-width",1)
            .each("end",pulseIn);
          
        }        
        
        if(false==pulsing){
          pulsing=true;
          line.attr("d","m 90,690 100,0 0,160 112.41548,0")
              .attr("stroke","red")
              .attr("fill","none")
              .attr("stroke-width",1)
              .call(function(){
                pulseOut.call(line);                
              });
        }
     
      });
    }
};
