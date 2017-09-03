angular.module('VotesProject').directive('dniValidity', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {

            function customValidator(ngModelValue) {
            	function isDNI(dni){

					var number, let, letter;
					var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;
				 
					dni = dni.toUpperCase();
				 
					if(expresion_regular_dni.test(dni) === true){
						number = dni.substr(0,dni.length-1);
						number = number.replace('X', 0);
						number = number.replace('Y', 1);
						number = number.replace('Z', 2);
						let = dni.substr(dni.length-1, 1);
						number = number % 23;
						letter = 'TRWAGMYFPDXBNJZSQVHLCKET';
						letter = letter.substring(number, number+1);
						if (letter != let) {
							console.log('Dni erroneo, la letra del NIF no se corresponde');
							return false;
						}else{
							console.log('Dni correcto');
							return true;
						}
					}else{
						console.log('Dni erroneo, formato no válido');
						return false;
					}		
        		}

	            if (isDNI(ngModelValue)) {
	                ctrl.$setValidity('dniValidator', true);
	            }else{
	            	ctrl.$setValidity('dniValidator', false);
	            }
	            return ngModelValue;

       	 	}

        	ctrl.$parsers.push(customValidator); 
		}
	};
});