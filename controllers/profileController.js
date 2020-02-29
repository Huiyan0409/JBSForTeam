'use strict';
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const path = require('path');


//get personal profile from admin permission, view them individually
exports.showMyProfile = (req, res) => {

    //grab id from the URL, the red id is set by app.js where the URL is formed
    User.findOne(res.locals.user._id)
        .exec()
        .then((profile) => {
            res.render('myProfile', {
                profile: profile
            });
        })
        //catch error
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};


//load profile of current user
exports.showOldProfile = (req, res) => {
    const id = req.params.id
    User.findOne({_id: id})
        .exec()
        .then((profile) => {
            console.log("in show old profile");
            res.render('editMyProfile', {
                profile: profile
            });
        })
        .catch(function (error) {
            console.log(error);
        })
};

//update personal profile
exports.updateProfile = (req, res) => {
    const goBackURL = '/editMyProfile/' + req.params.id;
    let checked = req.body.receiveUpdate === "on";
    if (req.body.userName.length === 0 || req.body.status.length === 0) {
        console.log("empty params detected in profile");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((profile) => {
            profile.userName = req.body.userName;
            profile.status = req.body.status;
            profile.receiveUpdate = checked;
            profile.save()
        });

    Question.updateMany({userId: req.user._id}, {userName: req.body.userName}, {multi: true})
        .exec()
    Answer.updateMany({userId: req.user._id}, {userName: req.body.userName}, {multi: true})
        .exec()
        .then(() => {
            res.redirect('/myProfile/' + id)
        })
        .catch((error) => {
            res.send(error)
        })
};

//update personal profile
exports.updateProfileFirstTime = (req, res) => {
    const goBackURL = '/editMyProfile/' + req.params.id;
    let checked = req.body.receiveUpdate === "on";
    if (req.body.userName.length === 0 || req.body.status.length === 0) {
        console.log("empty params detected in profile");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((profile) => {
            profile.userName = req.body.userName;
            profile.status = req.body.status;
            profile.receiveUpdate = checked;
            profile.save()
        });
    Question.updateMany({userId: req.user._id}, {userName: req.body.userName}, {multi: true})
        .exec();
    Answer.updateMany({userId: req.user._id}, {userName: req.body.userName}, {multi: true})
        .exec()
        .then(() => {
            res.redirect('/')
        })
        .catch((error) => {
            res.send(error)
        })
};

//get all profiles for all users, visible only when admin is logged in
exports.getAllProfiles = (req, res) => {
    //find all users from database
    User.find()
        .exec()
        .then((profiles) => {
            res.render('showProfiles', {
                profiles: profiles
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

//get personal profile from admin permission, view them individually
exports.getOneProfile = (req, res) => {

    //grab id from the URL, the red id is set by app.js where the URL is formed
    const id = req.params.id;
    User.findOne({_id: id})
        .exec()
        .then((profile) => {
            res.render('showProfile', {
                profile: profile
            });
        })
        //catch error
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};
