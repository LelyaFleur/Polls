angular.module('VotesProject').
 factory('Poll', ['$http', function PollFactory($http){
 	return {
 		all: function(){
 			return $http({method: 'GET', url: "/api/polls"});
 		}, 		
 		find: function(id){
 			return $http({method: 'GET', url: "/api/polls/" + id});
 		},
 		getDate: function() {
 			return $http({method: 'GET', url: "/api/date"});
 		},
 		getVotesNumber: function(id) {
 			return $http({method: 'GET', url: "/api/admin/votes/" + id});
 		},
    getCensusNumber: function() {
      return $http({method: 'GET', url: "/api/census"});
    },
 		getSubmissions: function(id){
 			return $http({method: 'GET', url: "/api/admin/submissions/" + id});
 		},
    getSubmission: function(id, dni){
      return $http({method: 'GET', url: "/api/admin/submissions/" + id + "/" + dni});
    },
 		getNonParticipants: function(id){
 			return $http({method: 'GET', url: "/api/admin/nonparticipants/" + id});
 		},
    validateUser: function(data){
      return $http({method: 'POST', url: "/api/polls/validation", data: data});
    },
 		validateDNI: function(data){
 			return $http({method: 'POST', url: "/api/surveys/validation", data: data});
 		},
 		validateCode: function(data){
 			return $http({method: 'POST', url: "/api/census/validation" , data: data});
 		},
    vote: function(inquiryObj) {
      return $http({method: 'PUT', url: "/api/polls/vote", data: inquiryObj});
    },
 		update: function(id, dni, surveyObj) {
  		return $http({method: 'PUT', url: "/api/surveys/"+ id + "/" + dni, data: surveyObj});
  	},
  	changeVote: function(pollObj) {
  		return $http({method: 'PUT', url: "/api/polls/change", data: pollObj});
  	},
 		create: function(inquiryObj){
 			return $http({method: 'POST', url: "/api/polls", data: inquiryObj});
 		},
 		delete: function(id) {
		  return  $http({method: 'DELETE', url: "/api/surveys/" + id});
  	},
  	subscribe: function(subscription) {
		  return $http({method: 'PUT', url: "/api/surveys/subscription", data: subscription});
  	},
  	getSubscriptions: function(){
    	return $http({method: 'GET', url: "/api/admin/subscription"});
 		}        
 	};
 }]);