//***************************************************************
//
// Source File Name: MQTTInputConnector
//
// Description: This file contains the MQTTInputConnector class.
//
/*******************************************************************************
 * Copyright (c) 2013 IBM Corporation and other Contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM - initial implementation
 *******************************************************************************/


package com.ibm.broker.connector.mqtt;

import static com.ibm.broker.connector.ContainerServices.writeServiceTraceData;
import static com.ibm.broker.connector.ContainerServices.writeServiceTraceEntry;
import static com.ibm.broker.connector.ContainerServices.writeServiceTraceExit;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttAsyncClient;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClientPersistence;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttPersistenceException;
import org.eclipse.paho.client.mqttv3.MqttSecurityException;

import com.ibm.broker.connector.AdminInterface;
import com.ibm.broker.connector.ConnectorFactory;
import com.ibm.broker.connector.Event;
import com.ibm.broker.connector.EventInputConnector;
import com.ibm.broker.connector.PasswordCredential;
import com.ibm.broker.connector.SecurityCredential;
import com.ibm.broker.connector.SecurityIdentity;
import com.ibm.broker.plugin.MbException;
import com.ibm.broker.plugin.MbRecoverableException;

public class MQTTInputConnector extends EventInputConnector implements AdminInterface, MqttCallback {
    public static final String copyright = Copyright.LONG;
    private static final String clsName = MQTTInputConnector.class.getName();

    private MqttAsyncClient client;
    private boolean failedToConnect = false;
    private Properties activityLogTag = new Properties();
    private String connectionUrl = null;
    private MqttClientPersistence dataStore;
    private List<String> dynamicAdminSunscriptions = new ArrayList<String>();
    private AtomicBoolean stopping = new AtomicBoolean(false);
	private long completionTimeout = 30 * 1000;
	private SecurityIdentity securityIdentity;
    
    // The BIP messages will come from the Integration Bus-provided catalog.
    public static final String MESSAGE_CATALOG_NAME = "BIPmsgs";
    public static final String[] ADMINTYPES = new String[]{"Connections"};
    
    
    public MQTTConnectorFactory getMQTTFactory() throws MbException{
        return (MQTTConnectorFactory)getConnectorFactory();
    }
    
    @Override
    public void logNoEvent() throws MbException {
        writeServiceTraceEntry(clsName, "logNoEvent", "Entry");

        try {
			// Use BIP12066 as a message to write out activity log entries
			writeActivityLog("12066",
					new String[] { "" + getProperties().get("topicName") },
					activityLogTag);
		} finally {
			writeServiceTraceExit(clsName, "logNoEvent", "Exit");
		}
    }

    
    public MQTTInputConnector(ConnectorFactory connectorFactory, String name, Properties properties, SecurityIdentity securityIdentity) throws MbException {
        super(connectorFactory, name, properties);
        this.securityIdentity=securityIdentity;
    }
    
    public Properties getActivityLogTag() {
        return activityLogTag;
    }

    public MqttAsyncClient getClient() {
        return client;
    }

    @Override
    public String[] listAdminObjectTypes() throws MbException {
        return ADMINTYPES;
    }

    @Override
    public String[] listAdminObjectsForType(String adminObjectType) throws MbException 
    {
        writeServiceTraceEntry(clsName, "listAdminObjectsForType", "Entry");
        
        try {
			// Wait up to 10 seconds, checking each second if the client has been setup.
			for (int i = 0; i < 10 && client == null; i++) {
				try {
					Thread.sleep(1000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			if (client == null) {
				throw new MbRecoverableException(this,
						"listAdminObjectsForType", MESSAGE_CATALOG_NAME,
						"BIP2111", "Client null",
						new String[] { "Client null" });
			}
			String[] returnValue = new String[] { client.getClientId() };
			return returnValue;
		} finally {
			writeServiceTraceExit(clsName, "listAdminObjectsForType", "Exit");
		}
    }

    @Override
    public Properties listAdminObjectProperties(String adminObjectType, String adminObjectName) throws MbException {
        writeServiceTraceEntry(clsName, "listAdminObjectProperties", "Entry");
        
        Properties properties = new Properties();
        if(adminObjectType.equals("Connections")){
            properties.put("isConnected", client.isConnected());
            properties.put("pendingDeliveryTokens", client.getPendingDeliveryTokens().length);
        }
        
        writeServiceTraceExit(clsName, "listAdminObjectProperties", "Exit");
        return properties;
    }
    
    @Override
	public void changeAdminObject(String adminFunction,
	                              Properties adminParamters, 
	                              String adminObjectType,
	                              String adminObjectName) throws MbException 
	{
	   writeServiceTraceEntry(clsName, "changeAdminObject", "Entry:"+adminFunction);
	
	   try {
		   	String clientId = ""; 
		   	if (client!=null) {
		   		clientId = client.getClientId();
		   	}
		   
			if (adminFunction.equals("connect")) {
				try {
					writeServiceTraceData(clsName, "changeAdminObject",
							"Attempting to connect ...");
					IMqttToken tok = client.connect();
					tok.waitForCompletion(completionTimeout);
					if (!tok.isComplete()) {
						throw new MqttException(MqttException.REASON_CODE_CLIENT_TIMEOUT);
					}
					incrementStatValue(connectionUrl, MQTTStats.OpenConnections);					
					failedToConnect = false;
					writeServiceTraceData(clsName, "changeAdminObject",
							"Connected OK.");
					writeActivityLog("12063", new String[] { connectionUrl },
							activityLogTag);
				} catch (MqttException e) {
					if (failedToConnect == false) {
						failedToConnect = true;
						writeActivityLog("12096", new String[] {connectionUrl, e.getMessage(),clientId},activityLogTag);
						getConnectorFactory().getContainerServices()
							.throwMbRecoverableException(e);
					}
				}
			} else if (adminFunction.equals("disconnect")) {
				try {
					if (client.isConnected()) {
						client.disconnect().waitForCompletion(completionTimeout);
						this.dataStore.clear();
						writeActivityLog("12092", 
							new String[] {connectionUrl},
							activityLogTag);
						incrementStatValue(connectionUrl, MQTTStats.ClosedConnections);
						decrementStatValue(connectionUrl, MQTTStats.OpenConnections);
					}
				} catch (MqttException e) {
					writeActivityLog("12094", 
							new String[] {connectionUrl, e.getMessage()},
							activityLogTag);
					getConnectorFactory().getContainerServices()
							.throwMbRecoverableException(e);
				}
			} else if (adminFunction.equals("subscribe")) {
				String newSubTopic = (String)adminParamters.get("topicName");
				try {
					//Check topic attribute supplied
					writeServiceTraceData(clsName, "changeAdminObject", newSubTopic);
					if (client != null && newSubTopic!= null) {
						int qos = getMQTTFactory().getQos(getProperties());
						client.subscribe(newSubTopic, qos).waitForCompletion(completionTimeout);
						//Add to our list of dynamic admin subscriptions
						dynamicAdminSunscriptions.add(newSubTopic);
					}
				} catch (MqttException e) {
					writeActivityLog("13021", 
							new String[] {newSubTopic, e.getMessage()},
							activityLogTag);
					getConnectorFactory().getContainerServices().throwMbRecoverableException(e);
				}
			} else if (adminFunction.equals("unsubscribe")) {
				String unsubTopic = (String)adminParamters.get("topicName");
				try {
					//Check topic attribute supplied
					writeServiceTraceData(clsName, "changeAdminObject", unsubTopic);
					if (client != null && unsubTopic!= null) {
						client.unsubscribe(unsubTopic);
						dynamicAdminSunscriptions.remove(unsubTopic);
					}
				} catch (MqttException e) {
					writeActivityLog("13022", 
							new String[] {unsubTopic, e.getMessage()},
							activityLogTag);
					getConnectorFactory().getContainerServices()
					.throwMbRecoverableException(e);
				}
			}
			
		} finally {
			writeServiceTraceExit(clsName, "changeAdminObject", "Exit");
		}
	}

	@Override
    public void initialize() throws MbException  {
        writeServiceTraceEntry(clsName, "initialize", "Entry");
        
        try {
			// Tag activity log entries with the topic
			activityLogTag.put("Topic", getProperties()
					.getProperty("topicName"));
			
			this.connectionUrl = getMQTTFactory().getConnectionURL(getProperties());
			String clientId = getProperties().getProperty("clientId");
			activityLogTag.put("connectionUrl", connectionUrl);	
			activityLogTag.put("clientID", clientId);
		} finally {
			writeServiceTraceExit(clsName, "initialize", "Exit");
		}
    }

	@Override
    public void start() throws MbException  {
        writeServiceTraceEntry(clsName, "start", "Entry");
        
        try {
        	stopping.set(false);
			String clientId = getProperties().getProperty("clientId");
			String clientName = clientId;
			if (clientId == null) {
				clientName = getConnectorFactory().getContainerServices()
						.containerName() + getName();
			}
			if (clientName.length() > 23) {
				clientName = clientName.substring(clientName.length() - 23);
			}
			try {
				dataStore = ((MQTTConnectorFactory)getConnectorFactory()).getClientPersistence();
				client = new MqttAsyncClient(connectionUrl, clientName, dataStore);				
				client.setCallback(this);
				connectClient();
				writeActivityLog("12096", 	new String[] {connectionUrl, "",clientId},	activityLogTag);
			} catch (MqttException e) {
				if (failedToConnect == false) {
					failedToConnect = true;

					writeActivityLog("12096", new String[] { connectionUrl, e.getMessage(),clientId},activityLogTag);
					writeActivityLog("12071", new String[] { connectionUrl },activityLogTag);
				}
				getConnectorFactory().getContainerServices()
						.throwMbRecoverableException("12096",new String[] { connectionUrl, e.getMessage(),clientId});
			}
			writeActivityLog("12063", new String[] { connectionUrl },	activityLogTag);
		} finally {
			writeServiceTraceExit(clsName, "start", "Exit");
		}
    }

	private void connectClient() throws MqttSecurityException, MqttException {
        writeServiceTraceEntry(clsName, "connectClient", "Entry");
		try {
			writeServiceTraceData(clsName, "connectClient",	"Attempting to connect ...");
			
			MqttConnectOptions opts = new MqttConnectOptions();
			opts.setMqttVersion(MqttConnectOptions.MQTT_VERSION_3_1);

			SecurityCredential credential = securityIdentity.getCredential();
			if(credential instanceof PasswordCredential){
				String userName;
				char[] password;
				
				userName = ((PasswordCredential) credential).getUserName();
				if(userName!=null && userName.length()>0){
					opts.setUserName(userName);					
				}
				
				password = ((PasswordCredential) credential).getPassword();				
				if(password !=null && password.length>0){
					opts.setPassword(password);														
				}
			}
			IMqttToken tok = client.connect(opts);
			tok.waitForCompletion(completionTimeout);
			if (!tok.isComplete()) {
				throw new MqttException(MqttException.REASON_CODE_CLIENT_TIMEOUT);
			}
			writeActivityLog("12063", new String[] { connectionUrl },
					activityLogTag);
			incrementStatValue(connectionUrl, MQTTStats.OpenConnections);
			
			if (!getProperties().containsKey("testConnection") && !getProperties().containsKey("TestConnection")) {
				// QoS defaults to 0.
				int qos = getMQTTFactory().getQos(getProperties()); 
				client.subscribe(getProperties().getProperty("topicName"), qos);
				//Now subscribe to any dynamic topics that have been made by an admin request
				for (String dynTopicName : dynamicAdminSunscriptions)
				{
					client.subscribe(dynTopicName, qos);
					writeActivityLog("12095", new String[] {dynTopicName, "" + qos}, activityLogTag);
				}
				writeActivityLog("12095", new String[] {getProperties().getProperty("topicName"), "" + qos}, activityLogTag);
			}
			failedToConnect = false;
			writeServiceTraceData(clsName, "connectClient", "Connected OK.");

		} catch (MbException e) {
            try {
            	incrementStatValue(connectionUrl, MQTTStats.FailedConnections);	
                getConnectorFactory().getContainerServices().writeSystemLogError("2111", 
                	new String[]{e.getLocalizedMessage()});
            } catch (MbException e1) {
            }
		}
		finally {
			writeServiceTraceExit(clsName, "connectClient", "Exit");
		}
	}
    
    public void stop() throws MbException  {
        writeServiceTraceEntry(clsName, "stop", "Entry");
        try {
        	stopping.compareAndSet(false, true);
            client.unsubscribe(getProperties().getProperty("topicName")).waitForCompletion(completionTimeout);
            client.disconnect(5000).waitForCompletion(completionTimeout );
			this.dataStore.clear();
			writeActivityLog("12092", 
					new String[] { connectionUrl},
					activityLogTag);
			incrementStatValue(connectionUrl, MQTTStats.ClosedConnections);
			decrementStatValue(connectionUrl, MQTTStats.OpenConnections);
        } 
        catch (MqttPersistenceException e) {
			writeActivityLog("12094", 
					new String[] { connectionUrl, e.getMessage()},
					activityLogTag);
            throw new MbRecoverableException(this, "stop", MESSAGE_CATALOG_NAME, "BIP2111", "MQTT error", new String[]{"MQTT error"});
        } 
        catch (MqttException e) {
			writeActivityLog("12094", 
					new String[] { connectionUrl, e.getMessage()},
					activityLogTag);
            throw new MbRecoverableException(this, "stop", MESSAGE_CATALOG_NAME, "BIP2111", "MQTT error", new String[]{"MQTT error"});
        }
        finally {        	
        	writeServiceTraceExit(clsName, "stop", "Exit");
        }
    }
    
    @Override
    public void connectionLost(Throwable arg0) {
        writeServiceTraceEntry(clsName, "connectionLost", "Entry");
        try {
			incrementStatValue(connectionUrl, MQTTStats.ClosedConnections);	
            writeActivityLog("12062", new String[]{connectionUrl},activityLogTag);
            int attempts = 1;
            while(isStarted() && !client.isConnected()){
                try {
                  connectClient();
                } catch (MqttException e) {
                    try {
						getConnectorFactory().getContainerServices()
							.writeSystemLogError("12096", new String[] {connectionUrl, e.getMessage(), client.getClientId()});
					} catch (Exception e1) {}
                    // Sleep for an increasing amount of time, up to 2 mins max.
                    try {
						Thread.sleep(attempts * 5000);
						attempts += (attempts < 25) ? 1 : 0;  
					} catch (InterruptedException e1) {}
                } 
            }
        } catch (MbException e) {
            try {
                getConnectorFactory().getContainerServices().writeSystemLogError("2111", new String[]{arg0.getLocalizedMessage()});
            } catch (MbException e1) {
            }
        }
        finally {
        	writeServiceTraceExit(clsName, "stop", "Exit");
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken arg0) {
        writeServiceTraceEntry(clsName, "deliveryComplete", "Entry");
        writeServiceTraceExit(clsName, "deliveryComplete", "Exit");
    }

    @Override
    public void messageArrived(String topic, MqttMessage message)
            throws Exception {
        writeServiceTraceEntry(clsName, "messageArrived", "Entry");
        try {
        	if (!stopping.get()) {
				Event[] events = new Event[1];
				events[0] = new MQTTEvent(topic, message);
				deliverEvents(events);
        	}
		} finally {
			writeServiceTraceExit(clsName, "messageArrived", "Exit");
		}
   }

    @Override
    public String adminKey() throws MbException {
        writeServiceTraceEntry(clsName, "adminKey", "Entry");
        writeServiceTraceExit(clsName, "adminKey", "Exit");
        return null;
    }
}
