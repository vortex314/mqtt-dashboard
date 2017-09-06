var app = angular.module('mqtt-dashboard', ['nvd3', 'gridster', 'plunker.services', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ngSanitize']);

app.controller('MainCtrl', function($scope, $timeout, DataService, $uibModal) {

    $scope.gridsterOptions = {
      margins: [1, 1],
      columns: 10,
      mobileModeEnabled: false,
      draggable: {
        handle: 'h3'
      },
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],

        // optional callback fired when resize is started
        start: function(event, $element, widget) {},

        // optional callback fired when item is resized,
        resize: function(event, $element, widget) {
          if (widget.chart.api) widget.chart.api.update();
        },

        // optional callback fired when item is finished resizing
        stop: function(event, $element, widget) {
          $timeout(function() {
            if (widget.chart.api) widget.chart.api.update();
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
        name: "Discrete Bar Chart",
        chart: {
          options: DataService.discreteBarChart.options(),
          data: DataService.discreteBarChart.data(),
          api: {}
        }
      }, {
        col: 2,
        row: 0,
        sizeY: 2,
        sizeX: 2,
        name: "Candlestick Bar Chart",
        chart: {
          options: DataService.candlestickBarChart.options(),
          data: DataService.candlestickBarChart.data(),
          api: {}
        }
      }, {
        col: 0,
        row: 2,
        sizeY: 2,
        sizeX: 3,
        name: "Line Chart",
        chart: {
          options: DataService.lineChart.options(),
          data: DataService.lineChart.data(),
          api: {}
        }
      }, {
        col: 4,
        row: 2,
        sizeY: 1,
        sizeX: 1,
        name: "Pie Chart",
        chart: {
          options: DataService.pieChart.options(),
          data: DataService.pieChart.data(),
          api: {}
        }
      }]
    };

    $scope.gridsterOptions2 = {
      margins: [1, 1],
      columns: 10,
      mobileModeEnabled: false,
      draggable: {
        handle: 'h3'
      },
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],

        // optional callback fired when resize is started
        start: function(event, $element, widget) {},

        // optional callback fired when item is resized,
        resize: function(event, $element, widget) {
          if (widget.chart.api) widget.chart.api.update();
        },

        // optional callback fired when item is finished resizing
        stop: function(event, $element, widget) {
          $timeout(function() {
            if (widget.chart.api) widget.chart.api.update();
          }, 400)
        }
      },
    };

    $scope.dashboard2 = {
      widgets: [{
        col: 0,
        row: 0,
        sizeY: 2,
        sizeX: 2,
        name: "Discrete Bar Chart",
        template: '<nvd3 options="widget.chart.options" data="widget.chart.data" api="widget.chart.api" config="config" events="events"></nvd3>',
        chart: {
          options: DataService.discreteBarChart.options(),
          data: DataService.discreteBarChart.data(),
          api: {}
        }
      }, {
        col: 2,
        row: 0,
        sizeY: 2,
        sizeX: 2,
        name: "Candlestick Bar Chart",
        template: '<nvd3 options="widget.chart.options" data="widget.chart.data" api="widget.chart.api" config="config" events="events"></nvd3>',
        chart: {
          options: DataService.candlestickBarChart.options(),
          data: DataService.candlestickBarChart.data(),
          api: {}
        }
      }, {
        col: 0,
        row: 2,
        sizeY: 2,
        sizeX: 3,
        name: "Line Chart",
        template: '<nvd3 options="widget.chart.options" data="widget.chart.data" api="widget.chart.api" config="config" events="events"></nvd3>',
        chart: {
          options: DataService.lineChart.options(),
          data: DataService.lineChart.data(),
          api: {}
        }
      }, {
        col: 4,
        row: 2,
        sizeY: 1,
        sizeX: 1,
        name: "Pie Chart",
        template: '<nvd3 options="widget.chart.options" data="widget.chart.data" api="widget.chart.api" config="config" events="events"></nvd3>',
        chart: {
          options: DataService.pieChart.options(),
          data: DataService.pieChart.data(),
          api: {}
        }
      }, {
        col: 4,
        row: 2,
        sizeY: 1,
        sizeX: 1,
        name: "MQTT",
        template: '<ul ng-controller="MqttCtrl"><li ng-repeat="record in topicRecords">{{record.topic}}:{{record.message}}</li></ul>',
        chart: {
          options: DataService.pieChart.options(),
          data: DataService.pieChart.data(),
          api: {}
        }
      }]
    };

    $scope.addWidget = function() {
      $scope.dashboard2.widgets.push({
        col: 4,
        row: 2,
        sizeY: 1,
        sizeX: 1,
        name: "Pie Chart",
        template: '<nvd3 options="widget.chart.options" data="widget.chart.data" api="widget.chart.api" config="config" events="events"></nvd3>',
        chart: {
          options: DataService.pieChart.options(),
          data: DataService.pieChart.data(),
          api: {}
        }
      });
    }

    $scope.removeWidget = function(widget) {
      $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
    }

    $scope.settingsWidget = function(widget) {
      $uibModal.open({
        scope: $scope,
        templateUrl: 'widget_settings.html',
        controller: 'WidgetSettingsCtrl',
        resolve: {
          widget: function() {
            return widget;
          }
        }
      });
    };

    $scope.saveLayout = function() {
      log("saving layout ... ");
      log(JSON.stringify($scope.dashboard.widgets));
    }

    $scope.clear = function() {
      $scope.mqttData.length=0;
    }

    // We want to manually handle `window.resize` event in each directive.
    // So that we emulate `resize` event using $broadcast method and internally subscribe to this event in each directive
    // Define event handler
    $scope.events = {
      resize: function(e, scope) {
        $timeout(function() {
          scope.api.update()
        }, 200)
      }
    };
    angular.element(window).on('resize', function(e) {
      $scope.$broadcast('resize');
    });

    // We want to hide the charts until the grid will be created and all widths and heights will be defined.
    // So that use `visible` property in config attribute
    $scope.config = {
      visible: false
    };
    $timeout(function() {
      $scope.config.visible = true;
    }, 200);

    $scope.init = function() {

    }
    // ================================= EB part
    eb = Minibus.create();

    eb.on(".*", function(arg) {
      log('EB => ' + JSON.stringify(arg));
      $scope.ebMessage = JSON.stringify(arg);
      $scope.safeApply();
    });
    eb.emit("test eb", {
      "event": "init"
    });
    eb.onLocal("mqtt/connected", function(e) {
      log("=== CONNECTED =====" + JSON.stringify(e) + "=================")
    });
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
    // ================================= MQTT PART

    $scope.mqttHostPorts = ["limero.ddns.net:1884", "test.mosquitto.org:8080"];
    $scope.mqttHostPort = "limero.ddns.net:1884";
    $scope.mqtt = new MyMqtt("limero.ddns.net", 1884);

    eb.onLocal("mqtt/.*", function(ev) {
      $scope.safeApply();
    });


    $scope.mqttConnect = function() {
      $scope.mqtt.host = $scope.mqttHostPort.split(':')[0];
      $scope.mqtt.port = Number($scope.mqttHostPort.split(':')[1]);
      $scope.mqtt.connect();
      //    $scope.mqtt.subscribe("#");
      $scope.mqtt.subscribe("$SYS/broker/uptime");
    };
    $scope.mqttDisconnect = function() {
      $scope.mqtt.disconnect();
    }
    $scope.mqttConnectHandle = function() {
      if ($scope.mqtt.connected) $scope.mqttDisconnect();
      else $scope.mqttConnect();
    }
    $scope.mqttConnectionChange = function() {
      log(" selection change : " + $scope.mqttHostPort);
      if ($scope.mqtt.connected) {
        $scope.mqttDisconnect();
        $scope.mqttConnect();
      }
    }
    $scope.mqttData = [];

    $scope.mqttTopicFind = function(record) {
      return record.topic === String(this); // this is an array of char ?
    }

    $scope.mqttSubscriptionsClear = function() {
      $scope.mqtt.topics = [];
    }
    eb.on(".*", function(ev) {
      if (hasField(ev, "topic")) {
        var index = $scope.mqttData.findIndex(function(record) {
          return record.topic === String(this);
        }, ev.topic);
        if (index > -1) {
          var record = $scope.mqttData[index];
          record.count++;
          record.message = ev.message;
          record.time = new Date().toLocaleTimeString();
        } else {
          try {
            var t = typeof JSON.parse(ev.message);
          } catch (exception) {
            log(" JSON parse exception on -- " + ev.message);
            t = "string";
          }
          $scope.mqttData.push({
            "topic": ev.topic,
            "message": ev.message,
            "time": new Date().toLocaleTimeString(),
            "count": 1,
            "type": t
          });
        }
      }
    });

    $scope.gridOptions = {
      enableColumnResizing: true,
      enableFiltering:true,
      onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
          },
      data: $scope.mqttData
    };

    $scope.highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
    if( col.filters[0].term ){
      return 'header-filtered';
    } else {
      return '';
    }
  };

    $scope.gridOptions.columnDefs = [{
      name: 'topic',
      headerCellClass: $scope.highlightFilteredHeader
    }, {
      name: 'message'
    }, {
      name: 'time'
    }, {
      name: 'count'
    }, {
      name: 'type',
      cellTemplate: '<div ><span class="glyphicon glyphicon-fonts"></span><span ng-click="saveLayout()" ng-show="COL_FIELD === \'number\'" class="glyphicon glyphicon-stats"></span>{{COL_FIELD}}</div>'
    }];

    setTimeout(function() {
      $scope.mqtt.connect();
      $scope.mqtt.subscribe("#");
    }, 1000);

  });

app.directive('widgetBody', ['$compile',
  function($compile) {
    return {
      restrict: 'E',
      templateUrl: 'widgets/widgetBodyTemplate.html',
      link: function(scope, element, attrs) {
        // create a new angular element from the resource in the
        // inherited scope object so it can compile the element
        // the item element represents the custom widgets
        var newEl = angular.element(scope.widget.template);
        // using jQuery after new element creation, to append element
        element.find("widget-content").replaceWith(newEl);
        // returns a function that is looking for scope
        // use angular compile service to instanitate a new widget element
        $compile(newEl)(scope);
      }
    }
  }
]);

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.config([
  '$provide',
  function($provide) {
    return $provide.decorator('$rootScope', [
      '$delegate',
      function($delegate) {
        $delegate.safeApply = function(fn) {
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
]);
