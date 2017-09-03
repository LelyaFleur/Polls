var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Census = new Schema({
  dni: String,
  birthdate: String 
  
});

module.exports = mongoose.model('census', Census);
