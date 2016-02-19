angular.module('myApp', ['userService'])

.controller('userController', function(Stuff)
{
	var vm = this;


	// get all the stuff
	Stuff.all()
	.success(function(data)
	{
		// bind the data to a controller variable
		// this comes from the stuffService
		vm.stuff = data;
	})
})