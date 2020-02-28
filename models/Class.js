'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const classSchema = Schema({
    // semester: String,
    subject: String,
    courseNum: String,
    classCode: String
    // pin: String
});

module.exports = mongoose.model('Class', classSchema);
