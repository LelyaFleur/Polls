angular.module('VotesProject')
.directive('survey', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/survey.html',
	      replace: true,
	      scope: {
	      	survey: "=",
	      	start: "="
	      },
	      controller: 'SurveyController'
	    }
})