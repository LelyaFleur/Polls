angular.module('VotesProject', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'ngMessages', 'ngMaterialDatePicker', 'googlechart', 'angAccordion', 'ui.bootstrap', 'angularFileUpload'])




.controller('PollController', function ($scope, $q, Socket, $timeout, $mdDialog, Poll) {

   
    $scope.customFullscreen = false;
    $scope.user = { DNI : undefined,
    	birthdate: undefined    	
    };

    

    Poll.all()
    .then(function(polls) {
      $scope.polls = polls.data;

      angular.forEach($scope.polls, function(poll) {
        poll.totalVotesProposal = 0; 
        poll.totalCost = 0;
      

        Socket.on('status', function (data) {
              
              if(poll._id === data.id){
                poll.state = data.status;
                if(poll.state === 1 || poll.state === 2){
                  //console.log("empty: " + $scope.empty);
                      $scope.empty = false;
                    }
                
                if(data.status === 2){
                  poll.totalVotes = data.poll.totalVotes;
                  poll.proposals = data.poll.proposals;
                }
              }

              
               
            });
       

        poll.chartObject = {};
              poll.chartObject.type = "PieChart";
              var chartData = {"cols": [
                    {id: "t", label: "Topping", type: "string"},
                    {id: "s", label: "Slices", type: "number"}
                ], "rows": []};
                poll.chartObject.data = chartData;
              angular.forEach(poll.proposals, function(proposal) {
                
                proposal.icon = "radio_button_unchecked";

                           
                var euroSignIndex = proposal.cost.indexOf("€");
                if(proposal.votes > 0 && euroSignIndex !== -1) {
                  poll.totalCost += Number(proposal.cost.slice(0, euroSignIndex))
                }
                var rowData = {c: [{v: proposal.short_title}, {v: proposal.votes}]};
                poll.totalVotesProposal += proposal.votes;
                poll.chartObject.data.rows.push(rowData);
                if(!proposal.votes) {
                  proposal.votes = 0;
                }
              });
              poll.chartObject.options = {
               'title': poll.title
               };
              
      })
      
      //SharedData.updateLocalSections(locations);
    }, function(err){
      console.log(err);
    });

    $scope.optionSelected = function(poll) {
      var numChecked = 0;
      if(poll) {
        angular.forEach(poll.proposals, function(proposal){
        if(proposal.checked) {
          numChecked ++;
        }
        
      });
      }
      
     
      return numChecked ? true : false;
    };
    
    $scope.exportVotes = function(poll){
      var deferred = $q.defer();
      Poll.getSubmissions(poll._id)
      .success(function(data){
        deferred.resolve(data.submissions);
      });         

      return deferred.promise;
    };

    $scope.exportNonParticipants = function(poll){
      var deferred = $q.defer();
      Poll.getNonParticipants(poll._id)
      .success(function(data){
        deferred.resolve(data);
      });

      return deferred.promise;
    };      





  /*  $scope.budgets = [
    {
      short_title: "Fils Aeris",
      title: "Eliminar el cablejat aeri dels carrers del centre (“fils aeris”)",
      object: "Millorar l’atractiu del centre històric",
      description: "En alguns carrers del centre de la ciutat s’hi poden veure cables i fils d’electricitat i telèfon que creuen de façana a façana. L’actuació consisteix en eliminar el cablejat aeri i soterrar-lo.",
      location: "Centre històric (carrer major, carrer princesa i carrer canonge)",
      cost: "250.000€",
      checked: false

    },
    {
      short_title: "Recorregut Del Barri",
      title: "Adequació del recorregut del barri de la cullera al ceip espuny",
      object: "Crear un camí escolar segur",
      description: "Es tracta de reparar i arranjar les voreres dels trams més perillosos del recorregut i instal·lar les mesures de seguretat apropiades per tal de permetre que els nens i nenes del barri puguin anar a l’escola per un recorregut adaptat i segur.",
      location: "El recorregut començaria a la plaça de Santa Marta, passant pel carrer Bellcaire, l’avinguda Maria Gràcia, el passatge de la pesseta, i el carrer Puig del bé fins al CEIP Espuny",
      cost: "150.000€",
      checked: false
    },
    {
      short_title: "CAMINAR I FER SALUT",
      title: "CAMINAR I FER SALUT: FER UNA RUTA I NATURALITZAR ELS ESPAIS DEL LA MUNTANYA DEL LLAIR",
      object: "Millorar el contacte entre la ciutat i l’espai natural del poble mitjançant la renaturalització dels espais de la muntanya per afavorir-ne el gaudi dels ciutadants i promocionar els usos saludables vinculats a la natura",
      description: "Senyalitzar el recorregut, adaptar i arranjar els diferents trams per fer-los més accessibles i millorar la il·luminació d’algunes zones",
      location: "Espais naturals de la muntanya del Llair",
      cost: "100.000€",
      checked: false
    }/*,
    {
      short_title: "PUNTS DE RECÀRREGA PER A VEHICLES ELÈCTRICS",
      title: "INSTAL·LACIÓ DE PUNTS DE RECÀRREGA PER A VEHICLES ELÈCTRICS",
      object: "Preparar al municipi per a la sostenibilitat ambiental en matèria de mobilitat i incentivar l’ús del vehicle elèctric",
      description: "Instal·lació de 4 punts de recàrrega per a vehicles elèctrics.",
      location: "Els punts de recàrrega s’instal·larien als següents indrets: Carrer major, Ronda Ferran Mall, Plaça de l’església, Plaça de l’Ajuntament",
      cost: "75.000€",
      checked: false
    },
    {
      short_title: "PARC PER A GOSSOS",
      title: "CREACIÓ D’UN PARC PER A GOSSOS",
      object: "Disposar d’un espai per tal que la gent que té gossos els pugui dur deslligats",
      description: "Condicionar i adequar un terreny públic del poble per tal que els gossos puguin anar deslligats, fer exercici i socialitzar-se",
      location: "Zona verda de les palmeres",
      cost: "35.000€",
      checked: false
    },
     {
      short_title: "IL·LUMINAR PASSOS DE VIANANTS",
      title: "IL·LUMINAR PASSOS DE VIANANTS",
      object: "Millorar la seguretat dels vianants",
      description: "Es tractaria d’il·luminant els passos de vianants amb més afluència del poble amb la finalitat d’evitar accidents i millorar la seguretat.",
      location: "Il·luminació dels 30 passos de vianants amb més freqüència de pas del poble",
      cost: "50.000€",
      checked: false
    }/*,
    {
      short_title: "IRENOVAR LA PLAÇA CATALUNYA",
      title: "RENOVAR LA PLAÇA CATALUNYA",
      object: "Dignificar una de les places més importants i més usades del municipi",
      description: "Renovar l’espai de jocs, el mobiliari urbà, les instal·lacions de jocs infantil, les zones verdes i els labavos",
      location: "Plaça de Catalunya",
      cost: "GRAN",
      checked: false
    },
  ];*/

  $scope.getClass = function(index, checked) {
    var  className;
       switch (index){
            case 0:
              className = "green";
              break;
            case 1:
              className = "redColor";
              break;
            case 2:
              className = "blue";
            break;
            case 3:
              className = "yellow";
            break;
            case 4:
              className = "purple";
            break;
            case 5:
              className = "deepBlue";
            break;
            case 6:
              className = "pink";
            break;
            case 7:
              className = "darkBlue";
            break;
            case 8:
              className = "lightPurple";
            break;
            case 9:
              className = "gray";
            break;
            default:
              className = "gray";
        }
       return checked ? className : className + ' not_selected';
  }  

  $scope.getImage = function(image, checked) {
    var path;
  /*  if(!checked) {
      path = "img/" + image;
    } else {
      path = "img/BlancINegre/" + image;
    }*/
    path = "img/" + image;
    console.log("path:" + path);
    return path;

  }; 

  var parentDiv =  angular.element(document.querySelector('#popupContainer'));

  $scope.showProposalDialog = showProposalDialog;
  $scope.showResultDialog = showResultDialog;
  $scope.showDNICheckerDialog = showDNICheckerDialog;
  $scope.addPollDialog = addPollDialog;
  
  $scope.currentProposal = undefined;
  $scope.state = undefined;
  
  function showProposalDialog(ev, proposal, poll, state) {
    $scope.state = state;
    $scope.currentProposal = proposal;
    $scope.poll = poll;
    var parentEl = angular.element(document.querySelector('#popupContainer'));
    alert = $mdDialog.alert({
      parent: parentEl,
      targetEvent: ev,
      scope: $scope.$new(),
      templateUrl:'templates/dialogs/proposal.html',
      locals: {
        closeDialog: $scope.closeDialog
      },
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

  function showResultDialog(ev, poll) {
    $scope.currentPoll = poll;
    var parentEl = angular.element(document.querySelector('#popupContainer'));
    alert = $mdDialog.alert({
      parent: parentEl,
      targetEvent: ev,
      scope: $scope.$new(),
      templateUrl:'templates/dialogs/results.html',
      locals: {
        closeDialog: $scope.closeDialog,
        poll: poll
      },
      clickOutsideToClose:true,
      bindToController: true,
      controllerAs: 'ctrl',
      controller: 'ResultController'
    });
    
    $mdDialog
      .show( alert )
      .finally(function() {
        alert = undefined;
      });
  }

  
  function showDNICheckerDialog(ev, poll) {
  	//$scope.currentBudget = budget;
    var parentEl = angular.element(document.querySelector('#popupContainer'));
    alert = $mdDialog.alert({
      parent: parentEl,
      targetEvent: ev,
      scope: $scope.$new(),
      templateUrl:'templates/dialogs/dni-checker.html',
      locals: {
        closeDialog: $scope.closeDialog,
        user: $scope.user,
        poll: poll
      },
      clickOutsideToClose:true,
      bindToController: true,      
      controllerAs: 'ctrl',
      controller: 'UserCheckerController'
    });
    
    $mdDialog
      .show( alert )
      .finally(function(data) {
        alert = undefined;
        console.log(data);
      });
  }

  function addPollDialog(ev) {
   
    var parentEl = angular.element(document.querySelector('#popupContainer'));
    alert = $mdDialog.alert({
      parent: parentEl,
      targetEvent: ev,
      scope: $scope.$new(),
      templateUrl:'templates/dialogs/new-poll.html',
      locals: {
        closeDialog: $scope.closeDialog
      },
      clickOutsideToClose:true,
      bindToController: true,
      controllerAs: 'ctrl',
      controller: 'NewPollController'
    });
    
    $mdDialog
      .show( alert )
      .finally(function() {
        alert = undefined;
      });
  }



  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  $scope.changeClick = function(checked) {
    var classname = (checked) ? "material-icons md-128 checked" : "material-icons md-128 unchecked";

        return classname;
  }

  $scope.geticon = function(checked) {
    return checked ? 'check_box_outline_blank' : 'check_box';
  }

  function showAlert(ev, title, message) {

        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title(title)
            .textContent(message)
            .ariaLabel('Message')
            .ok('Ok')
            .targetEvent(ev)
        );
      };
   



  $scope.checkProposal = function(proposal, poll, ev) {

      var numChecked = 0;
      angular.forEach(poll.proposals, function(proposal){
        if(proposal.checked) {
          numChecked ++;
        }
        
      });

      if(numChecked < 3) {
        proposal.checked = !proposal.checked;
       if(proposal.checked) {
            proposal.icon = "check_circle";
            
       }
        else {
           
          proposal.icon = "radio_button_unchecked";
         
       }
      } else if(proposal.checked) {
        proposal.checked = !proposal.checked;
        
        proposal.icon = "radio_button_unchecked";
        
      } else {
        showAlert(ev, 'Atenciò', 'Només es poden seleccionar 3 propostes!')
      }
  }
  

  


})

.controller('DialogController', function($scope, $mdDialog) {
  //alert( this.closeDialog );
 
    function showAlert(ev, title, message) {

        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title(title)
            .textContent(message)
            .ariaLabel('Message')
            .ok('Ok')
            .targetEvent(ev)
        );
      };

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    $scope.changeClick = function(checked) {
    var classname = (checked) ? "material-icons md-64 checked" : "material-icons md-128 unchecked";

        return classname;
  }

 /*   $scope.checkProposal = function(proposal) {
      proposal.checked = !proposal.checked;
      if(proposal.checked) {
        proposal.icon = "check_circle";
        
      }
      else {
        
        proposal.icon = "radio_button_unchecked";
      }
    };*/

     $scope.checkProposal = function(proposal, poll, ev) {

      var numChecked = 0;
      angular.forEach(poll.proposals, function(proposal){
        if(proposal.checked) {
          numChecked ++;
        }
        
      });

      if(numChecked < 3) {
        proposal.checked = !proposal.checked;
       if(proposal.checked) {
            proposal.icon = "check_circle";
            
       }
        else {
           
          proposal.icon = "radio_button_unchecked";
         
       }
      } else if(proposal.checked) {
        proposal.checked = !proposal.checked;
        
        proposal.icon = "radio_button_unchecked";
        
      } else {
        showAlert(ev, 'Atenciò', 'Només es poden seleccionar 3 propostes!')
      }
  }

   
})

.controller('ResultController', function($scope, $mdDialog, poll) {
  //alert( this.closeDialog );
 
    $scope.poll = poll;
    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

   
})

.controller('UserCheckerController', function($scope, $mdDialog, user, poll, Poll, $filter) {

	function generateSecretWord(){
	      		var secret = "Todayis" + getWeekDay() + ".Yeah!";
	      		return secret;
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

  	function showAlert(ev, title, message) {

        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title(title)
            .textContent(message)
            .ariaLabel('Message')
            .ok('Ok')
            .targetEvent(ev)
        );
      };
   
  	
 	$scope.user = user;
 	$scope.poll = poll;
 	$scope.encryptedDNI = undefined;

 	
  
    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    function vote(inquiry) {
    	var pollObj = {pollId: poll._id, dni: $scope.encryptedDNI, submissions: []};

    	angular.forEach(poll.proposals, function(proposal) {
    		if(proposal.checked) {
					pollObj.submissions.push(proposal._id); 
    		}
    	});
    	Poll.vote(pollObj).then(function(data){
    		console.log(data);
    	}, function(err){
    		console.log(err);
    	});
    }

    $scope.verifyUser = function(ev) {
    	$mdDialog.hide();
    	var dni = user.DNI.toUpperCase();
    	$scope.encryptedDNI = CryptoJS.AES.encrypt(dni, generateSecretWord()).toString();
    	var data = {
    		id: $scope.poll._id,
    		dni: $scope.encryptedDNI,
    		birthdate : $filter('date')(user.birthdate,'dd/MM/yyyy')
    	};
    	Poll.validateUser(data).then(function(data) {
    		console.log(data);
    		var pollObj = {pollId: $scope.poll._id, dni: $scope.encryptedDNI, submissions: []};

		    	angular.forEach($scope.poll.proposals, function(proposal) {
		    		if(proposal.checked) {
							pollObj.submissions.push(proposal._id); 
		    		}
		    	});

    		if(data.data === "0"){
    			
    			
		    	Poll.vote(pollObj).then(function(data){
		    		console.log(data);
            showAlert(ev, 'Correcte!', "Identificació realitzada correctament. El teu vot s'ha emès.");
          
		    	}, function(err){
		    		console.log(err);
		    	});

    		} else if(data.data === "1") {
    			showAlert(ev, 'Error!', " La data de naixement no coincideix amb la del padró.");
    		} else if(data.data === "2") {
    			showAlert(ev, 'Error!', "Ja existeix un vot per aquest usuari.");

    	/*		var confirm = $mdDialog.confirm()
                .title('Avertència!')
                .textContent('Ja existeix un vot per aquest usuari. Vols substituïr el vot existent per aquest?')
                .ariaLabel('Canviar el vot')
                .targetEvent(ev)
                .ok('Si')
                .cancel('No');

          $mdDialog.show(confirm).then(function() {
          	console.log("Yes");
          	Poll.changeVote(pollObj).then(function(data){
          		console.log(data);
          		showAlert(ev, 'Correcte!', 'El vot ha canviat.');
          	},
          	 function(err){
          		console.log(err);
          	});
          }, function(){
          	console.log("No");
          });*/




    		} else if(data.data === "3") {
    			showAlert(ev, 'Error!', "Aquesta identificació d'usuari no es troba al padró. Assegurat que tens 16 o més anys i que estàs empadronat abans del dia 6 d’abril de 2017.");
    		}
    		// res.send("2"); // has already participated
              //              res.send("1"); //is not in the census
                //    res.send("3"); //is not in the census
                   







    	}, function(err){
    		console.log(err);
    	})
    }
});




