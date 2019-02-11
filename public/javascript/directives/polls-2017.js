angular.module('VotesProject')
.directive('polls2017', function(){
	    return {
	      restrict: 'E',
	      templateUrl: 'templates/directives/polls-2017.html',
	      replace: true,	      
	      controller: 'PollController'
	    }
})