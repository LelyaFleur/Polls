angular.module('VotesProject').
 factory('Survey', ['$http', function SurveyFactory($http){
 	return {
 		all: function(){
 			return $http({method: 'GET', url: "/api/surveys"});
 		}, 		
 		find: function(id){
 			return $http({method: 'GET', url: "/api/surveys/" + id});
 		},
 		getDate: function() {
 			return $http({method: 'GET', url: "/api/date"});
 		},
 		getVotesNumber: function(id) {
 			return $http({method: 'GET', url: "/api/admin/votes/" + id});
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
 		validateDNI: function(data){
 			return $http({method: 'POST', url: "/api/surveys/validation", data: data});
 		},
 		validateCode: function(data){
 			return $http({method: 'POST', url: "/api/census/validation" , data: data});
 		},
 		update: function(id, dni, surveyObj) {
  		return $http({method: 'PUT', url: "/api/surveys/"+ id + "/" + dni, data: surveyObj});
  	},
  	changeVote: function(id, dni, surveyObj) {
  		return $http({method: 'PUT', url: "/api/surveys/change/"+ id + "/" + dni, data: surveyObj});
  	},
 		create: function(surveyObj){
 			return $http({method: 'POST', url: "/api/surveys", data: surveyObj});
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