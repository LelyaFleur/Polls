angular.module('VotesProject').controller('SurveysShowController',

 function(Survey, $routeParams, $scope) {
	Survey.find($routeParams.id)
		.success(function(data){
			$scope.survey = data;
		})
		.error(function(data){
			console.log('Error:' + data);
		})
});