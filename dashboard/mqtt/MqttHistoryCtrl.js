var app = angular.module('mqtt-dashboard');

app.controller('MqttHistoryCtrl',
  function ($scope, $timeout, $uibModal) {
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

    $scope.getConfig = function (key, defaultValue) {
      if (!$scope.config[key]) {
        $scope.config[key] = defaultValue;
        return defaultValue;
      }
      return $scope.config[key];
    }

    $scope.start = function () {
      $scope.maxRecords = $scope.getConfig("maxRecords", 1000);
      if (!$scope.config.topics) {
        log(" no inherited topics !");
        return;
      } else {
        log(" starting widget " + $scope.config.topics + " " + " ctrl : " + $scope.config.ctrl);
      }
      $scope.topicRegexp = $scope.config.topics.replace("+", ".*").replace("#", ".*");
      $scope.mqtt.subscribe($scope.config.topics);
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

            {

              $scope.records
                .push({
                  "topic": ev.topic,
                  "message": msg,
                  "time": new Date(),
                  "count": 1,
                  "type": t
                });
            };
            if ($scope.records.length > $scope.maxRecords) {
              // remove oldest
              $scope.records.shift();
            }
            $scope.safeApply();
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



    $scope.start();
  }
);


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
