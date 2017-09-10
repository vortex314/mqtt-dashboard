var app = angular.module('mqtt-dashboard');

mqttStateCtrl = function ($scope, $timeout, $uibModal) {
  // We want to hide the charts until the grid will be created and all widths and heights will be defined.
  // So that use `visible` property in config attribute

  $scope.records = [];

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

  $scope.start = function () {
    if (!$scope.context || !$scope.context.topics) {
      log(" no inherited topics !");
      return;
    } else {
      log(" starting widget " + $scope.context.topics + " " + " ctrl : " + $scope.context.ctrl);
    }
    $scope.topicRegexp = $scope.context.topics.replace("+", ".*").replace("#", ".*");
    $scope.mqtt.subscribe($scope.context.topics);
    eb.on($scope.topicRegexp, function (ev) {
      if (hasField(ev, "topic")) {

        if (ev.topic.match($scope.topicRegexp)) {

          var msg, t;
          try {
            msg = JSON.parse(ev.message);
            t = typeof msg;
          } catch (exception) {
            log(" JSON parse exception on -- " + ev.message);
            msg = ev.message;
            t = "string";
          }

          var index = $scope.records.findIndex(function (record) {
            return record.topic === String(this);
          }, ev.topic);
          if (index > -1) {
            var record = $scope.records[index];
            record.count++;
            record.message = msg;
            record.time = new Date();
          } else {

            $scope.records
              .push({
                "topic": ev.topic,
                "message": msg,
                "time": new Date(),
                "count": 1,
                "type": t
              });
          };
          index = $scope.records.findIndex(function (element) {
            return element.time < (new Date() - 60000);
          }, this);
          if (index > -1) {
            $scope.records.splice(index, 1);
          }
          //          $scope.safeApply();
        }
      };
    });
  };

  $scope.msToTime = function (t) {
    var milliseconds = t % 1000;
    var seconds = Math.trunc(t / 1000) % 60;
    var minutes = Math.trunc(t / (1000 * 60)) % 60;
    var hours = Math.trunc(t / (1000 * 60 * 60)) % 24;
    var days = Math.trunc(t / (1000 * 60 * 60 * 24));
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    if (days > 1) {
      return days + " days " + hours + ":" + minutes + ":" + seconds + "," + milliseconds;
    } else

      return hours + ":" + minutes + ":" + seconds + "," + milliseconds;
  }

  $scope.isOld = function (record) {
    var date = new Date();
    if ((date - record.time) > $scope.expireAfter) {
      return true;
    };
  }

  $scope.start();
};

app.controller('MqttStateCtrl', mqttStateCtrl);
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
