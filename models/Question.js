'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const questionSchema = Schema({
    userId: ObjectId,
    userName: String,
    question: String,
    haveDone: String,
    helpWith: String,
    createdAt: Date,
    classCode: String,
    answerNum: Number
});

module.exports = mongoose.model('QuestionPost', questionSchema);
