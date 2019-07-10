'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var classSchema = Schema({
  semester: String,
  code: String,
  pin: String,
  userEmail: String
} );

module.exports = mongoose.model( 'Class', classSchema );
