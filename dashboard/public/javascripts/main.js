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
var app = angular.module('PredictitiveMaintenanceDashboardApp',['ui.bootstrap']);

app.controller('LondonBusController',londonBusController);
app.controller('IntegrationBusController',integrationBusController);
app.controller('DepotController',depotController);
app.factory('AssetRecordFactory',assetRecordFactory);
app.controller('AssetRecordController',["$scope","AssetRecordFactory",assetRecordController]);
app.controller('WarehouseController',warehouseController);
app.directive('pmdDbInvoke',["$rootScope","AssetRecordFactory",pmdDbInvokeDirective]);

function pmdDbInvokeDirective($rootScope,AssetRecordFactory){
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
      AssetRecordFactory.on(function(){
        d3.select(iElement[0]).append("circle")
          .attr("r",8)
          .attr("cx",314.34583)
          .attr("cy",851.01007)      
          .attr("fill","gray")
          .transition()
          .duration(1000)
          .attr("r",85)
          .attr("cx",530.15063)
          .attr("cy",742.94342)
          .each("end",function(){
            d3.select(this).transition().duration(200).attr("r",0);
          })
          ;
      });
    }
};
