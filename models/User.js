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
  // profilePicName: String,
  status: String,
  lastUpdate: Date,
  // zipcode: String,
  // city: String,
  // state: String,
  classCodes: [String],
  // classIds: [Schema.Types.ObjectId],
  //tutor related
  introduction: String,
  score: Number,
  comments: [String],
  tutorClassCodes: [String],
  //characteristic
  patient: Number,
  excellentG: Number,
  askGood: Number,
  encouraging: Number,
  helpful: Number,
  abilityT: Number,
  gEnergy: Number,
  humility: Number,
  passionate: Number,
  onTime: Number,
  gPaced: Number,
  impatient: Number,
  notgTeaching: Number,
  late: Number,
  notPrepared: Number,
  notHelpful: Number
});

module.exports = mongoose.model( 'User', userSchema );
