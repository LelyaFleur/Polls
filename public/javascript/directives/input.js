angular.module('VotesProject').directive('input', function() {
  return {
    restrict: 'E',
    require: ['?^optionGroup','?ngModel'],
    link: function(scope, element, attrs, controllers) {
      var optionGroup = controllers[0];
      var ngModel = controllers[1];
      if ( attrs.type=='text' && optionGroup && ngModel ) {
        optionGroup.register(ngModel);
        scope.$watch(function() { return ngModel.$modelValue; }, optionGroup.validate );
        // In case we are adding and removing options dynamically we need to tidy up after outselves.
        scope.$on('$destroy', function() { 
          console.log("deregister:" + ngModel);
          optionGroup.deregister(ngModel); 
        });
      }
    }
  };
});