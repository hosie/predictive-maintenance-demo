call mqsistop TESTNODE_John
call mqsideletebroker TESTNODE_John
@rem start queue manager
set PATH=%PATH%;"C:\Program Files (x86)\IBM\WebSphere MQ\bin"
strmqm IB9QMGR

call mqsicreatebroker TESTNODE_John
call mqsistart TESTNODE_John
call mqsicreateexecutiongroup TESTNODE_John -e default

@rem set up environment for SAP nodes
call mqsichangeproperties TESTNODE_John -c EISProviders -o SAP -n nativeLibs,jarsURL -v "C:\John\sapjco3\308\64","C:\John\sapjco3\308\64"
call mqsisetdbparms TESTNODE_John -n MQTT::iotFoundation -u "a-3siysh-fiux9wzyex" -p "bftwcV9@*TZy(iwF)1"
call mqsicreatepolicy TESTNODE_John -t MQTTPublish -f ..\policy\InternalBroker.policy -l InternalBroker
@rem use IoT cloud 
call mqsicreatepolicy TESTNODE_John -t MQTTSubscribe -f ..\policy\BusEvents.policy -l BusEvents
@rem local test mode call mqsicreatepolicy TESTNODE_John -t MQTTSubscribe -f ..\policy\BusEvents.local.policy -l BusEvents
call mqsichangeproperties TESTNODE_John -b pubsub -o BusinessEvents/MQTT -n policyUrl -v /MQTTPublish/InternalBroker.policy
call mqsichangeproperties TESTNODE_John -b pubsub -o BusinessEvents/MQTT -n enabled -v true
call mqsistop TESTNODE_John
call mqsistart TESTNODE_John
@rem build bar file
mkdir output
call mqsipackagebar -a output\demo.bar -w ..\ad -y VehicleMaintenance -k PredictiveMaintenance
call mqsideploy -a output\demo.bar TESTNODE_John -e default
@rem activate flow monitoring
call mqsichangeresourcestats TESTNODE_John -e default -c active
call mqsichangeflowmonitoring TESTNODE_John -e default -c active -j -k PredictiveMaintenance
call mqsichangeflowstats TESTNODE_John -g -c active -j -k PredictiveMaintenance -s -o json -n advanced
@rem call mqsichangeflowstats TESTNODE_John -g -c active -j -k PredictiveMaintenance -a -o json -n advanced

@rem deploy policy
@rem mqsicreatepolicy TESTNODE_John -t MQTTSubscribe -f ..\policy\BusEvents.policy -l BusEvents
@rem mqsichangeproperties TESTNODE_John -e default -o ComIbmJVMManager -n jvmDebugPort -v 1818
