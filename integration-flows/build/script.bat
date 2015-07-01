@rem Please make sure that the IIB v10 profile has been sourced before running this script
@rem please also make sure that the appropriate WebSphere MQ profile has been sourced, if your installation is not primary
@rem some parameters which define what sort of IIB environment is to be created
@rem please change these to be appropriate for your environment

setlocal
set INTEGRATION_NODE_NAME=PMDEMO_NODE
@rem don't choose a value which clashes with another integration node on the system
@rem make sure these ports agree with other parts of the demo and policy files
set INTEGRATION_NODE_ADMIN_PORT=4569
set INTEGRATION_NODE_MQTT_PORT=11869
@rem this queue manager must match what is in the MQ policy file in this repo
set DEMO_QUEUE_MANAGER=PMDEMO_QMGR

@rem define the servers we need to perform the integration function
@rem we need an integration node and also a queue manager

mqsistop %INTEGRATION_NODE_NAME%
mqsideletebroker %INTEGRATION_NODE_NAME%
endmqm -i %DEMO_QUEUE_MANAGER%
dltmqm %DEMO_QUEUE_MANAGER%

crtmqm %DEMO_QUEUE_MANAGER%
strmqm %DEMO_QUEUE_MANAGER%
if NOT ERRORLEVEL 1 goto qmcreatedok
  echo Failed to start queue manager!
  exit /b 1
:qmcreatedok

runmqsc %DEMO_QUEUE_MANAGER% < qdefs.dat
if NOT ERRORLEVEL 1 goto queuescreatedok
  echo Failed to define queues on %DEMO_QUEUE_MANAGER%
  exit /b 2
:queuescreatedok

@rem set up basic integration server
mqsicreatebroker %INTEGRATION_NODE_NAME%
mqsichangeproperties %INTEGRATION_NODE_NAME% -b webadmin -o HTTPConnector  -n port -v %INTEGRATION_NODE_ADMIN_PORT%
mqsichangeproperties %INTEGRATION_NODE_NAME% -b pubsub -o MQTTServer  -n port -v %INTEGRATION_NODE_MQTT_PORT%
mqsistart %INTEGRATION_NODE_NAME%
call mqsicreateexecutiongroup %INTEGRATION_NODE_NAME% -e default
if NOT ERRORLEVEL 1 goto intnodecreatedok
  echo Failed to define basic integration node %INTEGRATION_NODE_NAME%
  exit /b 3
:intnodecreatedok

@echo Integration node defined, now configure it.

@rem set up environment for SAP nodes
call mqsichangeproperties %INTEGRATION_NODE_NAME% -c EISProviders -o SAP -n nativeLibs,jarsURL -v "C:\John\sapjco3\308\64","C:\John\sapjco3\308\64"
@rem setup policy and credentials to connect to IoT cloud
call mqsisetdbparms %INTEGRATION_NODE_NAME% -n MQTT::iotFoundation -u "a-88xzb2-fcffsvhwxb" -p "jRZ!fA)Iw2GDH5eKEm"
call mqsicreatepolicy %INTEGRATION_NODE_NAME% -t MQTTSubscribe -f ..\policy\BusEvents.policy -l BusEvents
@rem setup other policies to match configuration of local integration node
call mqsicreatepolicy %INTEGRATION_NODE_NAME% -t MQTTPublish -f ..\policy\InternalBroker.policy -l InternalBroker
@rem policy to control the MQ nodes connecting flows together
call mqsicreatepolicy %INTEGRATION_NODE_NAME% -t MQEndpoint -f ..\policy\LocalMaintenanceQmgr.policy -l LocalMaintenanceQmgr
call mqsicreatepolicy %INTEGRATION_NODE_NAME% -t WorkloadManagement -l smoothing -f ..\policy\smoothing.policy
@rem local test mode call mqsicreatepolicy %INTEGRATION_NODE_NAME% -t MQTTSubscribe -f ..\policy\BusEvents.local.policy -l BusEvents
call mqsichangeproperties %INTEGRATION_NODE_NAME% -b pubsub -o BusinessEvents/MQTT -n policyUrl -v /MQTTPublish/InternalBroker.policy
call mqsichangeproperties %INTEGRATION_NODE_NAME% -b pubsub -o BusinessEvents/MQTT -n enabled -v true
call mqsistop %INTEGRATION_NODE_NAME%
call mqsistart %INTEGRATION_NODE_NAME%

@echo Package BAR file and deploy it
mkdir output
call mqsipackagebar -a output\demo.bar -w ..\ad -y VehicleMaintenance -k PredictiveMaintenance
call mqsideploy -a output\demo.bar %INTEGRATION_NODE_NAME% -i localhost -p %INTEGRATION_NODE_ADMIN_PORT% -e default

@echo Activate flow monitoring and statistics on the solution which has been deployed
call mqsichangeresourcestats %INTEGRATION_NODE_NAME% -e default -c active
call mqsichangeflowmonitoring %INTEGRATION_NODE_NAME% -e default -c active -j -k PredictiveMaintenance
call mqsichangeflowstats %INTEGRATION_NODE_NAME% -g -c active -j -k PredictiveMaintenance -s -o json -n advanced
@rem call mqsichangeflowstats %INTEGRATION_NODE_NAME% -g -c active -j -k PredictiveMaintenance -a -o json -n advanced

@rem deploy policy
@rem mqsicreatepolicy %INTEGRATION_NODE_NAME% -t MQTTSubscribe -f ..\policy\BusEvents.policy -l BusEvents
@rem mqsichangeproperties %INTEGRATION_NODE_NAME% -e default -o ComIbmJVMManager -n jvmDebugPort -v 1818

rm C:\Users\IBM_ADMIN\Desktop\VehiclePartReplacements\Today.csv
