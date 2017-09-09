var app = angular.module('mqtt-dashboard');

app.directive('widgetBody', ['$compile',
    function ($compile) {
        return {
            restrict: 'E',
            templateUrl: 'widgets/widgetBodyTemplate.html',
            link: function (scope, element, attrs) {
                // create a new angular element from the resource in the
                // inherited scope object so it can compile the element
                // the item element represents the custom widgets
                var newEl = angular.element(scope.widget.template);
                // using jQuery after new element creation, to append element
                element.find("widget-body").replaceWith(newEl);
                // returns a function that is looking for scope
                // use angular compile service to instanitate a new widget element
                $compile(newEl)(scope);
            }
        }
    }
]);

app.directive('mqtt3', ['$compile', '$http', '$templateCache', function ($compile, $http, $templateCache) {

    var getTemplate = function (contentType) {
        var templateLoader,
            baseUrl = '/widgets/',
            templateMap = {
                text: 'text.html',
                photo: 'widget-text.html',
                video: 'video.html',
                quote: 'quote.html',
                link: 'link.html',
                chat: 'chat.html',
                audio: 'audio.html',
                answer: 'answer.html'
            };

        var templateUrl = baseUrl + templateMap[contentType];
        templateLoader = $http.get(templateUrl, { cache: $templateCache });

        return templateLoader;

    }


    var linker = function (scope, element, attrs) {

        var loader = getTemplate(scope.template);

        var promise = loader.success(function (html) {
            element.html(html);
        }).then(function (response) {
            element.replaceWith($compile(element.html())(scope));
        });
    }
    return {
        restrict: 'E',
        scope: {
            topics: '=',
            template: '=template'
        },
        link: linker
    };
}]);
