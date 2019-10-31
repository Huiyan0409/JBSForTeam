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

exports.saveCommunication = (req, res) => {

    console.log("tutor name is " + req.body.tutorName);
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
    newCommunication.save()
        .then(() => {
            res.redirect('back');
        })
        .catch(error => {
            res.send(error);
        });
};

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

