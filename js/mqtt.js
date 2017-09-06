/*
* ====================================== MQTT class 
*/
class MyMqtt {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.clean_session = true;
        this.use_TLS = false;
        this.path = "/mqtt";
        this.name = "browser." + parseInt(Math.random() * 1000000, 10);
        this.reconnect_timeout = 2;
        this.mqtt = new Paho.MQTT.Client(this.host, this.port, this.path, this.name);
        MyMqtt.instance = this;
    }
    //=======================================================================
    onConnect() {
        log('Connected to ' + this.host + ':' + this.port + " " + this.path); // Connection succeeded; subscribe to our topic
        var topicPattern = "src/" + this.name + "/#";
        log("Subscribe to topic : " + topicPattern);
        this.mqtt.subscribe(topicPattern, { qos: 0 });
        this.publish("src/" + this.name + "/alive", true);
    }
    //=======================================================================
    connect() {
        var options = {
            timeout: 3,
            useSSL: this.use_TLS,
            cleanSession: this.clean_session,
            onSuccess: () => this.onConnect(),
            onFailure: function (message) {
                $('#status').html("Connection failed: " + message.errorMessage + "Retrying");
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
        this.mqtt.disconnect();
    }

    //=======================================================================
    onConnectionLost(response) {
        setTimeout(() => this.connect(), this.reconnect_timeout);
        log("connection lost: " + response.errorMessage + ". Reconnecting");
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
        this.mqtt.subscribe(topicPattern, { qos: 0 });
    }

    //=======================================================================
    onMessageArrived(message) {
        var topic = message.destinationName;
        try {
            var payload = JSON.parse(message.payloadString);
        } catch (error) {
            log(" invalid mqtt message, JSON parsing failed on : " + message.payloadString)
            return;
        }
        log("RXD " + topic + " : " + message.payloadString);
        if (topic.startsWith("src/")) {
            var field = topic.split("/");
            //        log("eventbus => emit : " + "EVENT:" + field[1] + ":" + field[2]);
            eventbus.emit("EVENT:" + field[1] + ":" + field[2], { "#src": field[1], "#event": field[2], "data": payload });
            var jq = "#" + field[1] + "_" + field[2];
        } else if (topic.startsWith("dst/")) {
            if (hasField(payload, '#request')) {
                eventbus.emit("REQUEST:" + payload["#dst"] + ":" + payload["#request"], payload);
            } else if (hasField(payload, '#reply')) {
                eventbus.emit("REPLY:" + payload["#src"] + ":" + payload["#reply"], payload);
            } else {
                log("unknown mqtt message ");
            }
        }
    }

    src() {
        return this.src;
    }
}

var eb = {};

eb.request = function (dst, request, src, data) {
    message = data;
    message["#request"] = request;
    message["#src"] = src;
    message["#dst"] = dst;
    message["id"] = Math.random() * 65536 & 0xFFFF;
    myMqtt.publish("dst/" + dst, JSON.stringify(message));
    //    log(JSON.stringify(message));
};

eb.reply = function (req, data) {
    message = data;
    message["#request"] = req["#request"]
    message["#dst"] = req["#src"];
    message["#src"] = req["#dst"]
    message["id"] = req["id"];
    myMqtt.publish("dst/" + message["#dst"], JSON.stringify(message));
    //    log(JSON.stringify(message));
};

eb.event = function (src, property, data) {
    myMqtt.publish("src/" + src + "/" + property, JSON.stringify(data));
};
