
module.exports = {
	launchSpeechRecognition : launchSpeechRecognition,
	initSpeechRecognition : initSpeechRecognition,
	addGrammar : addGrammar,
	addFilter: addFilter,
	startListen : startListen,
	endListen : endListen
};


const {spawn} = require('child_process');
const http = require('http');
const express = require('express');
const app = express();
var server = http.createServer(app);
var WebSocket = require('simple-websocket');
app.use(express.static(__dirname));
var SocketServer = require('simple-websocket/server');

// console.log(process.platform);
// launchSpeechRecognition()
// .then((data)=>{
// 	let client = data.client;
// 	initSpeechRecognition({
// 		lang : 'en-us',
// 		interimResults : false,
// 		maxAlternatives : 1,
// 	},client);
// 	// addFilter("hello",client);
// 	// //addFilter('lights on',client);
// 	// addFilter("^lights on$",client);
// 	client.on('data',(data)=>{
// 		console.log(data.toString('utf-8'));
// 	});
// 	startListen(client);
// });




function launchSpeechRecognition(){
	return new Promise((resolve,reject)=>{
		server.listen(()=>{
			bootChrome(server.address().port);
			resolve();
		});
	})
	.then(()=>{
		return bootSocketServer();
	});

}


function bootChrome(port){
	console.log(port);
	
	let arg =  ['--app=http://localhost:'+port];
	let chrx;
	if(process.platform.includes('darwin'))
		chrx = spawn('Google\ Chrome',arg);
	else if (process.platform.includes('win'))
		chrx = spawn('chrome',arg);	
	else
		chrx = spawn("google-chrome",arg)
}




function bootSocketServer(){
	return new Promise((resolve,reject)=>{
		let sServer = new SocketServer({port:8080});
		sServer.on('connection',(sok)=>{
			resolve({
				client : sok,
				serv : sServer
			});
		});
	});
}

function initSpeechRecognition(options,client){
	if(client === undefined)
		return;
	let msg = {
		options : options,
		action : 'init'
	}
	client.write(JSON.stringify(msg));

}

function addGrammar(grammar,weight,client){
	if(client === undefined)
		return;
	let msg = {
		grammar : grammar,
		weight : weight,
		action : 'addGrammar'
	};
	client.write(JSON.stringify(msg));
}


function addFilter(expression,client){
	if(client === undefined)
		return;
	let msg = {
		expression : expression,
		action : 'addFilter'
	};
	client.write(JSON.stringify(msg));
}


function startListen(client){
	client.write(JSON.stringify({
		action : 'start'
	}));
}

function endListen(client){
	client.write(JSON.stringify({
		action : 'end'
	}));
}
