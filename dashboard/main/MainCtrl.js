var app = angular.module('mqtt-dashboard', ['oc.lazyLoad', 'nvd3', 'gridster', 'plunker.services', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ngSanitize']);

app.controller('MainCtrl', function ($scope, $http, $window, $timeout, $interval, DataService, $uibModal, $http) {

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

  $scope.isCollapsed = false;

  $scope.copyObject = function (o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
      v = o[key];
      output[key] = (typeof v === "object") ? $scope.copyObject(v) : v;
    }
    return output;
  }

  $scope.loadLayout = function (newDashboard) {
    while ($scope.dashboard.widgets.length > 0) {
      $scope.dashboard.widgets.pop();
    };
    for (key in newDashboard.widgets) {
      $scope.dashboard.widgets.push(newDashboard.widgets[key]);
    }
  }

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

  $scope.dashboardName = $window.localStorage.getItem("dashboard");
  $scope.dashboardName = "https://api.myjson.com/bins/nxjxx"

  $scope.saveDashboard = function () {
    log("saving layout ... ");
    var config = {};
    config.meta = {
      subject: "mqtt-dashboard",
      github: "https://github.com/vortex314/mqtt-dashboard",
      demo: "https://vortex314.github.io/dashboard/index.html",
      updated: new Date()
    }
    config.mqtt = $scope.mqtt.getConfig();
    config.dashboard = $scope.copyObject($scope.dashboard);

    var url = "https://api.myjson.com/bins";
    var method = "POST";
    if ($scope.dashboardName != "undefined") {
      url = $scope.dashboardName;
      method = "PUT";
    }


    $http({
      method: method,
      url: url,
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      },
      data: config
    }).then(function success(response) {
      console.log(response.data);
      $window.localStorage.setItem("dashboard", response.data.uri);
      $scope.dashboardName = response.data.uri;
    }, function error(response) {
      console.log(JSON.stringify(response))
    });
  }

  $scope.loadDashboard = function (name) {
    var url = name;
    $http({
      method: "GET",
      url: name,
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      }
    }).then(function success(response) {
      // mqtt disconenct, change config , connect
      var config = response.data;
      $scope.mqtt.disconnect();
      $scope.mqtt.setConfig(config.mqtt);
      $scope.mqtt.connect();
      // dashboard layout erase, fill
      $scope.loadLayout(config.dashboard);
      console.log(response.data);
      $window.localStorage.setItem("dashboard", response.data.uri);
    }, function error(response) {
      console.log(JSON.stringify(response))
    });
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
  });
  eb.emit("test eb", {
    "event": "init"
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


  $scope.ebMessage = "Logging";

  $scope.logger = function (s) {
    $scope.ebMessage = s;
  }

  setLogger($scope.logger);

  $interval(function () {
    $scope.safeApply();
  }, 1000);
  // ================================= MQTT connection PART

  $scope.mqttHostPorts = ["ws://limero.ddns.net:1884/mqtt",
    "wss://limero.ddns.net:1886/mqtt",
    "ws://test.mosquitto.org:8080/ws",
    "ws://broker.mqttdashboard.com:8000/",
    "ws://test.mosca.io:80/",
    "ws://broker.hivemq.com:8000/",
    "ws://iot.eclipse.org:80/"];
  $scope.mqttHostPort = "wss://limero.ddns.net:1886/mqtt";
  $scope.mqtt = new MyMqtt("limero.ddns.net", 1886);
  $scope.mqtt.setConnectionString($scope.mqttHostPort);

  $scope.mqttConnect = function () {
    $scope.mqtt.setConnectionString($scope.mqttHostPort);
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
    $scope.mqtt.setConnectionString($scope.mqttHostPort);
    if ($scope.mqtt.connected) {
      $scope.mqttDisconnect();
      $scope.mqttConnect();
    }
  }

  setTimeout(function () {
    $scope.mqtt.connect();
  }, 1000);

});
