var mqtt;
var reconnectTimeout = 2000;
var model = {};
model.list = [];
model.srcService = "browser." + parseInt(Math.random() * 10000, 10);
devices = {
    "ESP1": {
        "system ": {
            "bootClock": 587958595,
            "localClock": 86875
        }
    },
    "ESP2": {
        "system ": {
            "bootClock": 587958595,
            "localClock": 86875
        }
    }
};
flat = {
    "ESP1/system/bootClock": 6876876,
    "ESP1/system/localClock": 5656
};



function mqttConnect(host, port, path) {
    if (typeof path == "undefined") {
        path = '/mqtt';
    }

    mqtt = new Paho.MQTT.Client(host, port, path);
    var options = {
        timeout: 3,
        useSSL: false,
        cleanSession: false,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(mqttConnect, reconnectTimeout);
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    username = null;
    if (username != null) {
        options.userName = username;
        options.password = password;
    }
    console.log("Host=" + host + ", port=" + port + ", path=" + path);
    mqtt.connect(options);
};

function onConnect() {
    log('Connected to ' + host + ':' + port + path); // Connection succeeded; subscribe to our topic
    log("subscribing to topic : dst/" + model.srcService);
    mqtt.subscribe("dst/" + model.srcService, { qos: 0 });
    log("subscribing to topic : " + "src/services/memory");
    mqtt.subscribe("src/services/memory", { qos: 0 });
    mqttPublish("src/" + model.srcService + "/alive", "true");
}

function mqttSubscribe() {
    mqtt.subscribe("#", { qos: 0 });
}

function onConnectionLost(response) {
    setTimeout(mqttConnect, reconnectTimeout);
    log("connection lost: " + response.errorMessage + ". Reconnecting");

};

function onMessageArrived(message) {

    var topic = message.destinationName;
    var payload = JSON.parse(message.payloadString);
    log("RXD " + topic + " : " + message.payloadString);
    if (topic.startsWith("src/")) {
        field = topic.split("/");
        if (field.length < 3) {
            log("bad topic");
            return;
        };
        service = field[1];
        property = field[2];
        log(" property " + property + " from service " + service + " :" + payload);
    }
    /*    if (topic.startsWith("src/")) {
            field = topic.split("/");
            //        log("eventbus => emit : " + "EVENT:" + field[1] + ":" + field[2]);
            //        eventbus.emit("EVENT:" + field[1] + ":" + field[2], { "#src": field[1], "#event": field[2], "data": payload });
            jq = "#" + field[1] + "_" + field[2];
            $(jq).html(payload);
        } else if (topic.startsWith("dst/")) {
            if (hasField(payload, '#request')) {
                //           log("eventbus => emit : " + "REQUEST:" + payload["#dst"] + ":" + payload["#request"]);
                //            eventbus.emit("REQUEST:" + payload["#dst"] + ":" + payload["#request"], payload);
            } else if (hasField(payload, '#reply')) {
                //            log("eventbus => emit : " + "REPLY:" + payload["#src"] + ":" + payload["#reply"]);
                //            eventbus.emit("REPLY:" + payload["#src"] + ":" + payload["#reply"], payload);
            } else {
                log("unknown mqtt message ");
            }
        }*/
};

function mqttPublish(topic, message) {
    msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    mqtt.send(msg);
    log("TXD " + topic + " : " + message);
}
var eb = {};

eb.request = function (dst, request, src, data) {
    message = data;
    message["#request"] = request;
    message["#src"] = src;
    message["#dst"] = dst;
    message["id"] = Math.random() * 65536 & 0xFFFF;
    mqttPublish("dst/" + dst, JSON.stringify(message));
    //    log(JSON.stringify(message));
};

eb.reply = function (req, data) {
    message = data;
    message["#request"] = req["#request"]
    message["#dst"] = req["#src"];
    message["#src"] = req["#dst"]
    message["id"] = req["id"];
    mqttPublish("dst/" + message["#dst"], JSON.stringify(message));
    //    log(JSON.stringify(message));
};

eb.event = function (src, property, data) {
    mqttPublish("src/" + src + "/" + property, JSON.stringify(data));
};

