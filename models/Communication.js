'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const communicationSchema = Schema({
    userId: ObjectId,
    userName: String,
    tuteeId: ObjectId,
    tuteeName: String,
    tutorId: ObjectId,
    tutorName: String,
    comment: String,
    profilePicURL: String
});

module.exports = mongoose.model('communication', communicationSchema);
