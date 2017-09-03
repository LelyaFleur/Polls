angular.module('VotesProject')
.directive('surveyResults', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/survey-results.html',
	      replace: true,
	      scope: {
	      	survey: "=",
	      	export: "="
	      },
	      controller: 'SurveyController'
	    }
})