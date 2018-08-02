/*
 *	HTTP(S) to SQL RESTful API
 *   in Node.JS & Express
 *
 *   By Samuel PREVOST
 *
 */
var express     = require('express');
var bodyParser  = require('body-parser');
var mysql      	= require('mysql');
var https 		= require('https');
var fs 			= require('fs');

let settings	= require('./Settings').GetSettings()
// API Key validator: check if the API key provided is valid
var apiValidator = require('./APIKeyValidator');

// POST     <-->    INSERT
var postInsert  = require('./PostInsert');
// GET      <-->    SELECT
var getSelect   = require('./GetSelect');
// PATCH    <-->    UPDATE
var patchUpdate = require('./PatchUpdate');
// PUT      <-->    UPDATE
var putUpdate = require('./PutUpdate');
// DELETE   <-->    DELETE
var deleteDelete = require('./DeleteDelete');

var app = express();
app.listen(8080);

let serverCertKeyParams = 
	{ 
		key: fs.readFileSync(__dirname + '/cert/key.pem'),
		cert: fs.readFileSync(__dirname + '/cert/cert.pem')
	};
https.createServer(serverCertKeyParams, app).listen(8081);

app.use(bodyParser.json());


var connection = mysql.createConnection({
	host		: settings.mysql.host,
	port 		: settings.mysql.port,
	user     	: settings.mysql.user,
	password 	: settings.mysql.password,
	database 	: settings.mysql.database,
	dateStrings	: true
});

// Say Hello
let indexCache = fs.readFileSync( __dirname + '/index.html');
app.get('/', function (req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.send(indexCache);
});

/* vvvvvvvv REST vvvvvvvv */

// Create
app.post('/:table',         apiValidator.Validate(settings, connection, postInsert.InsertData(connection))   );      // Create
// Read
app.get('/:table/:id?',     apiValidator.Validate(settings, connection, getSelect.SelectData(connection))    );      // Read
// Update
app.patch('/:table/:id?',   apiValidator.Validate(settings, connection, patchUpdate.UpdateData(connection))  );   // Update
app.put('/:table/:id?',     apiValidator.Validate(settings, connection, putUpdate.UpdateData(connection))    );   // Update (idempotent)
// Delete
app.delete('/:table/:id',  apiValidator.Validate(settings, connection, deleteDelete.DeleteData(connection)) );   // Delete
