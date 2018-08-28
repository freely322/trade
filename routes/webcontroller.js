const _ = require('lodash');
const path = require('path');
const User = require('../models/user.js');
const Apis = require('../models/apis.js');

cntrl = require('../API/controller.js');

function makeOrder( userid, acc, tag, symbol, aco, amount, isbuy, callback) {
	Apis.findOne({ name:acc }, (err, api)=>{
		if(!api) callback({status:'no api' + acc});
		c = cntrl.init( tag, api.key, api.secret, callback);
		cntrl.makeOrder( tag, c, symbol, aco, amount, isbuy, callback );
	});
}

function makeOrderTPSL( userid, acc, tag, symbol, aco, values, callback) {
	console.log(values, 'From webcontroller...');
	Apis.findOne({ userid:userid }, (err, api)=>{
		if(!api) callback({status:'no api' + acc});
		c = cntrl.init( tag, api.key, api.secret, callback);
		cntrl.makeOrderTPSL( tag, c, symbol, aco, values, callback );
	});
}

function makeOrderLimited( userid, acc, tag, symbol, aco, amount, isbuy, price, callback){
	Apis.findOne({ userid:userid }, (err, api)=>{
		if(!api) callback({status:'no api ' + acc});
		c = cntrl.init( tag, api.key, api.secret, callback);
		cntrl.makeOrderLimited( tag, c, symbol, aco,  amount, isbuy, price, callback );
	});
}

module.exports = function ( ws, userid, acounts, symbol, body) {
	tag = body["tag"];
	aco = body['aco'];
	type = body['type'];

	promise = Promise.resolve();
	acounts.forEach(acc =>{
		promise = promise.then(()=>{
			switch(type){
				case 'tpsl':
				makeOrderTPSL(userid,acc.name,tag,symbol,aco,body["values"], (message)=>{
					ws.send(JSON.stringify(message));
				});
				break;
				case 'market':
				makeOrder(userid,acc.name,tag,symbol,aco,body["amount"],body["isbuy"], (message)=>{
					ws.send(JSON.stringify(message));
				});
				break;
				case 'limited':
				makeOrderLimited(userid,acc.name,tag,symbol,aco,body["amount"],body["isbuy"],body["price"], (message)=>{
					ws.send(JSON.stringify(message));
				});
			}
		});
	});
	
};