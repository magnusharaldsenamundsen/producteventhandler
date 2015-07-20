'use strict';

var axon = require( 'axon' );
var express = require('express');

// Sub Socket
var subSocket = axon.socket( 'sub' );

subSocket.connect(8001, 'localhost');

subSocket.on( 'error', function( err ){
	console.log(err);
	throw err;
});

subSocket.on( 'message', function( data ){
	data = JSON.parse( data );
	console.log( "Received event", data.timestamp );
 	io.sockets.emit( 'productevent', translate( data, totals ) );
});

var totals = {
	demands: 0,
 	offers: 0,
 	accepts: 0,
 	periodicsavings: 0,
 	onetimepayments: 0,
};

var translate = function( data, totals ) {
	var event = data["event"]["event-body"]["event-info"];

	var translatedEvent = {
		"event": {
			"eventtype": event["event-type"],
			"demands": event["event-type"] == 'DEMAND' ? ++totals.demands : totals.demands,
			"offers": event["event-type"] == 'OFFER' ? ++totals.offers : totals.offers,
			"accepts": event["event-type"] == 'ACCEPT' ? ++totals.accepts : totals.accepts
		},
		"product": {
			"productid": event.product["product-id"],
			"productname": event.productdetails.productdetail.name,
			"savings": {
				"periodicsavings": event["event-type"] == 'ACCEPT' ? totals.periodicsavings += parseInt( event.productdetails.productdetail.periodicsaving, 10 ) : totals.periodicsavings,
				"onetimepayments": event["event-type"] == 'ACCEPT' ? totals.onetimepayments += parseInt( event.productdetails.productdetail.onetimepayment, 10 ) : totals.onetimepayments
			}	
		},
		"customer": {
			"gender": event.customer["customer-id"].charAt(6) % 2 == 1 ? "Kvinne" : "Mann",
			"age": 34
		}
	};
	return translatedEvent;
};


// Web
var app = express();
var server = require( 'http' ).createServer( app );
var io = require( 'socket.io' ).listen( server );

var port = 3000;
server.listen(port, function(){
	console.log( "producteventhandler - Web server running on port %d", port );
});

app.use( function( request, response, next ) {
	response.setHeader( 'Access-Control-Allow-Origin', '*' );
	next();
});

app.use( express.static( 'public' ) );

app.get( '/', function( req, res ){
	res.sendfile( 'public/index.html' );
});

app.get( '/stats', function( req, res ){
	res.send( totals );
});

io.sockets.on( 'connection', function( socket ) {
	console.log( "Client connected", socket.id );
});

