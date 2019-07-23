'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
var orderSchema = Schema( {
  tutorId: ObjectId,
  tutorName: String,
  tuteeId: ObjectId,
  tuteeName: String,
  startAt: Date,
  endAt: Date,
  payment: Number,
  status: String,
  score: Number,
  comment: String,
  tags: [String]
} );

module.exports = mongoose.model( 'Order', orderSchema );
