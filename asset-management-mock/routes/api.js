var express = require('express');
var router = express.Router();
router.get('/*', function(req, res) {
  console.log("get -------");
res.send(
  [{"DateFitted":"2014-11-18T00:00:00.000Z",
    "MilleageFitted":20000,
    "id":1,
    "vehicleId":1,
      "partId":1,
      "part":{
        "SKU":"abc001",
          "description":"Fan belt",
          "StockLevel":0,
          "ServiceLimit":10000,
            "id":1
            }},
     {"DateFitted":"2013-10-09T23:00:00.000Z",
       "MilleageFitted":20000,
       "id":2,"vehicleId":1,
         "partId":2,
         "part":{
           "SKU":"abc002",
             "description":"Spark plug",
             "StockLevel":5,
             "ServiceLimit":19999,
               "id":2}}]
  );




});
module.exports = router;

