var express = require('express');
var rq = require('request-promise');

var app = express();

app.use('/', express.static('static'));

app.get('/astroids', function (req, res, next) {
	rq('https://api.nasa.gov/neo/rest/v1/feed?' 
		+ req.url.substr(req.url.indexOf('?')+1) 
		+ '&api_key=qVpgPwEZoKii3cwq07hh0yTxFhpJ6XEKaIcs18Tn')

		.then(function (data) {
			res.send(data);
			next();
		});
});

app.get('/asteroid/:id', function (req, res, next) {
	rq('https://api.nasa.gov/neo/rest/v1/neo/' + req.params.id + '?api_key=qVpgPwEZoKii3cwq07hh0yTxFhpJ6XEKaIcs18Tn')
		.then(function (data) {
			res.send(data);
			next();
		});
})

var server = app.listen(3000, function () {
	console.log("listing on port 3000");
});