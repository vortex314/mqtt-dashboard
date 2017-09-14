var app = angular.module('mqtt-dashboard', ['oc.lazyLoad', 'nvd3', 'gridster', 'plunker.services', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ngSanitize']);

app.controller('MainCtrl', function ($scope, $timeout, $interval, DataService, $uibModal) {

  $scope.gridsterOptions = {
    margins: [1, 1],
    columns: 12,
    mobileModeEnabled: false,
    draggable: {
      handle: 'h3'
    },
    resizable: {
      enabled: true,
      handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],

      // optional callback fired when resize is started
      start: function (event, $element, widget) { },

      // optional callback fired when item is resized,
      resize: function (event, $element, widget) {
        if (widget.context.api.update) widget.context.api.update();
      },

      // optional callback fired when item is finished resizing
      stop: function (event, $element, widget) {
        $timeout(function () {
          if (widget.context.api.update) widget.context.api.update();
        }, 400)
      }
    },
  };

  $scope.dashboard = {
    widgets: [{
      col: 0,
      row: 0,
      sizeY: 2,
      sizeX: 2,
      context: {
        html: 'alive.html',
        ctrl: '',
        topics: 'src/+/system/alive',
        mqttController: 'MqttStateCtrl',
        api: {}
      }
    }, {
      col: 2,
      row: 0,
      sizeY: 2,
      sizeX: 2,
      context: {
        html: 'widgetLineChart.html',
        ctrl: 'widgetLineChartCtrl.js',
        topics: '$SYS/broker/load/messages/received/#',
        mqttController: 'MqttHistoryCtrl',
        api: {}
      }
    }, {
      col: 0,
      row: 2,
      sizeY: 2,
      sizeX: 3,
      context: {
        html: 'widgetLineChart.html',
        ctrl: 'widgetLineChartCtrl.js',
        topics: '$SYS/broker/load/messages/received/1min',
        mqttController: '',
        api: {}
      }
    }, {
      col: 0,
      row: 2,
      sizeY: 2,
      sizeX: 3,
      context: {
        html: 'widgetLineChart.html',
        ctrl: 'widgetLineChartCtrl.js',
        topics: 'src/+/system/heap',
        mqttController: '',
        api: {}
      }
    }, {
      col: 4,
      row: 2,
      sizeY: 1,
      sizeX: 1,
      context: {
        html: 'textarea.html',
        ctrl: '',
        topics: 'src/dashboards/test/#',
        mqttController: 'MqttStateCtrl',
        api: {}
      }
    }, {
      col: 4,
      row: 2,
      sizeY: 1,
      sizeX: 1,
      context: {
        html: 'text.html',
        ctrl: '',
        topics: 'src/+/system/upTime',
        mqttController: 'MqttStateCtrl',
        api: {}
      }
    }]
  };

  $scope.addWidget = function () {
    $scope.dashboard.widgets.push({
      col: 4,
      row: 2,
      sizeY: 1,
      sizeX: 1,
      context: {
        html: 'grid.html',
        ctrl: 'gridCtrl.js',
        topics: 'src/+/system/alive',
        mqttController: 'MqttStateCtrl',
        api: {}
      }
    });
  }

  $scope.removeWidget = function (widget) {
    $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
  }

  $scope.settingsWidget = function (widget) {
    $uibModal.open({
      scope: $scope,
      templateUrl: '/dashboard/main/widget_settings.html',
      controller: 'WidgetSettingsCtrl',
      resolve: {
        widget: function () {
          return widget;
        }
      }
    });
  };

  $scope.saveLayout = function () {
    log("saving layout ... ");
    var config = $scope.mqtt.getConfig();
    config.layout = $scope.dashboard;
    config.updated = new Date();
    log(JSON.stringify(config));
    $scope.mqtt.publish("src/dashboards/test/1", JSON.stringify(config), 1, true);
  }
  //=================================================================================
  $scope.clear = function () {
    $scope.mqttData.length = 0;
  }

  // We want to manually handle `window.resize` event in each directive.
  // So that we emulate `resize` event using $broadcast method and internally subscribe to this event in each directive
  // Define event handler
  $scope.events = {
    resize: function (e, scope) {
      $timeout(function () {
        scope.api.update()
      }, 200)
    }
  };
  angular.element(window).on('resize', function (e) {
    $scope.$broadcast('resize');
  });

  // We want to hide the charts until the grid will be created and all widths and heights will be defined.
  // So that use `visible` property in config attribute
  $scope.config = {
    visible: false
  };
  $timeout(function () {
    $scope.config.visible = true;
  }, 200);

  $scope.defaultConfig = defaultConfig();

  $scope.init = function () {

  }
  // ================================= EB part
  eb = Minibus.create();

  eb.on(".*", function (arg) {
    log('EB => ' + JSON.stringify(arg));
    $scope.ebMessage = JSON.stringify(arg);
    //   $scope.safeApply();
  });
  eb.emit("test eb", {
    "event": "init"
  });
  eb.onLocal("mqtt/connected", function (e) {
    log("=== CONNECTED =====" + JSON.stringify(e) + "=================")
  });
  //=================================================== UPDATE 
  $scope.safeApply = function (fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
  $interval(function () {
    $scope.safeApply();
  }, 1000);
  // ================================= MQTT connection PART

  $scope.mqttHostPorts = ["limero.ddns.net:1884", "limero.ddns.net:1886", "test.mosquitto.org:8080", "broker.mqttdashboard.com:8000", "test.mosca.io:80", "broker.hivemq.com:8000", "iot.eclipse.org:80"];
  $scope.mqttHostPort = "limero.ddns.net:1886";
  $scope.mqtt = new MyMqtt("limero.ddns.net", 1886);

  eb.onLocal("mqtt/.*", function (ev) {
    //  $scope.safeApply();
  });


  $scope.mqttConnect = function () {
    $scope.mqtt.host = $scope.mqttHostPort.split(':')[0];
    $scope.mqtt.port = Number($scope.mqttHostPort.split(':')[1]);
    $scope.mqtt.connect();
    //    $scope.mqtt.subscribe("#");
    //   $scope.mqtt.subscribe("$SYS/broker/uptime");
  };
  $scope.mqttDisconnect = function () {
    $scope.mqtt.disconnect();
  }
  $scope.mqttConnectHandle = function () {
    if ($scope.mqtt.connected) $scope.mqttDisconnect();
    else $scope.mqttConnect();
  }
  $scope.mqttConnectionChange = function () {
    log(" selection change : " + $scope.mqttHostPort);
    if ($scope.mqtt.connected) {
      $scope.mqttDisconnect();
      $scope.mqttConnect();
    }
  }

  setTimeout(function () {
    $scope.mqtt.connect();
  }, 1000);

});



app.directive('ngRightClick', function ($parse) {
  return function (scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function (event) {
      scope.$apply(function () {
        event.preventDefault();
        fn(scope, { $event: event });
      });
    });
  };
});
/*
app.config([
  '$provide',
  function ($provide) {
    return $provide.decorator('$rootScope', [
      '$delegate',
      function ($delegate) {
        $delegate.safeApply = function (fn) {
          var phase = $delegate.$$phase;
          if (phase === "$apply" || phase === "$digest") {
            if (fn && typeof fn === 'function') {
              fn();
            }
          } else {
            $delegate.$apply(fn);
          }
        };
        return $delegate;
      }
    ]);
  }
]); */
