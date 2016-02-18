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
var config 	   = require('./config');

// API ROUTES -------------------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);



//json secret
var superSecret = config.secret;

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
mongoose.connect(config.database); 


// basic route for the home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});



// START THE SERVER
// =============================================================================
app.listen(config.port);
console.log('Server is open on port:' + config.port);