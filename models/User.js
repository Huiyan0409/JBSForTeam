'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var userSchema = Schema({
  googleid: String,
  googletoken: String,
  googlename:String,
  googleemail:String,
  userName: String,
  profilePicURL: String,
  lastUpdate: Date,
  zipcode: String,
  city: String,
  state: String
});

module.exports = mongoose.model( 'User', userSchema );
