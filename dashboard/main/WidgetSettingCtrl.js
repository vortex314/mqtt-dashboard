var app = angular.module('mqtt-dashboard');

app.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget',
	function ($scope, $timeout, $rootScope, $uibModalInstance, widget) {
		$scope.widget = widget;

		$scope.form = {
			name: widget.name,
			sizeX: widget.sizeX,
			sizeY: widget.sizeY,
			col: widget.col,
			row: widget.row
		};

		$scope.sizeOptions = [{
			id: '1',
			name: '1'
		}, {
			id: '2',
			name: '2'
		}, {
			id: '3',
			name: '3'
		}, {
			id: '4',
			name: '4'
		}];

		$scope.dismiss = function () {
			$modalInstance.dismiss();
		};



		$scope.remove = function () {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
			$modalInstance.close();
		};

		$scope.submit = function () {
			angular.extend(widget, $scope.form);

			$modalInstance.close(widget);
		};

	}
])

	// helper code
	.filter('object2Array', function () {
		return function (input) {
			var out = [];
			for (i in input) {
				out.push(input[i]);
			}
			return out;
		}
	});
