angular.module('VotesProject').controller('SurveyController',

	function($scope, $q, ModalService, Survey, Socket){
	      	$scope.canVote = false;
	      	$scope.showTimer = false;
	      	$scope.changeVote = false;
	      	$scope.DNI = undefined;
	      	$scope.phoneNumber = undefined;
	      	$scope.code = undefined;
	      	$scope.state = undefined;
	      	$scope.answers = {};
	      	$scope.showPreview = true;
	      	$scope.votesNumber = undefined;	      	
	      	
	      	$scope.toggleShow = function(){
	      		$scope.showPreview = !$scope.showPreview;	      		
	      	};

	      	$scope.exportVotes = function(){
	      		var deferred = $q.defer();
	      		Survey.getSubmissions($scope.survey._id)
	      		.success(function(data){
	      			deferred.resolve(data.submissions);
	      		});      		

	      		return deferred.promise;
	      	};

	      	$scope.printVotes = function(votes) {
	      		if (votes === 1) {
	      			return "vot";
	      		} else {
	      			return "vots";
	      		}
	      	}

	      	$scope.getTotalVotes = function(){
      			var deffered = $q.defer();
      			Survey.getVotesNumber($scope.survey._id)
      			.success(function(data){
	      			console.log(data.totalVotes);
	      			$scope.votesNumber = data.totalVotes;  
	      			deffered.resolve(data.totalVotes);
	      		});

	      		Socket.on('votes', function (data) {
  						
					if($scope.survey._id === data.id){
						$scope.votesNumber = data.number;  							
					}
    					 
				}); 

	      		return deffered.promise;
	   		 }; 	      	

	      	$scope.exportNonParticipants = function(){
	      		var deferred = $q.defer();
	      		Survey.getNonParticipants($scope.survey._id)
	      		.success(function(data){
	      			deferred.resolve(data);
	      		});

	      		return deferred.promise;
	      	};

	      	$scope.sendSurvey = function() {
	      		var submission = [];
	      		var qAndA = {};
	      		var i = 0;
	      		for(var question in $scope.survey.questions){
	      			qAndA.questionId = $scope.survey.questions[question]._id;
	      			qAndA.answerId = $scope.answers[i];
	      			submission.push(qAndA);
	      			qAndA = {};
	      			i++;
	      		}

	      		if($scope.changeVote) {

	      			Survey.changeVote($scope.survey._id, $scope.DNI, submission)
		      		.success(function(data){
		      			
		      			$scope.canVote = false;
		      			$scope.changeVote = false;
		      			$scope.answers = {};
		      			$scope.surveyForm.$setPristine();
		      			$scope.message = "El teu vot s'ha canviat.";
		      			ModalService.showModal({
					            templateUrl: '/templates/change_vote_dialog.html',
					            controller: function($scope, close, $element) {
					            			
										//  This close function doesn't need to use jQuery or bootstrap, because
									  //  the button has the 'data-dismiss' attribute.
									  $scope.close = function(data) {
										 	close(data, 500); // close, but give 500ms for bootstrap to animate
										 	
										 };
								}
					        }).then(function(modal) {
						            modal.element.modal();
						            modal.close.then(function(data) {
					            });
				    		});

		      		})
		      		.error(function(data){
		      			console.log(data);
		      		})
	      		} else {
	      			Survey.update($scope.survey._id, $scope.DNI, submission)
		      		.success(function(data){
		      			
		      			$scope.canVote = false;
		      			$scope.changeVote = false;
		      			$scope.answers = {};
		      			$scope.surveyForm.$setPristine();
		      			$scope.message = "El teu vot s'ha enviat.";
		      			ModalService.showModal({
					            templateUrl: '/templates/send_vote_dialog.html',
					            controller: function($scope, close, $element) {
					            			
										//  This close function doesn't need to use jQuery or bootstrap, because
									  //  the button has the 'data-dismiss' attribute.
									  $scope.close = function(data) {
										 	close(data, 500); // close, but give 500ms for bootstrap to animate
										 	
										 };
								}
					        }).then(function(modal) {
						            modal.element.modal();
						            modal.close.then(function(data) {
					            });
				    		});

		      		})
		      		.error(function(data){
		      			console.log(data);
		      		})
	      		}
	      		
	      	};	

	      	function getWeekDay(){
	      		var d = new Date();
				var weekday = new Array(7);
				weekday[0]=  "Sunday";
				weekday[1] = "Monday";
				weekday[2] = "Tuesday";
				weekday[3] = "Wednesday";
				weekday[4] = "Thursday";
				weekday[5] = "Friday";
				weekday[6] = "Saturday";

				var n = weekday[d.getDay()];
				return n;
	      	};

	      	function generateSecretWord(){
	      		var secret = "Todayis" + getWeekDay() + ".Yeah!";
	      		return secret;
	      	}      	

	      	$scope.showPopup = function() {
	        	ModalService.showModal({
            		templateUrl: '/templates/dni-checker.html',	
           			scope: $scope,            
           			controller: function($scope, close, $element) {
					  //  This close function doesn't need to use jQuery or bootstrap, because
			  		  //  the button has the 'data-dismiss' attribute.
				  	  $scope.close = function() {
					 	  close({
					      DNI: $scope.DNI,							      
					      code: $scope.code,
					      phoneNumber : $scope.phoneNumber
					    }, 500); // close, but give 500ms for bootstrap to animate
					  };

					  $scope.getCode = function(){
					  	
					  	$element.modal('hide');
					  	ModalService.showModal({
					  		templateUrl: '/templates/code-getter.html',
					  		scope: $scope,
					  		controller: function($scope, close, $element){
					  			$scope.close = function() {
					  				close({
					  					DNI: $scope.$parent.DNI,
										phoneNumber : $scope.$parent.phoneNumber
					  				},500);
					  			};
					  			$scope.cancel = function() {
									    $element.modal('hide');							    
					  			};
					  		}
					  	}).then(function(modal){
				  			modal.element.modal();						  			
				  			modal.close.then(function(result) {	  				
				  				
			  				var encryptedDNI = CryptoJS.AES.encrypt(result.DNI, generateSecretWord()).toString();
			  				var dni = result.DNI;
			  				var encryptedPhoneNumber = CryptoJS.AES.encrypt(result.phoneNumber, generateSecretWord()).toString();
			  				var data = {id : $scope.$parent.survey._id, dni: encryptedDNI, phonenumber : encryptedPhoneNumber};
		            		Survey.validateDNI(data)
			            		.success(function(data) {
			            			var res = parseInt(data);
		           					if(res === 0){
		           						$scope.$parent.message = "El codi s'ha enviat al teu mobil";
					    				$scope.$parent.state = 0;
						 				$scope.$parent.canVote = false;	
						 				$scope.$parent.changeVote = false;
						 				ModalService.showModal({
								            templateUrl: '/templates/code_sent.html',
								            scope: $scope,
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});      	           						
								    } else if(res === 1) {
								    	$scope.$parent.message = "Aquest número de telèfon ja està en ús.";
					 					$scope.$parent.state = 1;
						 				$scope.$parent.canVote = false;	
						 				$scope.$parent.changeVote = false;	
						 				ModalService.showModal({
								            templateUrl: '/templates/number_taken.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});									 										    	
								    }/* else if(res === 2) {
								    	ModalService.showModal({
								            templateUrl: '/templates/already_voted_dialog.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(result) {
													 	close(result, 500); // close, but give 500ms for bootstrap to animate
													 	$scope.$parent.state = 1;
	           					 						$scope.$parent.canVote = false;
	           					 						$scope.$parent.changeVote = false;
													 };

												  //  This cancel function must use the bootstrap, 'modal' function because
												  //  the doesn't have the 'data-dismiss' attribute.
												  $scope.cancel = function() {

												    //  Manually hide the modal.
												    $element.modal('hide');
												    $scope.$parent.state = 1;
	           					 					$scope.$parent.canVote = false;
	           					 					$scope.$parent.changeVote = false;
												  };
											}
								        }).then(function(modal) {
									            modal.element.modal();
									            modal.close.then(function(result) {
									            	
							            		if(result === "Yes") {

							            			$scope.$parent.state = 0;
	           					 					$scope.$parent.canVote = true;
	           					 					$scope.$parent.message = "Ja pots votar.";
	           					 					$scope.$parent.changeVote = true;
	           					 					Survey.getSubmission($scope.$parent.survey._id, dni).
	           					 					success(function(data){
	           					 						console.log("submissions:" + data);
	           					 						var i = 0;
	           					 						data.forEach(function(sbm) {	           					 							
	           					 							$scope.answers[i] = sbm.answerId;
	           					 							i++;
	           					 						})
	           					 						ModalService.showModal({
											            templateUrl: '/templates/can_vote_dialog.html',
												            controller: function($scope, close, $element) {
												            			
																	//  This close function doesn't need to use jQuery or bootstrap, because
																  //  the button has the 'data-dismiss' attribute.
																  $scope.close = function(data) {
																	 	close(data, 500); // close, but give 500ms for bootstrap to animate
																	 	
																	 };
															}
												        }).then(function(modal) {
													            modal.element.modal();
													            modal.close.then(function(data) {
												            });
											    		});
	           					 					})
	           					 					.error(function(err){

	           					 					})
	           					 					
											    } else {
											    	$scope.$parent.state = 1;
	           					 					$scope.$parent.canVote = false;
	           					 					$scope.$parent.changeVote = false;
											    }
								            });
							    		});						    	

								    } */else if(res === 3) {
								    	//$scope.$parent.message = "Has de tenir almenys 16 anys per poder votar.";
								    	$scope.$parent.message = "No estàs autoritzat per votar. Has de tenir almenys 16 anys per poder votar.";
								    	$scope.$parent.state = 1;
	           					 		$scope.$parent.canVote = false;
	           					 		$scope.$parent.changeVote = false;
	           					 		ModalService.showModal({
								            templateUrl: '/templates/minor.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});
								    } else if(res === 4) {
								    	//$scope.$parent.message = "No estàs empadronat en aquest poble.";
								    	$scope.$parent.message = "No estàs autoritzat per votar. No estàs empadronat en aquest poble.";
								    	$scope.$parent.state = 1;
	           					 		$scope.$parent.canVote = false;
	           					 		$scope.$parent.changeVote = false;
	           					 		ModalService.showModal({
								            templateUrl: '/templates/not_authorised_dialog.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});
								    }
		        				})
						        .error(function(data) {
						            console.log('Error: ' + data);
						        });

	    					});
					  	});
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
		            	var encryptedDNI = CryptoJS.AES.encrypt(result.DNI, generateSecretWord()).toString();
			  			var encryptedCode = CryptoJS.AES.encrypt(result.code, generateSecretWord()).toString();
			  			var dni = result.DNI;
			  			
			  			var dataToPass = {id: $scope.survey._id, dni: encryptedDNI, code : encryptedCode};

	            		Survey.validateCode(dataToPass)
	            		.success(function(data) {
	            			var res = parseInt(data);
           					 switch(res) {
							    case 0:
							        $scope.message = "Ja pots votar.";
							        $scope.state = 0;
	           					 	$scope.DNI = result.DNI;
	           					 	$scope.canVote = true;
	           					 	$scope.changeVote = false;
	           					 	ModalService.showModal({
							            templateUrl: '/templates/can_vote_dialog.html',
							            controller: function($scope, close, $element) {
							            			
												//  This close function doesn't need to use jQuery or bootstrap, because
											  //  the button has the 'data-dismiss' attribute.
											  $scope.close = function(data) {
												 	close(data, 500); // close, but give 500ms for bootstrap to animate
												 	
												 };
										}
							        }).then(function(modal) {
								            modal.element.modal();
								            modal.close.then(function(data) {
							            });
						    		});
							        break;
							    case 1:							      
           					 		ModalService.showModal({
								            templateUrl: '/templates/already_voted_dialog.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	$scope.state = 1;													 	
	           					 						$scope.canVote = false;
	           					 						$scope.changeVote = false;
													 };

												  //  This cancel function must use the bootstrap, 'modal' function because
												  //  the doesn't have the 'data-dismiss' attribute.
												  $scope.cancel = function() {

												    //  Manually hide the modal.
												    $element.modal('hide');
												    $scope.state = 1;												   
	           					 					$scope.canVote = false;
	           					 					$scope.changeVote = false;
												  };
											}
								        }).then(function(modal) {
									            modal.element.modal();
									            modal.close.then(function(data) {
									            	
							            		if(data === "Yes"){
							            			$scope.state = 0;
	           					 					$scope.canVote = true;
	           					 					$scope.DNI = result.DNI;
	           					 					$scope.message = "Ja pots votar.";
	           					 					$scope.changeVote = true;
	           					 					Survey.getSubmission($scope.survey._id, $scope.DNI).
	           					 					success(function(data) {
	           					 						var i = 0;
	           					 						console.log("submissions:" + data);
	           					 						data.forEach(function(sbm){
	           					 							console.log(sbm);
	           					 							$scope.answers[i] = sbm.answerId;
	           					 							i++;
	           					 						})
	           					 						
	           					 						ModalService.showModal({
											            templateUrl: '/templates/can_vote_dialog.html',
												            controller: function($scope, close, $element) {
												            			
																	//  This close function doesn't need to use jQuery or bootstrap, because
																  //  the button has the 'data-dismiss' attribute.
																  $scope.close = function(data) {
																	 	close(data, 500); // close, but give 500ms for bootstrap to animate
																	 	
																	 };
															}
												        }).then(function(modal) {
													            modal.element.modal();
													            modal.close.then(function(data) {
												            });
											    		});
	           					 					})
	           					 					.error(function(err){

	           					 					})
											    } else {
											    	$scope.state = 1;
	           					 					$scope.canVote = false;	           					 					
	           					 					$scope.changeVote = false;
											    }
								            });
							    		});
							        break;
							    case 2:
							   		$scope.message = "No estàs autoritzat per votar.";
							   		//$scope.message = "Has de tenir almenys 16 anys per poder votar.";
							   		$scope.state = 1;
           					 		$scope.canVote = false;
           					 		$scope.changeVote = false;
           					 		
           					 		ModalService.showModal({
								            templateUrl: '/templates/minor.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});
							    	break;
							    case 3:
							   		//$scope.message = "No estàs empadronat en aquest poble.";
							   		$scope.message = "No estàs autoritzat per votar.";
							   		$scope.state = 1;
           					 		$scope.canVote = false;
           					 		$scope.changeVote = false;
           					 		ModalService.showModal({
								            templateUrl: '/templates/not_authorised_dialog.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});
							    	break;	
							    case 4:
							    	$scope.message = "El codi no és correcte";
							    	$scope.state = 1;
           					 		$scope.canVote = false;
           					 		$scope.changeVote = false;
           					 		ModalService.showModal({
								            templateUrl: '/templates/wrong_code_dialog.html',
								            controller: function($scope, close, $element) {
								            			
													//  This close function doesn't need to use jQuery or bootstrap, because
												  //  the button has the 'data-dismiss' attribute.
												  $scope.close = function(data) {
													 	close(data, 500); // close, but give 500ms for bootstrap to animate
													 	
													 };
												}
									        }).then(function(modal) {
										            modal.element.modal();
										            modal.close.then(function(data) {
									            });
								    		});
							    	break;						    						    
							}
        				})
				        .error(function(data) {
				            console.log('Error: ' + data);
				        });

	            });
    	});
	};
});
