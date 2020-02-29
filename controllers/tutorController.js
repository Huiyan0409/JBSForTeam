'use strict';
// const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Class = require('../models/Class');


exports.getAllClasses = (req, res) => {
    //find all users from database
    Class.find()
        .exec()
        .then((classes) => {
            res.render('tutorRegister', {
                classes: classes
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.saveTutor = (req, res) => {
    if (!res.locals.loggedIn) {
        return res.send("You must be logged in to become a tutorRegister.")
    }
    User.findOne(res.locals.user._id)
        .exec()
        .then((profile) => {
            // console.log("user is found! " + profile);
            profile.introduction = req.body.selfIntro;
            profile.tutorClassCodes = req.body.chosen;
            // automatically subscript to the classes the user chooses to tutor for
            console.log("chosen len: " + req.body.chosen.length);
            console.log(typeof req.body.chosen);
            if (typeof req.body.chosen == "string" && !profile.classCodes.includes(req.body.chosen)) {
                profile.classCodes.push(req.body.chosen);
            }
            if (typeof req.body.chosen == "object") {
                for (let i = 0; i < req.body.chosen.length; i++) {
                    if (!profile.classCodes.includes(req.body.chosen[i])) {
                        profile.classCodes.push(req.body.chosen[i]);
                    }
                }
            }
            profile.status = "tutor";
            if (profile.score == null) {
                profile.score = 0;
            }
            if (profile.comments == null) {
                profile.comments = [];
            }
            if (profile.patient == null) {
                profile.patient = 0;
            }
            if (profile.excellentG == null) {
                profile.excellentG = 0;
            }
            if (profile.askGood == null) {
                profile.askGood = 0;
            }
            if (profile.encouraging == null) {
                profile.encouraging = 0;
            }
            if (profile.helpful == null) {
                profile.helpful = 0;
            }
            if (profile.abilityT == null) {
                profile.abilityT = 0;
            }
            if (profile.gEnergy == null) {
                profile.gEnergy = 0;
            }
            if (profile.humility == null) {
                profile.humility = 0;
            }
            if (profile.passionate == null) {
                profile.passionate = 0;
            }
            if (profile.onTime == null) {
                profile.onTime = 0;
            }
            if (profile.gPaced == null) {
                profile.gPaced = 0;
            }
            if (profile.impatient == null) {
                profile.impatient = 0;
            }
            if (profile.notgTeaching == null) {
                profile.notgTeaching = 0;
            }
            if (profile.late == null) {
                profile.late = 0;
            }
            if (profile.notPrepared == null) {
                profile.notPrepared = 0;
            }
            if (profile.notHelpful == null) {
                profile.notHelpful = 0;
            }
            // console.log("profile: " + profile);
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

let tuteeEmail;
let tutorEmail;
let tuteeName;
let tutorName;
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

let startTime;
let length;
let classCode;
exports.updateAppointment = (req, res) => {
    const tuteeId = req.params.tuteeId;
    const tutorId = req.params.tutorId;
    const date = req.body.appointmentDate;
    const time = req.body.appointmentTime;
    const startAt = date.concat("  ", time);
    startTime = startAt;
    length = req.body.length;
    classCode = req.body.classCode;
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
            send_email();
            //redirect to dashboard
            res.redirect('/taskBoard');
        })
        .catch(error => {
            res.send(error);
        });
};

function send_email() {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const messageToTutee = {
        to: tuteeEmail,
        from: 'iclasterteam@gmail.com',
        subject: 'iClaster: appointment with ' + tuteeName + ' is set',
        text: 'Hi, your appointment is set',
        html: 'Hi, ' + '<br><br>' + 'Your appointment with tutor: <strong> ' + tutorName + '</strong> is set' +
            '<br>' + 'Class: ' + classCode +
            '<br>' + 'Time: ' + startTime +
            '<br>' + 'Length: ' + length +
            '<br>' + 'Please add this event to your calendar' +
            '<br><br>' + 'iClaster support team',
    };
    sgMail.send(messageToTutee);
    const messageToTutor = {
        to: tutorEmail,
        from: "iclasterteam@gmail.com",
        subject: 'iClaster: appointment with' + tutorName + ' is set',
        text: 'Hi, your appointment is set',
        html: 'Hi, ' + '<br><br>' + 'Your appointment with student: <strong> ' + tuteeName + '</strong> is set' +
            '<br>' + 'Class: ' + classCode +
            '<br>' + 'Time: ' + startTime +
            '<br>' + 'Length: ' + length +
            '<br>' + 'Please add this event to your calendar' +
            '<br><br>' + 'iClaster support team',
    };
    sgMail.send(messageToTutor);
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
