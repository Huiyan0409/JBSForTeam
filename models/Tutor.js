'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var tutorSchema = Schema({
  //User related
  profilePicURL: String,
  profilePicName: String,
  userId: ObjectId,
  userName: String,
  //tutor related
  introduction: String,
  score: Number,
  comments: [String],
  classCodes: [String],
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

module.exports = mongoose.model( 'Tutor', tutorSchema );
