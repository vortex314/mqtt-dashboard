Ext.define('Limero.store.TopicRecords',{
//	requires : 'Limero.model.Topicrecord',
	extend :'Ext.data.Store', 
    model: 'Limero.model.TopicRecord',
    topicPattern:"src/+/system/heap",
    maxLogs : 500,
    data: [],
    listeners : {
    	load : function(){
            var ebPattern = this.topicPattern.replace("+",".*");
            ebPattern = ebPattern.replace("#",".*");
            log(" recording topics : "+ebPattern);
    		eb.on(ebPattern, function (msg) {
                var th = this;
                var mqttStore = this;
                if (msg.topic != undefined) {
                    var index = mqttStore.find('topic', msg.topic);
                    if (index > -1) {
                        var record = mqttStore.getAt(index);
                        record.set('message', msg.message);
                        record.set('time', timeString());
                        record.set('count', record.get('count') + 1);
                    } else {
                        var record = { topic: msg.topic, message: msg.message, count: 1, time: timeString() };
                        mqttStore.add(record);//.map(function (item) { return [item] });
                    }
                    //                    mqttStore.reload();
                }
            })
    	}
    }
 });