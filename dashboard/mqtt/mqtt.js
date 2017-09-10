/*
* ====================================== MQTT class
*/
class MyMqtt {
    constructor(host, port) {
        this.topicFilter = "src/+/+/alive";
        this.autoReconnect = false;
        this.host = host;
        this.port = port;
        this.clean_session = true;
        this.use_TLS = false;
        this.path = "/ws";
        this.name = "browser." + parseInt(Math.random() * 1000000, 10);
        this.reconnect_timeout = 20;
        this.connected = false;
        this.topics = [];
        this.topics.push(this.topicFilter);
        this.lwt = {};
        this.lwt.topic = "src/" + this.name + "/system/alive";
        this.lwt.message = "false";
        MyMqtt.instance = this;
    }

    getConfig() {
        return {
            host: this.host,
            port: this.port,
            tls: this.use_TLS,
            topics: this.topics
        }
    }
    //=======================================================================
    onConnected() {
        this.connected = true;
        eb.emitLocal("mqtt/connected");
        log('Connected to ' + this.host + ':' + this.port + " " + this.path); // Connection succeeded; subscribe to our topic
        log("Subscribe to topic : " + this.topicFilter);
        var i;
        for (i = 0; i < this.topics.length; i++)
            this.mqtt.subscribe(this.topics[i], { qos: 0 });
        this.publish(this.lwt.topic, true);
    }
    //=======================================================================
    connect() {
        this.mqtt = new Paho.MQTT.Client(this.host, this.port, this.path, this.name);
        var willMsg = new Paho.MQTT.Message(this.lwt.message);
        willMsg.destinationName = this.lwt.topic;
        willMsg.qos = 0;
        willMsg.retained = false;
        var options = {
            timeout: 3,
            useSSL: this.use_TLS,
            cleanSession: this.clean_session,
            onSuccess: () => this.onConnected(),
            onFailure: function (message) {
                warn("Connection failed: " + message.errorMessage + "Retrying");
                setTimeout(this.connect, this.reconnect_timeout);
            },
            willMessage: willMsg,
            keepAliveInterval: 10
        };
        this.mqtt.onConnectionLost = (resp) => this.onConnectionLost(resp);
        this.mqtt.onMessageArrived = (message) => this.onMessageArrived(message);
        this.mqtt.keepAliveInterval = 20;
        log("Connecting Host=" + this.host + ", port=" + this.port + ", path=" + this.path + " as source " + this.name + " ...");

        try {
            this.mqtt.connect(options);
        } catch (error) {
            log(' mqtt connect failed ' + error);
        }


    }
    //=======================================================================
    disconnect() {
        log("mqtt disconnect");
        this.autoReconnect = false;
        this.connected = false;
        this.mqtt.disconnect();
    }

    //=======================================================================
    onConnectionLost(response) {
        eb.emitLocal("mqtt/disconnected");
        this.connected = false;
        if (this.autoReconnect)
            setTimeout(function () {
                this.connect();
            }, this.reconnect_timeout);
        log("connection lost: " + response.errorMessage + ". Reconnecting :" + this.autoReconnect);
    }
    //=======================================================================
    publish(topic, data, qos = 0, retained = false) {
        var message = JSON.stringify(data);
        var msg = new Paho.MQTT.Message(message);
        msg.destinationName = topic;
        msg.qos = qos;
        msg.retained = retained;
        this.mqtt.send(msg);
        log("publish " + topic + " : " + message);
    }
    //=======================================================================
    subscribe(topicPattern) {
        log("Subscribe to topic : " + topicPattern);
        this.topics.push(topicPattern);
        if (this.mqtt != undefined)
            if (this.connected)
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
