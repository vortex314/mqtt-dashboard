var app = angular.module('mqtt-dashboard');

app.controller('MqttStateCtrl', function ($scope, $timeout, $uibModal) {
  // We want to hide the charts until the grid will be created and all widths and heights will be defined.
  // So that use `visible` property in config attribute
  $scope.topic = "src/+/system/alive";
  $scope.topicRegexp = $scope.topic.replace("+", ".*");
  $scope.records = [];
  $scope.config = {
    visible: false
  };
  $timeout(function () {
    $scope.config.visible = true;
  }, 200);

  $scope.init = function () {

  }

  $scope.clear = function () {
    console.log('clearing in widget');
  }

  $scope.start = function () {
    $scope.mqtt.subscribe($scope.topic);
    eb.on($scope.topicRegexp, function (ev) {
      if (hasField(ev, "topic")) {
        log(JSON.stringify(ev));

        if (ev.topic.match(topic)) {
          var index = $scope.records
            .findIndex(function (record) {
              return record.topic === String(this);
            }, ev.topic);
          if (index > -1) {
            var record = $scope.records
            [index];
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
            $scope.records
              .push({
                "topic": ev.topic,
                "message": ev.message,
                "time": new Date().toLocaleTimeString(),
                "count": 1,
                "type": t
              });
          }
        }
      };
    });
  };

  //TODO calculate regexps from mqttSubscribes


});
