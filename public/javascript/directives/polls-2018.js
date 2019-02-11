angular.module('VotesProject')
.directive('polls2018', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/polls-2018.html',
	      replace: true,	      
	      controller: 'PollController'
	    }
})