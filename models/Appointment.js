'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
var appointmentSchema = Schema( {
  tutorId: ObjectId,
  tutorName: String,
  tuteeId: ObjectId,
  tuteeName: String,
  startAt: Date,
  endAt: Date,
  price: Number,
  classCode: String,
  status: String
} );

module.exports = mongoose.model( 'Appointment', appointmentSchema );
