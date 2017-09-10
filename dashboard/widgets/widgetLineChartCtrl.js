var app = angular.module('mqtt-dashboard');

app.controller('WidgetLineChartCtrl',
    function ($scope, $timeout, $uibModal) {


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

        $scope.events = {
            resize: function (e, scope) {
                $timeout(function () {
                    scope.api.update();
                    console.log("resize");
                }, 200);
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

        $scope.options = {
            chart: {
                type: 'lineChart',
                //height: 380,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                duration: 500,
                yAxis: {
                    tickFormat: function (d) {
                        return d3.format('.01f')(d);
                    }
                },
                xAxis: {
                    axisLabel: 'Time',
                    tickFormat: function (d) {
                        return d3.time.format('%H:%M:%S')(new Date(d));
                    }
                },
                duration: 0,
                //               yDomain: [-1, 1]
            }
        };

        $scope.data = []; //[{ values: [], key: 'Random Walk' }];

        $scope.run = true;

        $scope.pushData = function (time, key, value) {
            var index = $scope.data.findIndex(function (record) {
                return record.key === String(this);
            }, key);
            if (index < 0) {
                $scope.data.push({
                    key: key,
                    //                    area: true,
                    values: [{ x: time, y: value }]
                })
            } else {
                $scope.data[index].values.push({ x: time, y: value });
            }
        };

        $scope.start = function () {
            if (!$scope.context.topics) {
                log(" no inherited topics !");
                return;
            } else {
                log(" starting widget " + $scope.context.topics + " " + " ctrl : " + $scope.config.ctrl);
            }
            $scope.topicRegexp = $scope.context.topics.replace("+", ".*").replace("#", ".*").replace("$", "\\$");
            $scope.mqtt.subscribe($scope.context.topics);
            eb.on($scope.topicRegexp, function (ev) {
                if (hasField(ev, "topic")) {

                    if (ev.topic.match($scope.topicRegexp)) {

                        var msg;
                        try {
                            msg = JSON.parse(ev.message);
                        } catch (exception) {
                            log(" JSON parse exception on -- " + ev.message);
                            msg = ev.message;
                        }
                        $scope.pushData(new Date(), ev.topic, msg);

                    }
                }
            });
        };
        $scope.start();
    }
);


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
