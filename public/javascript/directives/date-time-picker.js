angular.module('VotesProject').directive('dateTimePicker', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/date-time-picker.html',        
        controller: 'DateTimeController'        
    };
});

