var app = angular.module('mqtt-dashboard')
app.config(
  function ($controllerProvider, $provide, $compileProvider) {
    // Since the "shorthand" methods for component
    // definitions are no longer valid, we can just
    // override them to use the providers for post-
    // bootstrap loading.
    console.log("Config method executed.");
    // Let's keep the older references.
    app._controller = app.controller;
    app._service = app.service;
    app._factory = app.factory;
    app._value = app.value;
    app._directive = app.directive;
    app.controller = function (name, constructor) {
      console.log("controller...");
      console.log(name);
      console.dir(constructor);
      $controllerProvider.register(name, constructor);
      return (this);
    };
    // Provider-based service.
    app.service = function (name, constructor) {
      $provide.service(name, constructor);
      return (this);
    };
    // Provider-based factory.
    app.factory = function (name, factory) {
      $provide.factory(name, factory);
      return (this);
    };
    // Provider-based value.
    app.value = function (name, value) {
      $provide.value(name, value);
      return (this);
    };
    // Provider-based directive.
    app.directive = function (name, factory) {
      $compileProvider.directive(name, factory);
      return (this);
    };
  });
app.controller('AppCtrl', function ($scope, $http, $compile) {
  $scope.someData = {};
  $scope.loadTemplate = function (fileTemplate) {
    $http.get(fileTemplate)
      .then(function (r) {
        // load in the html, including the script, which will be executed
        $(".dynamic-content").html(
          r.data
        );
        // compile the loaded html into an actual template and put it back where it was
        $(".dynamic-content").html($compile($(".dynamic-content").html())($scope));
      })
  }
});