angular.module('VotesProject')
.directive('polls', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/polls.html',
	      replace: true,	      
	      controller: 'PollController'
	    }
})