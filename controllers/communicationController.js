'use strict';
const Communication = require('../models/Communication');

exports.getCommunication = (req, res, next) => {
    const tuteeId = req.params.tuteeId;
    const tutorId = req.params.tutorId;
    Communication.find({
        $or: [
            {$and: [{userId: tuteeId}, {tuteeId: tuteeId}, {tutorId: tutorId}]},
            {$and: [{userId: tutorId}, {tuteeId: tuteeId}, {tutorId: tutorId}]}
        ]
    })
        .exec()
        .then((communications) => {
            res.locals.communications = communications;
            next()
        })
        .catch(error => {
            res.send(error);
        });
};

let tuteeEmail;
let tutorEmail;
let tuteeName;
let tutorName;
let userNameHere;
exports.getName = (req, res, next) => {
    const tuteeId = req.params.tuteeId;
    const tutorId = req.params.tutorId;
    User.findOne({_id: tuteeId})
        .exec()
        .then((tutee) => {
            res.locals.tuteeName = tutee.userName;
            tuteeEmail = tutee.googleemail;
            tuteeName = tutee.userName;
            next()
        });
    User.findOne({_id: tutorId})
        .exec()
        .then((tutor) => {
            res.locals.tutorName = tutor.userName;
            tutorEmail = tutor.googleemail;
            tutorName = tutor.userName;
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

let message;
exports.saveCommunication = (req, res) => {
    // console.log("tutorName: " + tutorName);
    let newCommunication = new Communication(
        {
            userId: req.user._id,
            userName: req.user.userName,
            tuteeId: req.params.tuteeId,
            tuteeName: req.body.tuteeName,
            tutorId: req.params.tutorId,
            tutorName: req.body.tutorName,
            comment: req.body.comment,
            profilePicURL: req.user.profilePicURL
        }
    );
    message = req.body.comment;
    newCommunication.save()
        .then(() => {
            send_notification(res);
            res.redirect('back');
        })
        .catch(error => {
            res.send(error);
        });
};

function send_notification(res) {
    console.log("message is: " + message);
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const messageToTutee = {
        to: tuteeEmail,
        from: "iclasterteam@gmail.com",
        subject: 'iClaster: a new message from ' + tutorName,
        text: 'Hi, you\'ve got a new message from ' + tutorName,
        html: 'Hi, you\'ve got a new message from a tutor: ' + tutorName + '<br>'
            + message +
            '<br><br>' + 'iClaster support team',
    };
    const messageToTutor = {
        to: tutorEmail,
        from: "iclasterteam@gmail.com",
        subject: 'iClaster: a new message from ' + tuteeName,
        text: 'Hi, you\'ve got a new message from ' + tuteeName,
        html: 'Hi, you\'ve got a new message from a tutee: ' + tuteeName + '<br>'
            + message +
            '<br><br>' + 'iClaster support team',
    };
    if (res.locals.user.userName === tuteeName) {
        sgMail.send(messageToTutor);
    }
    if (res.locals.user.userName === tutorName) {
        sgMail.send(messageToTutee);
    }
}

exports.getCommunicationBoard = (req, res) => {
    //find all users from database
    const id = res.locals.user._id;
    Communication.find({$or: [{tutorId: id}, {tuteeId: id}]})
        .exec()
        .then((communicationBoard) => {
            res.render('communicationBoard', {
                communicationBoard: communicationBoard
            });
        })

        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

