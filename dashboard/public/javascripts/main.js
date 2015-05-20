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

app.controller('LondonBusController',londonBusController);
app.controller('MainController',mainController);
app.controller('IntegrationBusController',integrationBusController);
app.controller('DepotController',["$scope","DepotEventFactory",depotController]);
app.factory('AssetRecordFactory',assetRecordFactory);
app.factory('DepotEventFactory',depotEventFactory);
app.factory('WarehouseEventFactory',warehouseEventFactory);
app.controller('AssetRecordController',["$scope","AssetRecordFactory",assetRecordController]);
app.controller('WarehouseController',["$scope","WarehouseEventFactory",warehouseController]);
app.directive('pmdDbInvoke',["$rootScope","AssetRecordFactory",pmdDbInvokeDirective]);
app.directive('pmdDepotEvent',["$rootScope","DepotEventFactory",pmdDepotEventDirective]);
app.directive('pmdWarehouseEvent',["$rootScope","WarehouseEventFactory",pmdWarehouseEventDirective]);
function mainController($scope){
  $scope.showCharts=false;
  $scope.toggleCharts=function(){
    $scope.showCharts=true;
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
          .duration(300)
          .delay(0)
          .attr("cx",530)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(200)
            .delay(0)
            .attr("cy",740)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(300)            
              .delay(0)
              .attr("r",85)
              .attrTween("opacity",function(d,i,a){
                return d3.interpolate(1, 0.01)
              })
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attr("opacity",0);
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
        //TODO - can we derive these scope attributes from the widgetSpec factory?
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
          .delay(0)
          .attr("cx",108)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(200)
            .delay(0)
            .attr("cy",950)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(300)            
              .delay(0)
              .attr("r",85)
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attrTween("opacity",function(d,i,a){
                  return d3.interpolate(1, 0.01)
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
        //TODO - can we derive these scope attributes from the widgetSpec factory?
      scope:{        
      },
      link: link
    };

    function link(scope,iElement,iAttrs){
      //$rootScope.$watch('assetLookUps'
      WarehouseEventFactory.on(function(){
        d3.select(iElement[0]).append("circle")
          .attr("r",8)
          .attr("cx",315)
          .attr("cy",850)      
          .attr("fill","#d9182d")
          .transition()
          .duration(300)
          .delay(0)
          .attr("cx",530)
          .each("end",function(){
            d3.select(this)
            .transition()
            .duration(200)
            .delay(0)
            .attr("cy",950)
            .each("end",function(){
              d3.select(this)
              .transition()
              .duration(300)            
              .delay(0)
              .attr("r",85)
              .each("end",function(){
                d3.select(this)
                .transition()
                .duration(200)            
                .delay(0)
                .attrTween("opacity",function(d,i,a){
                  return d3.interpolate(1, 0.01)
                });
              });              
            });            
          });
      });
    }
};

