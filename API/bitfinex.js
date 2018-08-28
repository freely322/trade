const BFX = require('bitfinex-api-node');

module.exports.init = function( apikey, apisecret){
	const bfx = new BFX({
		apiKey: apikey,
		apiSecret: apisecret,
	});

	return bfx.rest(1);
}

module.exports.getBallance = function( entity,callback ){
	entity.wallet_balances((err,res) =>{
		if(err) console.log(err);
		console.log(res);
		return res;
	});
}

module.exports.makeOrder = function( entity, symbol, aco, amount, isbuy, callback ) {

	switch(aco){
		case 'exchange':
		orderOne = {
			symbol: symbol,
			amount: amount,
			price:'1000',
			exchange:'bitfinex',
			side: isbuy,
			type:'exchange market'
		};
		orders = [orderOne];

		entity.multiple_new_orders(orders, (err, res) => {
		  	if (err) console.log(err);
		  	
		  	console.log(res);
		})
		break;
		case 'margin':
		console.log('Order is made to MARGIN');
		orderOne = {
			symbol: symbol,
			amount: amount,
			price:'1000',
			exchange:'bitfinex',
			side: isbuy,
			type:'market'
		};
		orders = [orderOne];

		entity.multiple_new_orders(orders, (err, res) => {
		  	if (err) console.log(err)
		  	if (res) callback({status:'ok'});
		  	else callback({status:'error'});
		})
		break;
	}

	
}

class generateOrder {
	constructor(index, symbol, orderdata) {
		this.symbol = symbol;
		this.orderdata = orderdata;
		this.index = index;
	}

	createOrderTP() {
		let order = {
			symbol: this.symbol,
			amount: this.orderdata.tp[this.index].deposit,
			price: this.orderdata.tp[this.index].amount,
			exchange:'bitfinex',
			side: 'sell',
			type:'exchange limit'
		}
		return order;
	}

	createOrderSL() {
		let order = {
			symbol: this.symbol,
			amount: this.orderdata.sl[this.index].deposit,
			price: this.orderdata.sl[this.index].amount,
			exchange:'bitfinex',
			side: 'sell',
			type:'exchange stop'
		}
		return order;
	}
}

module.exports.makeOrderTPSL = function(entity, symbol, aco, orderdata, callback) {
	console.log(orderdata);
	orders = [];
	switch(aco){
		case 'exchange':
		if (orderdata.tp.length) {
			for (let i = 0; i < orderdata.tp.length; i++) {
				let orderThree = new generateOrder(i, symbol, orderdata).createOrderTP();
				orders.push(orderThree);
			}
		}
		if (orderdata.sl.length) {
			for (let i = 0; i < orderdata.tp.length; i++) {
				let orderFive = new generateOrder(i, symbol, orderdata).createOrderSL();
				orders.push(orderFive);
			}
		}
		console.log(orders);

		break;
		case 'margin':
		for( tp in orderdata["tp"]){
			orderOne = {
				symbol: symbol,
				amount: tp.amount,
				price: tp.price,
				exchange:'bitfinex',
				side: 'buy',
				type:'stop'
			};
			orders.push(orderOne);
		}
		for( sl in orderdata["sl"]){
			orderOne = {
				symbol: symbol,
				amount: sl.amount,
				price: sl.price,
				exchange:'bitfinex',
				side: 'sell',
				type:'stop'
			};
			orders.push(orderOne);
		}
		break;
	}
	
	
	entity.multiple_new_orders(orders, (err, res) => {
	  	if (err) console.log(err)
	  	console.log(res);
		callback({status:'ok'});
	})
}

module.exports.makeOrderLimited = function(entity, symbol, aco, amount, isbuy, price, callback) {
	switch(aco){
		case 'exchange':
		orderOne = {
			symbol: symbol,
			amount: amount,
			price: price,
			exchange:'bitfinex',
			side: isbuy,
			type:'exchange limit'
		};
		orders = [orderOne];

		entity.multiple_new_orders(orders, (err, res) => {
		  	if (err) console.log(err)
		  	console.log(res);
		})
		break;
		case 'margin':
		orderOne = {
			symbol: symbol,
			amount: amountL,
			price: priceF,
			exchange:'bitfinex',
			side: isbuy,
			type:'limit'
		};
		orders = [orderOne];

		entity.multiple_new_orders(orders, (err, res) => {
		  	if (err) console.log(err)
		  	console.log(res);
			callback({status:'ok'});
		})
		break;
	}
}

module.exports.getTick = function(entity, sym, callback) {
	return entity.ticker(sym);
}

module.exports.getOrdersHistory = function(entity, callback){
	entity.orders_history(callback);
}

module.exports.cancelOrder = function (entity,sym,orderNumber, callback){
	entity.cancel_order( orderNumber, callback);
}

module.exports.getActiveOrderBook = function(entity, callback){
	entity.active_orders(callback);
}

module.exports.getSymbols = function(entity, callback){
	entity.get_symbols(callback);
}