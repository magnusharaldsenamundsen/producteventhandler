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
	console.log( "Received event", data.timestamp );
 	io.sockets.emit( 'productevent', data );
});


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

io.sockets.on( 'connection', function( socket ) {
	console.log( "Client connected", socket.id );
});

