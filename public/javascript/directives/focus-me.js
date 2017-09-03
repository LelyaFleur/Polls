angular.module('VotesProject').directive('focusMe', function(){
  return{
      scope: {focusMe: '='},
      link: function(scope, element){
         if(scope.focusMe) element[0].focus();             
      }
  };
});