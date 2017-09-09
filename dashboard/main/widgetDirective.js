function widgetCtrl($scope) {
    //  $scope.context = {};
    $scope.getContext = function (key = "all") {
        if (key === "all")
            return $scope.context;
        else return $scope.context[key];
    }
    $scope.setContext = function (key, value) {
        $scope.context[key] = value;
    }
    $scope.start = function () {

    };
    $scope.setStart = function (f) {
        $scope.start = f;
    }

}

var app = angular.module('mqtt-dashboard');

app.controller('widgetCtrl', widgetCtrl);
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



app.directive('widget', ['$compile', '$http', '$templateCache', '$ocLazyLoad',

    function ($compile, $http, $templateCache, $ocLazyLoad) {

        var linker = function (scope, element, attrs) {

            var prefix = "/dashboard/widgets/"

            function loadHtml() {
                var loaderHtml = $http.get(prefix + scope.context.html, { cache: $templateCache });
                loaderHtml.then(
                    function success(response) {
                        log(" loaded :" + prefix + scope.context.html);
                        var compiled = $compile(response.data)(scope);
                        element.replaceWith(compiled);
                    },
                    function fail() {
                        warn(" couldn't load " + prefix + scope.context.html + " ! ")
                    });
            };

            if (scope.context.ctrl.length >= 1) {
                var loaderCtrl = $ocLazyLoad.load(prefix + scope.context.ctrl);
                loaderCtrl.then(
                    function success() {
                        log(" loaded :" + prefix + scope.context.ctrl);
                        loadHtml();
                    }, function fail() {
                        warn(" couldn't load " + prefix + scope.context.ctrl + " ! ")
                    });
            } else {
                loadHtml();
            }

        };

        return {
            restrict: 'E',
            controller: widgetCtrl,
            link: linker,
            scope: {
                context: "=",
                mqtt: "=",
                eb: "="
            }
        }
    }
]
);
