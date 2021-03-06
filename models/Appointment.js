'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const appointmentSchema = Schema({
    tutorId: ObjectId,
    tutorName: String,
    tuteeId: ObjectId,
    tuteeName: String,
    startAt: String,
    length: Number,
    // price: Number,
    classCode: String,
    status: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
