// BASE SETUP
// ======================================

// Call the models
var User       = require('./models/user');

// CALL THE PACKAGES --------------------
var express    = require('express');		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser'); 	// get body-parser
var morgan     = require('morgan'); 		// used to see requests
var mongoose   = require('mongoose');
var jwt        = require('jsonwebtoken');
var port       = process.env.PORT || 8000; // set the port for our app




//json secret
var superSecret = 'ilovescotchscotchyscotchscotch';

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console 
app.use(morgan('dev'));

// connect to our database 
mongoose.connect('mongodb://localhost/node-api'); 

// ROUTES FOR OUR API
// ======================================

// basic route for the home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

// route to authenticate a user
apiRouter.post('/authenticate', function(req, res)
{
	// find the user
	// select the name username and password eplicitly
	User.findOne(
	{
		username: req.body.username
	}).select('name username password').exec(function(err, user)
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
				var token = jwt.sign(
				{
					name: user.name,
					username: user.username
				}, superSecret, 
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
					return res.status(403).send(
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

		user.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000) 
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else 
					return res.send(err);
				}

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
				res.json({ message: 'user updated'});

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


// REGISTER OUR ROUTES -------------------------------
app.use('/api', apiRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server is open on port:' + port);