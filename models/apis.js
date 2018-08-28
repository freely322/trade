const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user.js');

let apisSchema = new Schema({
	userid: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User._id'
	},
	name:{
		type:String,
		required:true
	},
	tag: {
		type: String,
        required: true,
	},
	type: {
		type: String,
        required: true,
	},
	key: {
		type: String,
        required: true,
	},
	secret : {
		type: String,
        required: true,
	}
});

apisSchema.pre('save', function(next) {
	console.log('saved');
	next();
});
apisSchema.pre('remove', function(next){
	console.log('removed');
	next();
});

apisSchema.statics.get = function(id, callback){
	Apis.find({userid:id})
	.exec(function (err, apis) {
		console.log('get data:'+(apis));
        if (err) {
        	console.log('error');
            return callback(err)
        } else if (!apis) {
        	console.log('no api');
            var err = new Error('No apis found');
            err.status = 401;
            return callback(err);
        }else
        	return callback(null, apis);
    });

};

var Apis = mongoose.model('Apis', apisSchema);
module.exports = Apis;
