var app = angular.module('mqtt-dashboard');

app.controller('gridCtrl', function ($scope, $timeout, DataService, $uibModal) {

    $scope.gridOptions = {
        enableColumnResizing: true,
        enableFiltering: true,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: $scope.records
    };

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
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
        name: 'time',
        type: 'date'
    }, {
        name: 'count',
        type: 'number'
    }];

});




