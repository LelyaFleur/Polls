angular.module('VotesProject').controller('LoginController', function($scope, $rootScope, $http, $location) {
  // This object will be filled by the form

  $scope.error = false;
  $scope.disabled = false;
  $scope.loginForm = {};
 
  // Register the login() function
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.username,
      password: $scope.password,
    })
    .then(function(user){
      // No error: authentication OK
      $location.url('/admin');
      $scope.disabled = false;
     
  
    },function(err){
      // Error: authentication failed
      $scope.error = true;
      $scope.errorMessage = "Nom d'usuari i/o contrassenya erronis";
      $location.url('/login');
      $scope.disabled = false;
      $scope.loginForm = {};
    });
    
  };
});