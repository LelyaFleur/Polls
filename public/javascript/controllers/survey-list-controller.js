angular.module('VotesProject').controller('SurveyListController',
	function($scope, Survey, Socket, ModalService, $location, $anchorScroll, $q, $timeout){
		$scope.showForm = false;
		$scope.selectedSurvey = undefined;
		$scope.subscription = undefined;
		$scope.empty = true;
		$scope.difference = 0;
		
		Survey.getDate()
      		.success(function(data){
      			var now = new Date().valueOf();      			
				$scope.difference = data.date - now;
				//console.log("Difference: " + $scope.difference);
      	});
		
		
	    // when landing on the page, get all surveys and show them
	    Survey.all()
	        .success(function(data) {	        	
	            $scope.surveys = data; 
	            $scope.surveys.forEach(function(survey){
	            	if(survey.state === 1 || survey.state === 2){
	            			$scope.empty = false;
            		}
	            	Socket.on('status', function (data) {
  						
  						if(survey._id === data.id){
  							survey.state = data.status;
  							if(survey.state === 1 || survey.state === 2){
  								//console.log("empty: " + $scope.empty);
	            				$scope.empty = false;
	            			}
  							
  							if(data.status === 2){
  								survey.totalVotes = data.survey.totalVotes;
  								survey.questions = data.survey.questions;
  							}
  						}
    					 
  					});

  					Socket.on('votes', function (data) {
  						
						if(survey._id === data.id){
							survey.totalVotes = data.number;  							
						}
					}); 
	            });
	        })
	        .error(function(data) {
	            console.log('Error: ' + data);

        });

	    $scope.toggleShowForm = function() {
	    	$scope.showForm = !$scope.showForm;	    	
	    }; 
		
	    $scope.gotoLocation = function() {
	    	
	    	console.log("showForm: " + $scope.showForm);
	        $timeout(function() {
	        	$anchorScroll.yOffset = 100;
		    	$location.hash('newPoll');		       	
	      		if($scope.showForm === true){		      		
		      		$anchorScroll();
		      	}
	   		}, 0, false);

   		};

	    $scope.removeSurvey = function(survey){

	    	ModalService.showModal({
	            templateUrl: '/templates/confirm.html',
	            controller: function($scope, close, $element) {
	            			
						//  This close function doesn't need to use jQuery or bootstrap, because
					  //  the button has the 'data-dismiss' attribute.
					  $scope.close = function(result) {
						 	close(result, 500); // close, but give 500ms for bootstrap to animate
						 };

					  //  This cancel function must use the bootstrap, 'modal' function because
					  //  the doesn't have the 'data-dismiss' attribute.
					  $scope.cancel = function() {

					    //  Manually hide the modal.
					    $element.modal('hide');
					  };
				}
	        }).then(function(modal) {
		            modal.element.modal();
		            modal.close.then(function(result) {
		            	
            		if(result === "Yes"){
            			Survey.delete(survey._id)
				        .success(function(data) {
				            $scope.surveys = data;
				        })
				        .error(function(data) {
				            console.log('Error: ' + data);
				        });
				    }
	            });
    		});
	    }; 

	    $scope.subscribe = function(){

	    	ModalService.showModal({
	            templateUrl: '/templates/subscription.html',
	            controller: function($scope, close, $element) {
					 $scope.close = function() {
					 	  close({
					      subscription: $scope.subscription
					    }, 500); 
					  };
					   $scope.cancel = function() {

					    //  Manually hide the modal.
					    $element.modal('hide');
					  };
				}
	        }).then(function(modal) {
		            modal.element.modal();
		            modal.close.then(function(result) {		            	
		            	var email = {email: result.subscription};
	            		Survey.subscribe(email)
	            		.success(function(data) {
       					 	console.log(data);
           					
        				})
				        .error(function(data) {
				            console.log('Error: ' + data);
				        });

	            	});
			});
	    }; 

	    $scope.getSubscriptions = function(){
	      		var deferred = $q.defer();
	      		Survey.getSubscriptions()
	      		.success(function(data){
	      			deferred.resolve(data);
	      		});

	      		return deferred.promise;
      	};

	    $scope.selectSurvey = function(survey) {
		    $scope.selectedSurvey = survey;
    	};  

    	$scope.getClass = function(survey) {
    		var  className;
    		switch (survey.state){
    			case 0: 
    				className = "list-group-item-warning";
    				break;
				case 1: 
					className = "list-group-item-info";
					break;
				case 2:
					className = "list-group-item-success";
					break;
				default:
        			className = "list-group-item-success";
    		}
		    return className;
    	};

    	function getDate(){

      		var deferred = $q.defer();
      		Survey.getDate()
      		.success(function(data){
      			deferred.resolve(data.date);
      		});

      		return deferred.promise;
    	};

    	$scope.getCountdown = function(survey) {
    		var now = new Date().valueOf() - $scope.difference;
    		var start = new Date(survey.publishDate.startDate);
    		var end = new Date(survey.publishDate.endDate);
    		var diff, countdown;
    		if(survey.state === 0) {
	      			      			
	      		diff =  start.valueOf() - now;
      			countdown =  parseInt(diff/1000);        				
	      			
      		}else if(survey.state === 1){
      			
      			diff =  end.valueOf() - now;
      			countdown =  parseInt(diff/1000); 

      		}
      		
      		return countdown;
    	};    	

    	$scope.getSurvey = function(id){
    		Survey.find(id)
    		.success(function(data){
    			$scope.selectedSurvey = data;
    		})
    		.error(function(data){
    			console.log(data);
    		});
    	}
	      	
	});