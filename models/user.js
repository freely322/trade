const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { Schema } = mongoose;
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    hashKey: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    rangeKey: true
  }
})

userSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});


userSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({ username: username })
    .exec(function (err, user) {
        if (err) {
            return callback(err)
        } else if (!user) {
            let err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        
        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback(true);
            }
        })
    });
}

const User = mongoose.model('User', userSchema);
module.exports = User