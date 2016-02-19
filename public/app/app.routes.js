angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider)
{
	$routeProvider

	// home page route
	.when('/', 
	{
		templateUrl : 'app/views/pages/home.html'
	});

	// get rid of the hash in the url
	$locationProvider.html5Mode(true);
});