angular.module('VotesProject').controller('NewSurveyController', ['Survey', 'Socket', '$scope', 

  function(Survey, Socket, $scope){ 

    $scope.anyNumber = new RegExp("^\d+$"); 
            
      $scope.newSurvey = { title: '',
                    description: '',
                    questions: [{text: '',
                                    choices: [{text:'', votes: 0, submissions : []}]}
                     ],
                     publishDate: {startDate: new Date(), endDate: new Date()},
                     state: 0,
                     totalVotes: 0,
                     phoneNumbers: []
                   };


      $scope.addQuestion = function(){
          $scope.newSurvey.questions.push({text: '', choices: [{text:'',votes: 0}]});
      }; 

      $scope.removeQuestion = function(question){
          $scope.newSurvey.questions.some(function(item, i){
            if(item === question){
              $scope.newSurvey.questions.splice(i, 1);
              return true;
            }
          });
      }; 

      $scope.addChoice = function(choices){                
          choices.push({text:'', votes: 0});                
      }; 

      $scope.removeChoice = function(answer, choices){
          choices.some(function(item,i){
            if(item === answer){
              choices.splice(i, 1);
              return true;
            }
          });
      };

      $scope.addSurvey = function(surveys){ 

          $scope.newSurvey.publishDate.startDate.setSeconds(0);
          $scope.newSurvey.publishDate.endDate.setSeconds(0);
          surveys.push($scope.newSurvey);
          var choices;
          for(var question in $scope.newSurvey.questions) {
            choices = $scope.newSurvey.questions[question].choices;
            choices.some(function(item,i){
              if(item.text === ''){
                choices.splice(i, 1);
                return true;
              }
          });
      };

      Survey.create($scope.newSurvey)          
          .success(function(data) {
            
              $scope.newSurvey = { title: '',
                description: '',
                questions: [{text: '',
                                   choices: [{text:'', votes: 0, submissions : []}]}
              ],
                 publishDate: {startDate: new Date(), endDate: new Date()},
                 state: 0,
                 totalVotes: 0,
                 phoneNumbers: []
          }; 
              $scope.surveys = data;
              $scope.showForm = false; 
             
          })
          .error(function(data) {
              console.log('Error: ' + data);
        });
    };

}]);
    