'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var classSchema = Schema({
  semester: String,
  classCode: String,
  pin: String
} );

module.exports = mongoose.model( 'Class', classSchema );
