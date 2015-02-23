//***************************************************************
//
// Source File Name: MQTTStats
//
// Description: This file contains the MQTTStats class.
//
/*******************************************************************************
 * Copyright (c) 2014 IBM Corporation and other Contributors
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

import static com.ibm.broker.connector.ContainerServices.writeServiceTraceEntry;
import static com.ibm.broker.connector.ContainerServices.writeServiceTraceExit;

import com.ibm.broker.connector.ConnectorStats;


public class MQTTStats implements ConnectorStats {

	public static final String BytesSent = "BytesSent";
	public static final String BytesReceived = "BytesReceived";
	public static final String MessagesReceived = "MessagesReceived";
	public static final String MessagesSent = "MessagesSent";
	public static final String ClosedConnections = "ClosedConnections";
	public static final String OpenConnections = "OpenConnections";
	public static final String FailedConnections = "FailedConnections";

	@Override
	public String[] getStatsNames() {
		writeServiceTraceEntry("MQTTStats", "getStatsNames", "Entry");
		String[] metricNames = {"OpenConnections", "ClosedConnections", "MessagesReceived", "MessagesSent", "BytesReceived", "BytesSent", "FailedConnections"};
		writeServiceTraceExit("MQTTStats", "getStatsNames", "Exit");
		return metricNames;
	}
}