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
  profilePicName: String,
  status: String,
  lastUpdate: Date,
  zipcode: String,
  city: String,
  state: String,
  classCodes: [String],
  classIds: [Schema.Types.ObjectId],
  //For tutor
  introduction: String,
  score: Number,
  comments: [String],
  //characteristic
  patient: Boolean,
  excellentG: Boolean,
  askGood: Boolean,
  encouraging: Boolean,
  helpful: Boolean,
  abilityT: Boolean,
  gEnergy: Boolean,
  humility: Boolean,
  passionate: Boolean,
  onTime: Boolean,
  gPaced: Boolean,
  impatient: Boolean,
  notgTeaching: Boolean,
  late: Boolean,
  notPrepared: Boolean,
  notHelpful: Boolean,
  tutorClassProfessor: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model( 'User', userSchema );
