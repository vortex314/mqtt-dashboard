var app = angular.module('mqtt-dashboard');

app.directive('widgetContent', ['$compile',
    function ($compile) {
        return {
            restrict: 'E',
            templateUrl: 'widgets/widgetContentTemplate.html',
            link: function (scope, element, attrs) {
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