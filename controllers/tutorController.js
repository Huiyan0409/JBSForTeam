'use strict';
// const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');


exports.saveTutor = (req, res) => {
    if (!res.locals.loggedIn) {
        return res.send("You must be logged in to become a tutorRegister.")
    }
    User.findOne(res.locals.user._id)
        .exec()
        .then((profile) => {
            console.log("user is found! " + profile);
            profile.introduction = req.body.selfIntro;
            profile.status = "tutor";
            profile.score = 0;
            profile.comments = [];
            profile.tutorClassCodes = req.body.chosen;
            profile.patient = 0;
            profile.excellentG = 0;
            profile.askGood = 0;
            profile.encouraging = 0;
            profile.helpful = 0;
            profile.abilityT = 0;
            profile.gEnergy = 0;
            profile.humility = 0;
            profile.passionate = 0;
            profile.onTime = 0;
            profile.gPaced = 0;
            profile.impatient = 0;
            profile.notgTeaching = 0;
            profile.late = 0;
            profile.notPrepared = 0;
            profile.notHelpful = 0;
            console.log("profile: " + profile);
            profile.save();
        })
        .then(() => {
            console.log("update success");
            res.redirect('/showTutors');
        })
        .catch(error => {
            console.log("update failed");
            res.send(error);
        });
};

exports.showMyTutorProfile = (req, res) => {

    //grab id from the URL, the red id is set by app.js where the URL is formed
    User.findOne(res.locals.user._id)
        .exec()
        .then((tutor) => {
            res.render('myProfile', {
                tutor: tutor
            });
        })
        //catch error
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};


//load profile of current user
exports.showOldTutorProfile = (req, res) => {
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((tutor) => {
            console.log("in show old profile");
            res.render('editMyTutorProfile', {
                tutor: tutor
            });
        })
        .catch(function (error) {
            console.log(error);
        })
};

//load profile of current user
exports.showTutorRatingProfile = (req, res) => {
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((tutor) => {
            console.log("in show old profile");
            res.render('tutorRatings');
        })
        .catch(function (error) {
            console.log(error);
        })
};

//update personal profile
exports.updateTutorProfile = (req, res) => {
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((tutor) => {
            tutor.introduction = req.body.introduction;
            tutor.tutorClassCodes = req.body.chosen;
            tutor.save()
        })
        .then(() => {
            res.redirect('/myProfile/' + id)
        })
        // handle error
        .catch(function (error) {
            console.log("update failed!");
            console.log(error);
        })
};

exports.updateTutorRatingProfile = (req, res) => {
    const goBackURL = '/tutorRatings/' + req.params.id;
    if (req.body.userName.length == 0) {
        console.log("empty params detected in profile");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((tutor) => {
            tutor.introduction = req.body.introduction
        })
        .then(() => {
            res.redirect('/tutorRatings/' + id)
        })
        // handle error
        .catch(function (error) {
            console.log("update failed!");
            console.log(error);
        })
};

exports.getAllTutorProfile = (req, res) => {
    //find all users from database
    User.find().sort({score: -1})
        .exec()
        .then((tutors) => {
            res.render('showTutors', {
                tutors: tutors
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.getAllTutorRatingProfile = (req, res) => {
    //find all users from database
    User.find()
        .exec()
        .then((tutors) => {
            res.render('tutorRating', {
                tutors: tutors
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

//get personal profile from admin permission, view them individually
exports.getOneTutorProfile = (req, res) => {

    //grab id from the URL, the red id is set by app.js where the URL is formed
    const tutorId = req.params.tutorId;
    // const userId = req.params.userId

    User.findOne({_id: tutorId})
        .exec()
        .then((tutor) => {
            res.render('communication', {
                tutor: tutor,
                req: req
            });
        })

        //catch error
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.getName = (req, res, next) => {
    const tuteeId = req.params.tuteeId;
    const tutorId = req.params.tutorId;
    User.findOne({_id: tuteeId})
        .exec()
        .then((tutee) => {
            res.locals.tuteeName = tutee.userName;
            res.locals.tuteeEmail = tutee.googleemail;
            next()
        });
    User.findOne({_id: tutorId})
        .exec()
        .then((tutor) => {
            res.locals.tutorName = tutor.userName;
            res.locals.tutorEmail = tutor.googleemail;
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.updateAppointment = (req, res, next) => {
    const tuteeId = req.params.tuteeId;
    const tutorId = req.params.tutorId;
    const date = req.body.appointmentDate;
    const time = req.body.appointmentTime;
    const startAt = date.concat("  ", time);

    // console.log("userName is: " + userName);

    let newAppointment = new Appointment(
        {
            tutorId: tutorId,
            tuteeId: tuteeId,
            tutorName: req.body.tutorName,
            tuteeName: req.body.tuteeName,
            startAt: startAt,
            length: req.body.length,
            // price: req.body.price,
            classCode: req.body.classCode,
            status: "incomplete"
        }
    );
    newAppointment.save()
        .then(() => {
            send_email(req, res);
            //redirect to dashboard
            res.redirect('/taskBoard');
        })
        .catch(error => {
            res.send(error);
        });
};

function send_email(req, res) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msgToTutee = {
        to: res.locals.tuteeEmail,
        from: res.locals.tutorEmail,
        subject: 'Your iClaster tutor appointment is set',
        text: 'Hi, your appointment with ' + req.locals.tutorName + ' is set',
        html: 'Hi, your appointment with tutor: '
            // req.locals.tutorName + ' ' +
            // req.locals.tutorEmail + '.'
            // ' is set on' + res.locals.startAt,
    };
    console.log(res.locals.tuteeEmail);
    console.log(res.locals.tutorEmail);
    sgMail.send(msgToTutee);

    // const msgToTutor = {
    //     to: res.locals.tutorEmail,
    //     from: res.locals.tuteeEmail,
    //     subject: 'Your iClaster tutor appointment is set',
    //     text: 'Hi, your appointment with ' + req.locals.tuteeName + ' is set',
    //     html: 'Hi, your appointment with student: ' +
    //         req.locals.tuteeName + ' ' +
    //         req.locals.tuteeEmail + '.'
    //         // ' is set on' + res.locals.startAt,
    // };
    // sgMail.send(msgToTutor);
}


exports.getAppointments = (req, res) => {
    //find all users from database
    const id = res.locals.user._id;
    Appointment.find({$or: [{tutorId: id}, {tuteeId: id}]}).sort({status: -1})
        .exec()
        .then((appointments) => {
            res.render('taskBoard', {
                appointments: appointments
            });
            // console.log("123123121" + appointments);
        })

        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.getOneAppointment = (req, res) => {

    //grab id from the URL, the red id is set by app.js where the URL is formed
    const appointmentId = req.params.appointmentId;
    const tutorId = req.params.tutorId;
    // const userId = req.params.userId

    Appointment.findOne({_id: appointmentId})
        .exec()
        .then((appointment) => {
            appointment.status = "complete";
            console.log("status changed");
            console.log(appointment.status);
            res.render('tutorRatings', {
                appointment: appointment
            });
            console.log("information find");
            console.log(appointment.tutorName);
            appointment.save()
        })

        //catch error
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.saveRating = (req, res) => {
    const appointmentId = req.params.appointmentId;
    console.log("appointmentId: " + appointmentId);
    const tutorId = req.params.tutorId;
    console.log("p:" + req.body.patient);
    User.findOne({_id: tutorId})
        .exec()
        .then((user) => {
            console.log('about to update user ...');
            console.dir(user);
            console.log("body=");
            console.dir(req.body);
            user.comments.push(req.body.comment);
            user.score = Number(user.score || 0) + Number(req.body.star);
            user.score = Number(user.score) / Number(user.comments.length);
            user.patient = Number(user.patient || 0) + Number(req.body.patient || 0);
            user.excellentG = Number(user.excellentG || 0) + Number(req.body.excellentG || 0);
            user.askGood = Number(user.askGood || 0) + Number(req.body.askGood || 0);
            user.encouraging = Number(user.encouraging || 0) + Number(req.body.encouraging || 0);
            user.helpful = Number(user.helpful || 0) + Number(req.body.helpful || 0);
            user.abilityT = Number(user.abilityT || 0) + Number(req.body.abilityT || 0);
            user.gEnergy = Number(user.gEnergy || 0) + Number(req.body.gEnergy || 0);
            user.humility = Number(user.humility || 0) + Number(req.body.humility || 0);
            user.passionate = Number(user.passionate || 0) + Number(req.body.passionate || 0);
            user.onTime = Number(user.onTime || 0) + Number(req.body.onTime || 0);
            user.gPaced = Number(user.gPaced || 0) + Number(req.body.gPaced || 0);
            user.impatient = Number(user.impatient || 0) + Number(req.body.impatient || 0);
            user.notgTeaching = Number(user.notgTeaching || 0) + Number(req.body.notgTeaching || 0);
            user.late = Number(user.late || 0) + Number(req.body.late || 0);
            user.notPrepared = Number(user.notPrepared || 0) + Number(req.body.notPrepared || 0);
            user.notHelpful = Number(user.notHelpful || 0) + Number(req.body.notPrepared || 0);
            console.log("data saved");
            console.dir(user);
            user.save()
        })
        .then(() => {
            res.redirect("/taskBoard")
        })
        .catch(function (error) {
            console.log("Saving Ratings failed!");
            console.log(error);
        })
};
