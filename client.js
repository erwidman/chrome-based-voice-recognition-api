/*
	AUTHOR : 
		ERIC WIDMANN
	DATE : 	 
		8.23.2018
*/

class SpeechRecognition{
	constructor(options){
		let recog = this._recog;
		recog = new webkitSpeechRecognition();
		if(options.lang !== undefined)
			recog.lang !== options.lang;
		if(options.interimResults)
			recog.interimResults = options.interimResults;
		if(options.maxAlternatives !== undefined)
			recog.maxAlternatives = options.maxAlternatives;
		if(options.infiniteListen){
			recog.infiniteListen = true;
		}
	
		this.recog = recog;
		this.recog.grammars = new webkitSpeechGrammarList();

		this.recog.onstart = ()=>{
			socket.send('STARTED_LISTENING');
			this.recog.isListening = true;
		}
		this.recog.onerror = (ev)=>{
			console.log(ev);
			socket.send(JSON.stringify(ev));
		}

		this.recog.onresult = (event)=>{
		
			let data = event.results[0][0].transcript;
			console.log(data);

			let match = false;
			for(var i in this.filter){
				if(this.filter[i].test(data)){
					match = true;
					break;
				}
			}

			if(this.filter && match){
				socket.send(data);
			}
			else if (!this.filter)
				socket.send(data);
				
		};

		this.recog.onend = (event)=>{
			socket.send('STOPED_LISTENING');
			this.recog.isListening = false;
			if(this.recog.infiniteListen)
				this.recog.start();
		}

	}

	addGrammar(grammar,weight){
		let list = this.recog.grammars;
		list.addFromString(grammar,weight);
	}

	addFilter(expression){
		expression = this._convertExpression(expression);
		if(!this.filter)
			this.filter = [new RegExp(expression.source)];
		else{
			this.filter.push(expression);
		}
	}



	_convertExpression(expression){
		if(typeof expression === 'string')
			return new RegExp(expression);
		else
			return expression;
	}

}

var recog;
var socket = new SimpleWebsocket(`ws://localhost:${Number(window.location.port)+1}`);
var decoder = new TextDecoder('utf-8');
socket.on('data',(data)=>{
	let obj= JSON.parse(decoder.decode(data));
	console.log(obj);
	switch(obj.action){
		case 'init' :
			recog = new SpeechRecognition(obj.options);
			console.log(recog);
			break;
		case 'addGrammar' :
			if(!recog)
				return;
			recog.addGrammar(obj.grammar,obj.weight);
			break;
		case 'addFilter' :
			if(!recog)
				return;
			recog.addFilter(obj.expression);
			break;
		case 'start':
			console.log(recog.recog.isListening);
			if(!recog.recog.isListening)
				recog.recog.start();
			break;
		case 'end':
			if(recog.recog.isListening)
				recog.recog.stop();
			break;
	}
})