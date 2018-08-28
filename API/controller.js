const binance = require('./binance.js');
const bitfinex = require('./bitfinex');
var poloniex =  require('./poloniex.js');



module.exports.init = function(tag, apikey, apisecret){
	switch(tag){
		case 'binance':
			return binance.init(apikey,apisecret);
			break;
		case 'bitfinex':
			return bitfinex.init(apikey,apisecret);
			break;
		case 'poloniex':
			return poloniex.init(apikey,apisecret);
			break;
	}
}
module.exports.getBallance = function( tag, entity, callback){
		console.log(tag+":"+entity);
		switch(tag){
			case 'binance':
				console.log(binance);
				return binance.getBallance(entity, callback);
				break;
			case 'bitfinex':
				console.log(bitfinex);
				return bitfinex.getBallance(entity, callback);
				break;
			case 'poloniex':
				console.log(poloniex);
				return poloniex.getBallance(entity, callback);
				break;
	}
}

module.exports.makeOrder =  async (tag, entity, symbol, aco, amount, isbuy, callback ) => {
		switch(tag){
			case 'binance':
				console.log(binance);
				const response = await binance.makeOrder(entity, symbol, aco, amount, isbuy, callback );
				return response;
				break;
			case 'bitfinex':
				console.log(bitfinex);
				return bitfinex.makeOrder(entity, symbol, aco, amount, isbuy, callback );
				break;
			case 'poloniex':
				console.log(poloniex);
				return poloniex.makeOrder(entity, symbol, aco, amount, isbuy, callback );
				break;
		}
};

module.exports.makeOrderTPSL = function (tag, entity, symbol, aco, amount, isbuy, callback) {
		switch(tag){
			case 'binance':
				console.log(binance);
				return binance.makeOrderTPSL(entity, symbol, aco, amount, isbuy, callback);
				break;
			case 'bitfinex':
				console.log(bitfinex);
				return bitfinex.makeOrderTPSL(entity, symbol, aco, amount, isbuy, callback);
				break;
			case 'poloniex':
				console.log(poloniex);
				return poloniex.makeOrderTPSL(entity, symbol, aco, amount, isbuy, callback);
				break;
		}
};

module.exports.makeOrderLimited = function (tag, entity, symbol, aco,  amount, isbuy, price, callback) {
		switch(tag){
			case 'binance':
				console.log(binance);
				return binance.makeOrderLimited(entity, symbol, aco,  amount, isbuy, price, callback);
				break;
			case 'bitfinex':
				console.log(bitfinex);
				return bitfinex.makeOrderLimited(entity, symbol, aco,  amount, isbuy, price, callback);
				break;
			case 'poloniex':
				console.log(poloniex);
				return poloniex.makeOrderLimited(entity, symbol, aco,  amount, isbuy, price, callback);
				break;
		}
};


module.exports.getSymbols = function (tag, entity,callback) {
	switch(tag){
			case 'binance':
				console.log(binance);
				return binance.getSymbols(entity, callback);
				break;
			case 'bitfinex':
				console.log(bitfinex);
				return bitfinex.getSymbols(entity, callback);
				break;
			case 'poloniex':
				console.log(poloniex);
				return poloniex.getSymbols(entity, callback);
				break;
		}
}

module.exports.getOrdersHistory = function( tag, entity, callback){
	switch(tag){
			case 'binance':
				return binance.getOrdersHistory(entity, callback);
				break;
			case 'bitfinex':
				return bitfinex.getOrdersHistory(entity, callback);
				break;
			case 'poloniex':
				return poloniex.getOrdersHistory(entity, callback);
				break;
		}
}

module.exports.getActiveOrderBook = function( tag, entity,callback) {
	switch(tag){
			case 'binance':
				return binance.getActiveOrderBook(entity, callback);
				break;
			case 'bitfinex':
				return bitfinex.getActiveOrderBook(entity, callback);
				break;
			case 'poloniex':
				return poloniex.getActiveOrderBook(entity, callback);
				break;
		}
}

module.exports.cancelOrder = function(tag, entity,sym,orderNumber, callback){
	switch(tag){
			case 'binance':
				return binance.cancelOrder(entity,sym,orderNumber, callback);
				break;
			case 'bitfinex':
				return bitfinex.cancelOrder(entity,sym,orderNumber, callback);
				break;
			case 'poloniex':
				return //poloniex.cancelOrder(entity,sym,orderNumber, callback);
				break;
		}
}

module.exports.getTick = function(tag, entity,sym, callback) {
	switch(tag){
			case 'binance':
				return binance.getTick(entity,sym, callback);
				break;
			case 'bitfinex':
			 	return bitfinex.getTick(entity,sym,callback);
				break;
			case 'poloniex':
				return //poloniex.getTick(entity,sym, callback);
				break;
		}
}



module.exports.binance = binance;
module.exports.bitfinex = bitfinex;
module.exports.poloniex = poloniex;