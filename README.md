To demonstrate this scenario
    1) Configure the IoT foundation. TODO - add instructions for this.  For now, the demo is hard coded to use the organisation owned by Peter Crocker
                                     At the very least, we should describe how to use a local MQ Queue manager as the MQTT broker.
    2) Build and deploy the integrations.
            Run the batch script .\integration-flows\build\script.bat 
            You may need to edit it to suit your local environment

    3) Start the HTTP server for the mock asset management system
            Edit (if necessary) and run   .\asset-management-mock\start.cmd

    4) Start the server for the dashboard        
            Edit (if necessary) and run   .\dashboard\start.cmd

    5) Open the dashboard in a browser  ( localhost:3000)

    6) Using the hyperlinks on the top right of the dashboard, open the individual flows in separate tabs

    7) Start the device emulator.
            Edit (if necessary) and run   .\device\start.cmd

    8) Observe the dashboard visualisations of the activity
            You will see the milleage for the bus increasing.  Here, the dashboard has subscribed to events from the device on the London bus.
            You will see that the Integration Bus reports a number of MQTT messages being received.  The Integration Bus is subscribing to those same events that report the milleage.
            Occasionally ( every 10 000 miles) you will see the icon flashing to indicate that Asset Records backend has been read.
            The Integration Bus->"Number of HTTP messages" metric increases to show how many times that has happened ( there is some delay in this number updating as it is using IIB flow stats which are only published at periodic intervals)
            When the milleage eventually hits 40 000 miles, you will also see the  Local Depot and National Warehouse icons flashing to indicate that a maintentance service has been scheduled and spare parts have been ordered.
            When you see the icons flashing on the dashboard, that is triggered by the IIB Flow monitoring events showing exactly when we are reading the asset management database, writing the maintenance schedule file and sending the IDOC to SAP.

    9) Switch to the other tabs and observe the graphs for each flow 
	        The graphs show that the filterEvents flow is processing many more messages that the readAssetRecord flow, therefore the filtering in IIB is being used to limit how often we hit the backends in response to the IoT events.  
	        However, there are still spikes in the traffic ( this would happen in this scenario, for example, if all busses in the fleet happened to publish a mileage that is a multiple of 10000 at the same time).  
            After 40 000 miles, the device emuator goes into a loop of causing these regular spikes in traffic to the readAssetRecord flow - emulating the case where lots of London buses in the fleet hit a 10000 mark at the same time. So those events are not filtered out. 

    10) Define a workload management policy and attach it to the readAssetRecord flow to smooth out the spikes.

    11) Open the toolkit and import the projects in .\integration-flows\ad
            Poke around and show the JSON mapping etc and how to create a DFDL schema for CSV
            Using the test messages in .\integration-flows\ad\Test drive one of the flows (e.g. DecideAction) using the AD test tools ( flow exerciser)
