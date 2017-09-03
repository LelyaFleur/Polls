angular.module('VotesProject').controller('NewPollController', ['Poll', 'Socket', '$scope', '$mdDialog', 'FileUploader', 

  function(Poll, Socket, $scope, $mdDialog, FileUploader){ 

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    $scope.anyNumber = new RegExp("^\d+$"); 
   
            
      $scope.newPoll = { title: '',
                    description: '',
                    proposals: [{short_title: '', title: '', object: '', description: '',  location: '', cost: '', checked: false, votes: 0, submissions : []}],
                     publishDate: {startDate: new Date(), endDate: new Date()},
                     state: 0,
                     totalVotes: 0
                     
                   };

      $scope.addBudget = function(){
          $scope.newPoll.proposals.push({short_title: '', title: '', object: '', description: '',  location: '', cost: '', checked: false, votes: 0,  submissions : []});
      }; 

      $scope.removeBudget = function(budget){
          $scope.newPoll.proposals.some(function(item, i){
            if(item === budget){
              $scope.newPoll.proposals.splice(i, 1);
              return true;
            }
          });
      }; 

      
     
      $scope.createPoll = function(){ 

        
          $scope.polls.push($scope.newPoll);   
          Poll.create($scope.newPoll)          
          .then(function(data) {
            
              $scope.newPoll = { 
                    title: '',
                      description: '',
                      proposals: [{short_title: '', title: '', object: '', description: '',  location: '', cost: '', votes: 0, checked: false, submissions : []}],
                      publishDate: {startDate: new Date(), endDate: new Date()},
                      state: 0,
                      totalVotes: 0
                   };
 
              $scope.polls = data.data;
               
             
          }, function(data) {
              console.log('Error: ' + data);
        });       
      };


      var uploader = $scope.uploader = new FileUploader({
            url: 'upload.php'
        });

        // FILTERS

        uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
     
    

}]);
   
