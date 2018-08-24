/*
	AUTHOR : 
		ERIC WIDMANN
	DATE : 	 
		8.23.2018
*/
const {spawn, execSync} = require('child_process');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const WebSocket = require('simple-websocket');
const SocketServer = require('simple-websocket/server');

app.use(express.static(__dirname));

launchSpeechRecognition(12000)
.then((data)=>{
	let client = data.client;
	initSpeechRecognition({
		lang : 'en-us',
		interimResults : false,
		maxAlternatives : 1,
		infiniteListen : true
	},client);
	//addFilter("^lights on$",client);
	client.on('recognition',(data)=>{
		console.log(data);
		//setTimeout(()=>startListen(client),3000);
	});
	client.on('startedListen',()=>{
		//todo
		console.log('starting listen');
	});
	client.on('stopedListen',()=>{
		//todo
	})
	client.on('recognitionError',(err)=>{
		//todo
	})
	startListen(client);
	//setTimeout(()=>startListen(client),2000);
});




function launchSpeechRecognition(pagePort){
	return new Promise((resolve,reject)=>{
		server.listen({port: pagePort},()=>{
			bootChrome(server.address().port);
			resolve();
		});
	})
	.then(()=>{
		return bootSocketServer(pagePort);
	})
	.catch((ex)=>{
		console.error(ex);
	});

}


function bootChrome(port,sokPort){
	

	let possiblePaths = ['Google\\ Chrome', 'chrome','google-chrome','chromium-browser'];
	let acceptedPath = null;
	for(let path of possiblePaths){
		try{
			let result = execSync(`${path} --version`);
		}
		catch(ex){
			continue;
		}
		
		acceptedPath = path;
		break;
	}

	if(!acceptedPath){
		console.error("::chrome or chromium not found in path - exiting program");
		process.exit(0);
	}



	acceptedPath = acceptedPath.replace('\\','');

	console.log(process.platform);


	let arg =  ['--app=http://localhost:'+port,'--disable-gpu','--window-size=0,0','--window-position=0,0',
	'--use-fake-ui-for-media-stream'];
	let chrx = spawn(acceptedPath,arg);
	process.on("SIGINT",()=>{
		try{
			chrx.kill("SIGINT");
		}catch(ex){
			execSync('killall -9 "Google Chrome"');
		}
		process.exit(0);
	});
	process.on("SIGTERM",()=>{
		try{
			chrx.kill("SIGINT");
		}catch(ex){
			execSync('killall -9 "Google Chrome"');
		}
		process.exit(0);
	});
}




function bootSocketServer(port){
	return new Promise((resolve,reject)=>{
		let sServer = new SocketServer({port : (port+1)});

		sServer.on('connection',(sok)=>{
			sok.on('data',(data)=>{
				data = data.toString('utf-8');
				if(data == 'STARTED_LISTENING')
					sok.emit('startedListen');
				else if(data =='STOPED_LISTENING')
					sok.emit('stopedListen');
				else if(data[0] == '{')
					sok.emit('recognitionError',JSON.parse(data));
				else
					sok.emit('recognition',data);
			});
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

module.exports = {
	launchSpeechRecognition : launchSpeechRecognition,
	initSpeechRecognition : initSpeechRecognition,
	addGrammar : addGrammar,
	addFilter: addFilter,
	startListen : startListen,
	endListen : endListen
};
