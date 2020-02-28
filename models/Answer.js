'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const answerSchema = Schema({
    userId: ObjectId,
    questionId: ObjectId,
    userName: String,
    answer: String,
    createdAt: Date,
    profilePicURL: String,
    likes: Number,
    agreeList: [ObjectId],
    classCode: String
});

module.exports = mongoose.model('AnswerPost', answerSchema);