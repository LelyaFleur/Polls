angular.module('VotesProject').directive('questionValidity', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            function customValidator(ngModelValue) {
            	var valueArr = ngModelValue.choices.map(function(item){ return item.text });
				var isDuplicate = valueArr.some(function(item, idx){ 
					 return valueArr.indexOf(item) != idx 
				});
            	
            	if(scope.questionValidity.choices.length > 1){
            		 ctrl.$setValidity('questionValidator', true);            		
            	}else{
            		ctrl.$setValidity('questionValidator', false);            		
            	}

            	if(isDuplicate){
            		 ctrl.$setValidity('duplicateValidator', false);            		 
            	}else{
            		ctrl.$setValidity('duplicateValidator', true);
            	}            	
	            
	            return ngModelValue;
       	 	}
       	 	
        	ctrl.$parsers.push(customValidator); 
		}
	};
});