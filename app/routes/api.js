var User       = require('../models/user');
var jwt        = require('jsonwebtoken');
var config 	   = require('../../config');

var superSecret = config.secret;

module.exports = function(app, express)
{
	// get an instance of the express router
var apiRouter = express.Router();

// route to authenticate a user
apiRouter.post('/authenticate', function(req, res)
{
	console.log(req.body.username);

	// find the user
	// select the name username and password eplicitly
	User.findOne(
	{
		username: req.body.username
	}).select('password').exec(function(err, user)
	{

		if (err) throw err;

		// no user with that username was found
		if(!user)
		{
			res.json(
			{
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} 
		else if (user)
		{
			// check if password matches
			var validPassword = user.comparePassword(req.body.password);
			if(!validPassword)
			{
				res.json(
				{
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			}
			else
			{
				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, superSecret, 
				{
					expiresInMinutes: 1440 // expires in 24 hours
				});

				// return the information including token as JSON
				res.json(
				{
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});

// middleware to use for all requests
apiRouter.use(function(req, res, next)
 {
 	console.log('Someone just visitied our app!');

		// check header or url parameters or post parameters for token
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// decode token
		if (token)
		{
			// verifies secret and checks exp
			jwt.verify(token, superSecret, function(err, decoded) 
			{
				if (err)
				{
					return res.json(
					{
						success: false,
						message: 'Failed to authenticate token'
					});
				}
				else
				{
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}	
			});
			
		} 
		else
		{
		// if there is no token
		// return an HTTP response of 403 (access forbidden) and an error
		return res.status(403).send(
		{
			success: false,
			message: 'No token provided.'
 		});

	}
	
});

apiRouter.get('/', function(req, res)
{
	res.json({ message: 'hooray someone just visited our api!'});
});

// on routes that end in /users
// -------------------------------------------------------------
apiRouter.route('/users')

	// create a user (accessed at POST http://localhost:8080/users)
	.post(function(req, res) 
	{
		var user = new User();		// create a new instance of the User model
		user.name = req.body.name;  // set the users name (comes from the request)
		user.username = req.body.username;  // set the users username (comes from the request)
		user.password = req.body.password;  // set the users password (comes from the request)

		user.save(function(err) 
		{
			if (err) res.send(err); 

			// return a message
			res.json({ message: 'User created!' });
		});
	})
	.get(function(req, res) 
	{
		User.find(function(err, users) {
		if (err) res.send(err);

		// return the users
		res.json(users);
			});
	});

// on routes that end in /users/user_id
//---------------------------------------------------------

apiRouter.route('/users/:user_id')
	.get(function(req, res)
	{
		User.findById(req.params.user_id, function(err, user) 
		{
			if (err) res.send(err); 

			// return that user
			res.json(user);
		});
	})
	// Update the user on the id
	.put(function(req, res)
	{
		User.findById(req.params.user_id, function(err, user)
		{
			if(err) res.send(err);

			//update the users info only if it's new
			if (req.body.name) user.name = req.body.name;
			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			// save the user
			user.save(function(err)
			{
				if(err) res.send(err);

				// return a message
				res.json({ message: 'User updated'});

			});
		});
	})
	// delete user on id
	.delete(function(req, res)
	{
	 	User.remove(
	 	{
	 		_id: req.params.user_id
	 	},
	 	function(err, user)
	 	{
	 		if(err) return res.send(err);
	 		res.json({message: 'User has been deleted'});
	 	}); 
	});

	apiRouter.get('/me', function(req, res)
	{
		res.send(req.decoded);
	});

	// return apiRouter
	return apiRouter;

}