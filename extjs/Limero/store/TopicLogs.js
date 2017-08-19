Ext.define('Limero.store.TopicLogs',{
	requires : 'Limero.model.TopicLog',
	extend :'Ext.data.Store', 
    model: 'Limero.model.TopicLog',
    topicPattern:"src/+/system/heap",
    maxLogs : 500,
    data: [],
    listeners : {
    	load : function(){
            var ebPattern = this.topicPattern.replace("+",".*");
            ebPattern = ebPattern.replace("#",".*");
    		eb.on(ebPattern, function (msg) {
                var th = this;
                var mqttStore = this;
                if (msg.topic != undefined) {
                        var record = { 
                        	topic: msg.topic, 
                        	message: JSON.parse(msg.message), 
                        	time: new Date() 
                        };
                        mqttStore.add(record);//.map(function (item) { return [item] })
                    if (mqttStore.count() > maxLogs ) {
                		mqttStore.removeAt(0);
            			};
                }
            })
    	}
    }
 });