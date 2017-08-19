Ext.define('Limero.Application', {
    extend: 'Ext.app.Application',

    name: 'Limero',

    stores: [
        //Ext.create('Limero.store.MqttLog')
    ],

    launch: function () {
        Ext.create("Limero.view.MqttConnectPanel", {
            renderTo: Ext.getBody()
        });


    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});