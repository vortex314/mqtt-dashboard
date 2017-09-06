/*
* ====================================== MQTT class 
*/
class MyMqtt {
    constructor(host, port) {
        this.topicFilter = "src/+/+/alive";
        this.autoReconnect = true;
        this.host = host;
        this.port = port;
        this.clean_session = true;
        this.use_TLS = false;
        this.path = "/mqtt";
        this.name = "browser." + parseInt(Math.random() * 1000000, 10);
        this.reconnect_timeout = 20;
        this.connected = false;
        this.topics = [];
        this.topics.push(this.topicFilter);
        MyMqtt.instance = this;
    }
    //=======================================================================
    onConnect() {
        this.connected = true;
        eb.emitLocal("mqtt/connected");
        log('Connected to ' + this.host + ':' + this.port + " " + this.path); // Connection succeeded; subscribe to our topic
        log("Subscribe to topic : " + this.topicFilter);
        var i;
        for (i = 0; i < this.topics.length; i++)
            this.mqtt.subscribe(this.topics[i], { qos: 0 });
        this.publish("src/" + this.name + "/alive", true);
    }
    //=======================================================================
    connect() {
        this.mqtt = new Paho.MQTT.Client(this.host, this.port, this.path, this.name);
        var options = {
            timeout: 3,
            useSSL: this.use_TLS,
            cleanSession: this.clean_session,
            onSuccess: () => this.onConnect(),
            onFailure: function (message) {
                warn("Connection failed: " + message.errorMessage + "Retrying");
                setTimeout(this.connect, this.reconnect_timeout);
            }
        };
        this.mqtt.onConnectionLost = (resp) => this.onConnectionLost(resp);
        this.mqtt.onMessageArrived = (message) => this.onMessageArrived(message);
        log("Connecting Host=" + this.host + ", port=" + this.port + ", path=" + this.path + " as source " + this.name + " ...");
        var willMsg = new Paho.MQTT.Message("false");
        willMsg.destinationName = "src/" + this.src + "/alive";
        var lastWillOption = { willMessage: willMsg };
        try {
            this.mqtt.connect(options, lastWillOption);
        } catch (error) {
            log(' mqtt connect failed ' + error);
        }


    }
    //=======================================================================
    disconnect() {
        this.autoReconnect = false;
        this.mqtt.disconnect();
    }

    //=======================================================================
    onConnectionLost(response) {
        eb.emitLocal("mqtt/disconnected");
        this.connected = false;
        if (this.autoReconnect)
            setTimeout(() => this.connect(), this.reconnect_timeout);
        log("connection lost: " + response.errorMessage + ". Reconnecting :" + this.autoReconnect);
    }
    //=======================================================================
    publish(topic, data) {
        var message = JSON.stringify(data);
        var msg = new Paho.MQTT.Message(message);
        msg.destinationName = topic;
        this.mqtt.send(msg);
        log("publish " + topic + " : " + message);
    }
    //=======================================================================
    subscribe(topicPattern) {
        log("Subscribe to topic : " + topicPattern);
        this.topics.push(topicPattern);
        if (this.mqtt != undefined)
            this.mqtt.subscribe(topicPattern, { qos: 0 });
    }

    unsubscribe(topicPattern) {
        log("Unsubscribe to topic : " + topicPattern);
        var index = this.topics.indexOf(topicPattern)
        if (index > -1) this.topics.splice(index, 1);
        if (this.connected == true)
            this.mqtt.unsubscribe(topicPattern, {
                onSuccess: function () {
                    log("Succeed unsubscribed");
                },
                onFailure: function (context) {
                    log("Failed unsubscribed" + context.errorMessage);
                }
            });
    }

    //=======================================================================
    onMessageArrived(message) {
        var topic = message.destinationName;
        eb.emit(topic, { "topic": message.destinationName, "message": message.payloadString });
        //        eb.emitLocal("mqtt/publish", { "topic": message.destinationName, "message": message.payloadString });
    }

    src() {
        return this.src;
    }
}

