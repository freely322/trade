var poloniex =  require('poloniex.js');

module.exports.init = function( apikey, apisecret){
	polon = new poloniex(
	apikey,
	apisecret
	);

	polon.STRICT_SSL = false;

	return polon;
}

на

module.exports.getBallance = function( entity, callback ){
	entity.returnBalances(callback);/*(err,data) =>{
		if(err)console.log(err);
		console.log(data);
		return data;
	});	*/
}


module.exports.makeOrder = function( entity, orderdata, callback ){
	curencyA = orderdata.symbol.substring(0,3);
	curencyB = orderdata.symbol.substring(4);	
	if ( orderdata.isbuy === "buy" ){
		entity.buy(curencyA,curencyB, '0.1', orderdata.quantity,callback);
	} else {
		entity.sell(curencyA,curencyB, '0.1', orderdata.quantity,callback);
	}	
}

module.exports.getOrdersHistory = function(entity, callback){
	entity.returnOrderBook("all", callback);
}

module.exports.cancelOrder = function (entity,sym,orderNumber, callback){
	sym1;
	sym2;
	entity.cancelOrder(orderNumber,callback);
}

module.exports.getTick = function( entity,sym, callback){
	callback('', 'lol');
}

module.exports.getActiveOrderBook = function(entity, callback){
	entity.returnOpenOrders("all",callback);
}

module.exports.getSymbols = function(entity, callback){
	entity.returnTicker((err,data)=>{
		callback(err,Object.keys(data));
	});
}