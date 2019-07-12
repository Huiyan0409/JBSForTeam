'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var tutorSchema = Schema( {
  userId: ObjectId,
  userName: String,
  classCode: String,
  professor: String,
  score: Number,
  comments: [String],
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
  notHelpful: Boolean
} );

module.exports = mongoose.model( 'Tutor', tutorSchema );
