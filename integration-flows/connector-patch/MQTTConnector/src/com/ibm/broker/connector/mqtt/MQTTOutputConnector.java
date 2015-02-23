//***************************************************************
//
// Source File Name: MQTTOutputConnector
//
// Description: This file contains the MQTTOutputConnector class.
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

import java.util.Arrays;
import java.util.Properties;

import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttAsyncClient;
import org.eclipse.paho.client.mqttv3.MqttClientPersistence;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;

import com.ibm.broker.connector.AdminInterface;
import com.ibm.broker.connector.ConnectorFactory;
import com.ibm.broker.connector.OutputConnector;
import com.ibm.broker.connector.OutputInteraction;
import com.ibm.broker.connector.PasswordCredential;
import com.ibm.broker.connector.SecurityCredential;
import com.ibm.broker.connector.SecurityIdentity;
import com.ibm.broker.plugin.MbException;
import com.ibm.broker.plugin.MbRecoverableException;

public class MQTTOutputConnector extends OutputConnector implements AdminInterface {
    public static final String RETAINED_FLAG_ON = "1";
	public static final String copyright = Copyright.LONG;
    private static final String clsName = MQTTOutputConnector.class.getName();
	private static final String DEFAULT_RESPONSE_TIMEOUT = "30";

    private String connectionUrl = null;
    private String clientId = null;
	private int responseTimeout;
	private MqttClientPersistence dataStore;
	private MqttConnectOptions opts;
	private MqttAsyncClient client;
	private int qos;
	Properties topicTag = new Properties();
	private String topicName;
	private boolean retained = false;
	private long completionTimeout = 30 * 1000;
	private SecurityIdentity securityIdentity;
    
    public static final String[] ADMINTYPES = new String[] { "Connections" };

    public MQTTOutputConnector(ConnectorFactory connectorFactory, 
                               String name,
                               Properties properties,
                               SecurityIdentity securityIdentity) throws MbException 
    {
        super(connectorFactory, name, properties);
        this.securityIdentity=securityIdentity;
    }

     @Override
    public OutputInteraction createOutputInteraction() throws MbException {
        writeServiceTraceEntry(clsName, "createOutputInteraction", "Entry");
        try {
	        MQTTOutputInteraction newContext = 
	        	new MQTTOutputInteraction(this, connectionUrl, client, this.topicName, qos, 
	        			responseTimeout, retained);
	
	        return newContext;
        }
        finally {
            writeServiceTraceExit(clsName, "createOutputInteraction", "Exit");
        }
    }

	@Override
	public void terminate() throws MbException {
		writeServiceTraceEntry(clsName, "terminate", "Entry");
		try {
			if(client.isConnected()) {
			client.disconnect().waitForCompletion(completionTimeout );
			writeActivityLog("12092", new String[] {connectionUrl},	topicTag);
			incrementStatValue(connectionUrl, MQTTStats.ClosedConnections);
			decrementStatValue(connectionUrl, MQTTStats.OpenConnections);
			dataStore.clear();
			}
		} catch (MqttException e) {
			writeActivityLog("12094", new String[] {connectionUrl, e.getMessage()},	topicTag);
			getConnectorFactory().getContainerServices().throwMbRecoverableException(e);
		}
		finally {
			writeServiceTraceExit(clsName, "terminate", "Exit");
		}
    }

    @Override
    public String[] listAdminObjectTypes() throws MbException {
        writeServiceTraceEntry(clsName, "listAdminObjectTypes", "Entry");
        writeServiceTraceExit(clsName, "listAdminObjectTypes", "Exit");
        return ADMINTYPES;
    }

    @Override
    public String[] listAdminObjectsForType(String adminObjectType) throws MbException {
        writeServiceTraceEntry(clsName, "listAdminObjectsForType", "Entry");
        try {
	        String[] returnValue = null;
	        
	        if (adminObjectType.equals("Connections")) {
	            returnValue = new String[1];
	            returnValue[0] = client.getClientId(); 
	        }
	        return returnValue;
        }
        finally {
            writeServiceTraceExit(clsName, "listAdminObjectsForType", "Exit");
        }
    }

    @Override
    public Properties listAdminObjectProperties(String adminObjectType, String adminObjectName) throws MbException {
        writeServiceTraceEntry(clsName, "listAdminObjectProperties", "Entry");

        try {
			Properties properties = new Properties();
			if (adminObjectType.equals("Connections")) {
				if (client.getClientId().equals(adminObjectName)) {
					properties.put("isConnected", client.isConnected());
					properties.put("serverURI", client.getServerURI());
					properties.put("numberOfPendingDeliveryTokens", client.getPendingDeliveryTokens().length);
				}
			}
			return properties;
		} finally {
			writeServiceTraceExit(clsName, "listAdminObjectProperties", "Exit");
		}
    }

    @Override
    public void changeAdminObject(String function, 
                                  Properties newProperties, 
                                  String adminObjectType, 
                                  String adminObjectName) throws MbException 
    {
        writeServiceTraceEntry(clsName, "changeAdminObject", "Entry");
        
        try {
			if (adminObjectType.equals("Connections") && function.equalsIgnoreCase("disconnect")) {
			    if (adminObjectName.equals(client.getClientId())) {
					try {
						client.disconnect().waitForCompletion(completionTimeout);
						writeActivityLog("12092", new String[] {connectionUrl},	topicTag);
						incrementStatValue(connectionUrl, MQTTStats.ClosedConnections);
						decrementStatValue(connectionUrl, MQTTStats.OpenConnections);
						dataStore.clear();
					} catch (MqttException e) {
						writeActivityLog("12094", new String[] {connectionUrl, e.getMessage()},	topicTag);
						getConnectorFactory().getContainerServices().throwMbRecoverableException(e);
					}
			    }
			}
			
		} finally {
	        writeServiceTraceExit(clsName, "changeAdminObject", "Exit");
		}
    }

    @Override
    public String adminKey() throws MbException {
        writeServiceTraceEntry(clsName, "adminKey", "Entry");
        writeServiceTraceExit(clsName, "adminKey", "Exit");
        return null;
    }

	@Override
	public void initialize() throws MbException {
		writeServiceTraceEntry(clsName, "initialize", "Entry");
		try {
			this.connectionUrl = ((MQTTConnectorFactory)getConnectorFactory()).getConnectionURL(getProperties());
			String clientName = getProperties().getProperty("clientId");
			this.clientId = (clientName.length() > 23) ? clientName.substring(clientName.length() - 23) : clientName;
			try {
				this.responseTimeout = Integer.parseInt(
						getProperties().getProperty("responseTimeout", DEFAULT_RESPONSE_TIMEOUT));
			} catch (NumberFormatException e1) {
				getConnectorFactory().getContainerServices().throwMbRecoverableException(e1);
			}
			this.topicName = getProperties().getProperty("topicName");
			this.qos = ((MQTTConnectorFactory)getConnectorFactory()).getQos(getProperties());
			this.retained = getBooleanFlag(getProperties().getProperty("retained"), retained);
			this.dataStore = ((MQTTConnectorFactory)getConnectorFactory()).getClientPersistence();
			this.opts = new MqttConnectOptions();
			// Setting the cleanSession flag off allows us to retry on reconnection any pending qos 1 & 2 messages 
			// that are lost in mid-flight, so set to false for these messages to ensure they are tracked between 
			// sessions.
			opts.setCleanSession(qos == 0);
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
			try {
				client = new MqttAsyncClient(connectionUrl, clientId, dataStore);
			} catch (MqttException e) {
				getConnectorFactory().getContainerServices()
				.throwMbRecoverableException("12096", new String[] {connectionUrl, e.getMessage(), clientId});
			}
			
		} finally {
			writeServiceTraceExit(clsName, "initialize", "Exit");
		}
	}	
	
	public boolean getBooleanFlag(String value, boolean deflt) {
		return value == null ? deflt  
			:	(value.equalsIgnoreCase("true") || value.equalsIgnoreCase("yes") 
				|| value.equals("1") || value.equalsIgnoreCase("on"));
	}

	/**
	 * Handle connecting to the remote MQTT server
	 * @throws MbException
	 * @throws MbRecoverableException
	 */
	void checkConnection() throws MbException, MbRecoverableException {
		writeServiceTraceEntry(clsName, "checkConnection", "Entry");
		try {
			if (!client.isConnected()) {
				writeServiceTraceData(clsName, "checkConnection", "Attempting to connect ...");
				IMqttToken tok = client.connect(opts);
				tok.waitForCompletion(responseTimeout * 1000);
				if (!tok.isComplete()) {
					throw new MqttException(MqttException.REASON_CODE_CLIENT_TIMEOUT);
				}
				writeServiceTraceData(clsName, "checkConnection", "Connected OK.");
				topicTag.put("clientId", client.getClientId());
				writeActivityLog("12063", new String[] {connectionUrl}, topicTag);
				incrementStatValue(connectionUrl, MQTTStats.OpenConnections);
			}
		} catch (MqttException e) {
			incrementStatValue(connectionUrl, MQTTStats.FailedConnections);
			writeActivityLog("12096", new String[] {connectionUrl, e.getMessage(),client.getClientId() }, topicTag);
			
			// Do not throw a recoverable exception here as we want to attempt to publish anyway through the paho client to 
			// get the correct QoS 1 and 2 behaviour
			// checkConnection is called twice in the MQTTOutputInteraction.send() so just log the exception and continue here rather than 
			// creating a hard exception during send()
			writeServiceTraceData(clsName, "checkConnection", "MQTTException: "+e.getReasonCode() + " "+ e.getMessage()+"Stack: "+Arrays.toString(e.getStackTrace()));		
		} finally {
			writeServiceTraceExit(clsName, "checkConnection", "Exit");
		}
	}
	
}
