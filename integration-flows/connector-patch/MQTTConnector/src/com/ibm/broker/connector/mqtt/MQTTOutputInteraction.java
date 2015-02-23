//***************************************************************
//
// Source File Name: MQTTOutputInteraction
//,
// Description: This file contains the MQTTOutputInteraction class.
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

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttAsyncClient;
//import org.eclipse.paho.client.mqttv3.MqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttPersistenceException;

import com.ibm.broker.connector.OutputConnector;
import com.ibm.broker.connector.OutputInteraction;
import com.ibm.broker.connector.OutputRecord;
import com.ibm.broker.plugin.MbException;

public class MQTTOutputInteraction extends OutputInteraction {
	private static final String clsName = MQTTOutputInteraction.class.getName();
	public static final String copyright = Copyright.LONG;

	Properties topicTag = new Properties();
	private final String connectionUrl;
	private String topicName = null;
	private int responseTimeout = 30;
	private int qos = 0;
	private MqttAsyncClient client;
	private boolean retained = false;
	private long completionTimeout = 30 * 1000;


	public MQTTOutputInteraction(OutputConnector connector, String connectionUrl, 
		MqttAsyncClient client, String topicName, int qos, int responseTimeout, 
		boolean retained) throws MbException{
		super(connector);
		writeServiceTraceEntry(clsName, "MQTTOutputInteraction", "Entry");
		try {
			this.connectionUrl = connectionUrl;
			this.qos = qos;
			this.responseTimeout = responseTimeout;
			this.topicName = topicName;
			this.client = client;
			this.retained = retained;
			topicTag.put("Topic", topicName);
			topicTag.put("connectionUrl", connectionUrl);			
		} finally {
			writeServiceTraceExit(clsName, "MQTTOutputInteraction", "Exit");
		}
	}

	@Override
	public Properties send(Properties overrideProps, OutputRecord record) throws MbException {
		writeServiceTraceEntry(clsName, "send", "Entry");
		try {
			writeServiceTraceData(clsName, "send Override properties", overrideProps.toString()); 
			String overrideTopic = 	overrideProps.getProperty("TopicName", 
									overrideProps.getProperty("topicName", topicName));
			
			boolean boolRetained = 
					this.getMQTTSession().getBooleanFlag(overrideProps.getProperty("retained"), retained);
					
			String strQos = overrideProps.getProperty("qos",
							overrideProps.getProperty("qualityOfService",
							overrideProps.getProperty("QualityOfService")));
			int iQos = strQos == null ? this.qos : Integer.parseInt(strQos);

			writeServiceTraceData(clsName, "send Message properties topicName:retained:qos =", 
					overrideTopic+":"+Boolean.toString(boolRetained)+":"+Integer.toString(iQos));
			
			// Construct the message to publish
			MqttMessage message = new MqttMessage(record.getByteData());
			message.setQos(iQos);
			message.setRetained(boolRetained);
			IMqttDeliveryToken token = null;
			try {
				writeServiceTraceData(clsName, "send", "Sending: " + record.getUTF8Data());
				getMQTTSession().checkConnection();
//				MqttTopic topic = client.getTopic(overrideTopic);
				token = client.publish(overrideTopic, message);
				// If a qos 1 | 2 message has not completed correctly within the timeout, 
				// disconnect & reconnect the client to allow it to retry the pending message.
				if (iQos > 0 && tokenTimedOut(token)) {
					client.disconnect().waitForCompletion(completionTimeout);
					getMQTTSession().checkConnection();
					// If it still fails, we have a problem ...
					if (tokenTimedOut(token)) {
						getConnector().getConnectorFactory().getContainerServices()
						.throwMbRecoverableException("12099", new String[] {topicName, Integer.toString(qos)});
					}
				}
				getConnector().incrementStatValue(connectionUrl, MQTTStats.MessagesSent);	
				getConnector().incrementStatValue(connectionUrl, MQTTStats.BytesSent, message.getPayload().length);
			} catch (MqttPersistenceException e) {
				getConnector().getConnectorFactory().getContainerServices()
				.throwMbRecoverableException("4311", new String[] {getConnector().getName(), topicName, connectionUrl,
						client.getClientId(), e.getMessage(), Arrays.toString(e.getStackTrace())});
			} catch (MqttException e) {
				getConnector().getConnectorFactory().getContainerServices()
				.throwMbRecoverableException("4311", new String[] {getConnector().getName(), topicName, connectionUrl,
						client.getClientId(), e.getMessage(), Arrays.toString(e.getStackTrace())});
			}
			Properties returnProperties = new Properties();
			if (token != null) {
				returnProperties.put("DeliveryToken/isComplete", token.isComplete());
			}
			returnProperties.put("ClientId", client.getClientId());
			writeServiceTraceData(clsName, "send", "Returning: " + returnProperties.toString());
			return returnProperties;
		} finally {
			writeServiceTraceExit(clsName, "send", "Exit");
		}
	}
	@Override
	public String sentDestination(){
		return topicName;
	}

	@Override
	public void terminate() throws MbException {
		writeServiceTraceEntry(clsName, "terminate", "Entry");
		writeServiceTraceExit(clsName, "terminate", "Exit");
	}
	
	@Override
	public void logSend() throws MbException {
		topicTag.put("Topic", sentDestination());
		getConnector().writeActivityLog("12097", new String[]{sentDestination(), "" + qos},topicTag);
	}

	MQTTOutputConnector getMQTTSession() throws MbException{
		return (MQTTOutputConnector)getConnector();
	}
	
	/**
	 * Tests whether the interaction with the remote server has timed out, ie not completed
	 * within the 'responseTimeout' time limit.
	 * @param token Delivery token representing the interaction
	 * @return flag indicating the interaction has timed out
	 * @throws MqttException any error other than an MqttException.REASON_CODE_CLIENT_TIMEOUT
	 */
	private boolean tokenTimedOut(IMqttDeliveryToken token) throws MqttException {
		try {
			token.waitForCompletion(this.responseTimeout * 1000);
			return !token.isComplete();
		} catch (MqttException e) {
			if (e.getReasonCode() == MqttException.REASON_CODE_CLIENT_TIMEOUT) {
				return true;
			}
			else {
				throw e;
			}
		}
	}

}
