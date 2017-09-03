angular.module('VotesProject').directive('myVar', function () {
	return {
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			var splits = attrs.myVar.split("=");
			scope.$watch(splits[1], function (val) {
				scope.$eval(attrs.myVar);
			});
		}
	};
});