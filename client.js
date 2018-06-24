class SpeechRecognition{
	constructor(options){
		let recog = this._recog;
		recog = new webkitSpeechRecognition();
		if(options.lang !== undefined)
			recog.lang !== options.lang;
		if(options.interimResults)
			recog.interimResults = options.interimResults;
		if(options.continuous)
			recog.continuous = options.continuous;
		if(options.maxAlternatives !== undefined)
			recog.maxAlternatives = options.maxAlternatives;
		if(options.serviceURI !== undefined)
			recog.serviceURI = options.serviceURI;
		if(options.infiniteListen){
			recog.onend = (event)=>{
				recog.start();
			};
		}
	
		this.recog = recog;
		this.recog.grammars = new webkitSpeechGrammarList();

		this.recog.onstart = ()=>{
			// console.log('running');
		}
		this.recog.onerror = (ev)=>{
			console.log(ev);
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

			this.recog.start();
		}

	}

	addGrammar(grammar,weight){
		let list = this.recog.grammars;
		list.addFromString(grammar,weight);
	}

	addFilter(expression){
		expression = this._convertExpression(expression);
		console.log(expression);
		if(!this.filter)
			this.filter = [new RegExp(expression.source)];
		else{
			this.filter.push(expression);
		}
		console.log(this.filter);
	}



	_convertExpression(expression){
		if(typeof expression === 'string')
			return new RegExp(expression);
		else
			return expression;
	}

}

var recog;


var socket = new SimpleWebsocket("ws://localhost:8080");
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
			console.log('starting');
			recog.recog.start();
			break;
		case 'end':
			recog.recog.stop();
			break;
	}
})