angular.module('VotesProject').directive('newInquiry', function(){
	return {
      restrict: 'E',
      templateUrl: 'templates/directives/new-poll.html',
      controller: 'NewPollController'
    }
})