angular.module('userCtrl', ['userService'])

// user controller for the main mage
// inject the User Factory
.controller('userController', function($location, User)
{

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the users at page load
	User.all()
		.success(function(data)
		{
			// when all the user come back, remove the proceessing variable
			vm.processing = false;

			// bind the users that come back to vm.users
			vm.users = data;
		});

	// function to delete a user
	vm.deleteUser = function(id)
	{
		vm.processing = true;

		User.delete(id)
		// accepts the user id as a parameter
		.success(function(data)
		{
			// get all users to udpate the table
			// you can also set up your api to return
			// the list of users with the delete call
			User.all()
				.success(function(data)
				{
					vm.processing = false;
					vm.users = data;
				});
			$location.path('/users');
		});
	};
})

.controller('userCreateController', function(User)
{
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	// function to create  auser
	vm.saveUser = function()
	{
		vm.processing = true;

		// clear the message
		vm.message = '';

		// use the create function in the userService
		User.create(vm.userData)
		 .success(function(data)
			{
				vm.processing = false;

				// clear the form
				vm.userData = {};
				vm.message = data.message;
			});
	};
})

.controller('userEditController', function($routeParams, User)
{
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'edit';

	// get the user data for the user you want to edit
	// $routeParams is the way we grab data from the URL
	User.get($routeParams.user_id)
	.success(function(data)
	{
		vm.userData = data;
	});

	// function to save the user
	vm.saveUser = function()
	{
		vm.processing = true;
		vm.message = '';

		// call the userService function to update
		User.update($routeParams.user_id, vm.userData)
		.success(function(data)
		{
			vm.processing = false;

			// clear the form
			vm.userData = {};

			// bind the message from our API to vm.message
			vm.message = data.message;
		});
	};
});

