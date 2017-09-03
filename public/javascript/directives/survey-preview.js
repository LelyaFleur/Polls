angular.module('VotesProject')
.directive('surveyPreview', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/survey-preview.html',
	      replace: true,
	      scope: {
	      	survey: "=",
	      	countdown: "="
	      },
	      controller: 'SurveyController'
	    }
})


