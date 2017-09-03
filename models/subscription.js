var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subscriptionSchema = new mongoose.Schema({
	_id:false,
	email: String
});

var Subsription = new Schema({
  subscription: [subscriptionSchema]  
});

module.exports = mongoose.model('subscription', Subsription);