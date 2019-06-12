'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var postSchema = Schema({
  id: String,
  post: String,
  time: Date
});

module.exports = mongoose.model('post', postSchema);
