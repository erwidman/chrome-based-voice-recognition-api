>An API used to hijacks chrome webkitSpeechRecognition for non web applications.

## Description
This API intends to create a binding to Chrome SpeechRecognition API for native node processes outside web environments. Using Chrome's voice recognition as opposed to a paid cloud service offers an inexpensive, easy to install, fast alternative for small projects that don't justify the hassel of setting up a cloud service.

## Caveats
The original concept of the project involved a headless chrome instance, however due to a number of issues - it does not seem reasonable to accomplish headless as it requires hacking around in the chromium source code. In the meantime, the API simply opens a small chrome window.

In order for the API to operate one of the follow must be a valid environment variable pointing to the chrome executable:

- chrome
- chromium-browser
- Google\ Chrome
- google-chrome

## Usage

```javascript
const recog = require('chrome-based-voice-recognition-api');

recog.launchSpeechRecognition(12000)
.then((data)=>{
	let client = data.client;
	recog.initSpeechRecognition({
		lang : 'en-us',
		interimResults : false,
		maxAlternatives : 1,
		infiniteListen : true
	},client);
	recog.addFilter("^lights on$",client);
	client.on('recognition',(data)=>{
		//todo
	});
	client.on('startedListen',()=>{
		//todo
	});
	client.on('stopedListen',()=>{
		//todo
	})
	client.on('recognitionError',(err)=>{
		//todo
	})
	recog.startListen(client);
});
```


## API

###launchSpeechRecogition(port)

#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Spins up the websocket server and chrome instance.

#####Params
&nbsp;&nbsp;&nbsp;&nbsp;port (number) : The desired port of page server

&nbsp;&nbsp;&nbsp;&nbsp;Note : port + 1 will be used for websocket server

#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;An object with two properties -

- client : an instace of simple-websocket handling the IPC
- serv :  an instance of simple-websocket/server


###initSpeechRecognition(options,client) 


#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Instantiates webkit speech recog in chrome. 

#####Params
&nbsp;&nbsp;&nbsp;&nbsp;options : An object with settings to be applied to speech object.

&nbsp;&nbsp;&nbsp;&nbsp;All are optional.

- lang (string): The language to be recognized
- interimResults (boolean) : Indication that you wish to recieve low confidence results.
- maxAlternatives (number) : The max number of alternatives sent from recog.
- infiniteListen (boolean) : If true, will continue listening after a hit.




&nbsp;&nbsp;&nbsp;&nbsp;client : The instance of simple-websocket from launchSpeechRecogntion



#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;An object with two properties

- client : an instace of simple-websocket handling the IPC
- serv :  an instance of simple-websocket/server

###addGrammar(grammar,weight,client)

#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Adds a grammar to an active recognition instance.

#####Params
&nbsp;&nbsp;&nbsp;&nbsp;grammar & weight : see [link](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/grammars) 

&nbsp;&nbsp;&nbsp;&nbsp;client : The instance of simple-websocket from launchSpeechRecogntion

#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;

###addFilter(expression,client)

#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Adds a filter specifying what phrases will trigger a recognition event.

#####Params
&nbsp;&nbsp;&nbsp;&nbsp;expression (string): JS regex in the form of string specifyng a filter

&nbsp;&nbsp;&nbsp;&nbsp;client : The instance of simple-websocket from launchSpeechRecogntion

#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;none

###startListen(client)

#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Request recog object to begin listening

#####Params

&nbsp;&nbsp;&nbsp;&nbsp;client : The instance of simple-websocket from launchSpeechRecogntion

#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;none


###endListen(client)

#####Description
&nbsp;&nbsp;&nbsp;&nbsp; Request recog object to stop listening

#####Params

&nbsp;&nbsp;&nbsp;&nbsp;client : The instance of simple-websocket from launchSpeechRecogntion

#####Returns 
&nbsp;&nbsp;&nbsp;&nbsp;none





