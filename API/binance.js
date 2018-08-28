const binan = require('node-binance-api');
module.exports.init = function( apikey, apisecret){

	binan.options({
	  APIKEY: apikey,
	  APISECRET: apisecret,
	  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
	  test: false // If you want to use sandbox mode where orders are simulated
	});

	return binan;
}

module.exports.getBallance = function( entity , callback){
		console.log('getbalance');
		entity.balance(callback);/*(error, balances) => {
		  console.log("balances()", balances);
		  return balances;
		});*/
	}

module.exports.makeOrder =  function( entity, orderdata, callback ){
		if ( orderdata.isbuy === "buy" ){
			entity.marketBuy(orderdata.symbol, orderdata.quantity,callback);
		} else {
			entity.marketSell(orderdata.symbol, orderdata.quantity,callback);
		}
	}

module.exports.getOrdersHistory = function(entity, callback){
	entity.allOrders(false,callback);
}

module.exports.getTick = function( entity,sym, callback){
	entity.bookTickers(sym, callback);
}

module.exports.cancelOrder = function (entity,sym,orderNumber, callback){
	entity.cancel(sym, orderNumber, (error, response, symbol) => {
	  callback( error, response);
	});
}

module.exports.getActiveOrderBook = function(entity, callback){
	entity.openOrders(false,callback);
}

module.exports.getSymbols = function(entity, callback){
	entity.prices((err, ticker)=>{
		callback(err, Object.keys(ticker))
	});
}