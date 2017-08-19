
//==============================================================

Ext.define('Limero.view.MqttGridPanel', {
    extend: 'Ext.grid.Panel',
    store:'TopicRecords',
//    require : ['Limero.store.TopicRecords','Limero.model.TopicRecord'],
    resizable: true,
    draggable: true,
    closable:true,
    bodyPadding: 1,
    height: 300,
    width: 400,
    title: 'topics',
    tools: [{ 
        type:'gear',
        handler: function(e, toolEl, panel, tc){
            var p =  this.up('grid');
            p.menu.show(toolEl, 'tr-br?');     
        }
    }],
    columns: [{
        text: 'Topic',
        width: "35%",
        sortable: true,
        hideable: false,
        dataIndex: 'topic'
    }, {
        text: 'Message',
        width: "40%",
        sortable: true,
        hideable: false,
        dataIndex: 'message'
    }, {
        text: 'Count',
        width: "10%",
        sortable: true,
        hideable: false,
        dataIndex: 'count'
    }, {
        text: 'Time',
        width: "15%",
        sortable: true,
        hideable: false,
        dataIndex: 'time'
    }],
    listeners: {
        afterrender: function (grid) {
            var header = grid.header;
            header.setHeight(20);
            eb.on("src/.*", function (msg) {
                var mqttStore = grid.store;
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
        },

        itemcontextmenu:function(args){
            log('right click');
        },
        dblclick : {
            fn: function(event,t) {
                 console.log("double click");
                 this.up('menu').showAt(event.getXY());
            },
            // You can also pass 'body' if you don't want click on the header or
            // docked elements
            element: 'el'
        } 
    },
    initComponent: function () {
        var me = this;
        this.menu = this.buildMenu();
 /*       Ext.apply(me, {
            store: Ext.create('Limero.store.TopicRecords', {
                model: 'Limero.model.TopicRecord',
                data: []
            })
        });*/
        this.callParent(arguments);
        this.on({ scope: this, itemcontextmenu: this.onItemContextMenu })

    },
    buildMenu: function () {
        return Ext.create('Ext.menu.Menu', {
            items: [{
                id :'do-something',
                text: 'edit'
            }],
            listeners: {
                itemclick: function(item) {
                switch (item.id) {
                    case 'do-something':
                        break;
                    }
                }
            }
        });
    },
    onItemContextMenu: function (view, rec, item, index, event) {
        event.stopEvent();
        this.menu.showAt(event.getXY());
    },
    onDestroy: function () {
        this.menu.destroy();
        this.callParent(arguments);
    },
});

