angular.module('VotesProject').config(['$routeProvider', '$locationProvider', '$httpProvider', '$mdIconProvider', '$mdThemingProvider', '$mdDateLocaleProvider', function($routeProvider, $locationProvider, $httpProvider, $mdIconProvider, $mdThemingProvider, $mdDateLocaleProvider) {
  
   $mdDateLocaleProvider.months = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
    $mdDateLocaleProvider.shortMonths = ["ge", "fe", "mr", "ab", "mg", "jn", "jl", "ag", "se", "oc", "no", "de"];
    $mdDateLocaleProvider.days = ['Dimenge', 'Diluns', 'Dimars', 'Dimècres', 'Dijòus', 'Divendres', 'Dissabte'];
    $mdDateLocaleProvider.shortDays = ["dg", "dl", "dt", "dc", "dj", "dv", "ds"];   

    $mdDateLocaleProvider.formatDate = function(date) {
        return date ? moment(date).format('DD-MM-YYYY') : '';
    };  

    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD-MM-YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
    


  $locationProvider.hashPrefix('');
  $mdIconProvider.defaultIconSet('./assets/svg/avatars.svg', 128);
  $mdIconProvider.icon('menu', './assets/svg/menu.svg', 24);
  $mdIconProvider.icon("share", "./assets/svg/share.svg", 24);
  $mdIconProvider.icon("exit", "./assets/svg/exit.svg", 24);
  $mdIconProvider.icon("exit_white", "./assets/svg/exit_white.svg", 24);
  $mdIconProvider.icon("logo", "./assets/svg/logo2.svg", 64);
  $mdIconProvider.icon("back", "./assets/svg/arrow_back_white.svg", 24);
  $mdIconProvider.icon("circle", "./assets/svg/circle.svg", 24);
  $mdIconProvider.icon("delete", "./assets/svg/delete.svg", 24);
  $mdIconProvider.icon("add", "./assets/svg/add_36px.svg", 36);

  var neonGreyMap = $mdThemingProvider.extendPalette('grey', {
    '500': '#444',
    'contrastDefaultColor': 'light'
  });

 /* var gainsboroMap = $mdThemingProvider.extendPalette('gainsboro', {
    '500': '#444',
    'contrastDefaultColor': 'dark'
  });*/

  // Register the new color palette map with the name <code>neonRed</code>
  $mdThemingProvider.definePalette('grey', neonGreyMap);

  // Use that theme for the primary intentions
  $mdThemingProvider.theme('default')
    .primaryPalette('grey');

  //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').then(function(user) {
        // Authenticated
        if (user.data !== '0') {
           /*$timeout(deferred.resolve, 0);*/
        
          deferred.resolve();
        }
         


        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          //$timeout(function(){deferred.reject();}, 0);
          deferred.reject();
          $location.url('/login');
        }
      }, function(err){
        console.log(err)
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
  $routeProvider

    .when('/', {
      // redirect to the survey index
      redirectTo: '/polls'
    })

    .when('/polls', {
      templateUrl: 'templates/pages/polls/index.html',
      controller: 'PollController'
    })
    
    .when('/surveys', {
      templateUrl: 'templates/pages/surveys/index.html',
      controller: 'SurveyListController'
    })

    .when('/surveys/:id', {
  		templateUrl: 'templates/pages/surveys/show.html',
  		controller: 'SurveysShowController'
	  })

   .when('/admin', {
      templateUrl: 'templates/pages/admin/index.html',
      controller: 'PollController',
      resolve: {
          loggedin: checkLoggedin
        }
    })

    .when('/register', {
      templateUrl: 'templates/pages/admin/register.html',
      controller: 'RegisterController'/*,
      resolve: {
          loggedin: checkLoggedin
        }*/
    })

    .when('/login', {
      templateUrl: 'templates/pages/admin/login.html',
      controller: 'LoginController'
    })    

    .otherwise({redirectTo: '/'});

    //$locationProvider.html5Mode(true);
    
  }])

  .run(function($rootScope, $route, $http, $location, Poll, $mdDialog) {
    $rootScope.message = '';
    $rootScope.adminIn = false
    $rootScope.toolsIn = false;
    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      console.log("LoggedOut");
      $http.post('/logout');
      $location.url('/');
    };


    Poll.getCensusNumber() 
        .then(function(data) {
          $rootScope.censusCount = data.data.count;
          console.log("census:" +  $rootScope.censusCount); 
        }, function(err){
          console.log(err);
    });

    $rootScope.showInstructionsDialog = showInstructionsDialog;      

    function showInstructionsDialog(ev) {
    
      var parentEl = angular.element(document.querySelector('#popupContainer'));
      alert = $mdDialog.alert({
        parent: parentEl,
        targetEvent: ev,        
        templateUrl:'templates/dialogs/instructions.html',
        clickOutsideToClose:true,
        bindToController: true,
        controllerAs: 'ctrl',
        controller: 'DialogController'
      });
      
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
  }

  
 

 /*   $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      
      if($location.path() === '/admin' || $location.path() === '/login' || $location.path() === '/register'){
        $rootScope.adminIn = true;
      }
      else{
        $rootScope.adminIn = false;
      }
       if($location.path() === '/login' || $location.path() === '/register'){
        $rootScope.toolsIn = true;
      }
      else{
        $rootScope.toolsIn = false;
      }
    });*/
}); // end of config()
  
		