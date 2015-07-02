@rem drives the device simulator program
@rem run this with any single parameter, for example "start.cmd burst", in order to trigger variable rate in the driver
SET PATH=%PATH%;"C:\Program Files\nodejs"
npm start %*
