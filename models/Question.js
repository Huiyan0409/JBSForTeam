'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var questionSchema = Schema( {
  //questionId: ObjectId,
  userId: ObjectId,
  userName: String,
  question: String,
  description: String,
  createdAt: Date
} );

module.exports = mongoose.model( 'QuestionPost', questionSchema );
