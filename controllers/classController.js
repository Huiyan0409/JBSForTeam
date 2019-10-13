'use strict';
// const mongoose = require('mongoose');
const Class = require('../models/Class');
/*
this looks up the class with the specified pin, or sends an error message
*/

//get all profiles for all users, visible only when admin is logged in
exports.getAllClasses = (req, res) => {
    //find all users from database
    Class.find()
        .exec()
        .then((classes) => {
            res.render('classes', {
                classes: classes
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.lookupClass = (req, res, next) => {
    var classCode = req.body.classCode
    classCode = classCode.toUpperCase()
    Class.findOne({classCode: classCode})
        .exec()
        .then((classV) => {
            if (classV) {
                console.log('found a class:' + classV.classCode + " " + classV)
                req.session.classV = classV
                next()
            } else {
                console.log("class not found");
                res.redirect("/classNotFound");
            }
        })
        .catch((error) => {
            console.log("Error in lookupClass")
            console.log(error.message)
            return []
        })
        .then(() => {
            console.log('lookupClass promise complete')
        })
};

exports.addClass = (req, res) => {
    /* We have a class req.classV and need to add it to the user's classes ...
    then return the class page for this class...
    */
    req.user.classCodes = req.user.classCodes || [];
    // console.log("in addclass");

    if (!containsString(req.user.classCodes, req.session.classV.classCode)) {
        req.user.classCodes.push(req.session.classV.classCode);
        req.user.save()
            .then(() => {
                res.redirect('/showQuestions/' + req.session.classV.classCode)
            })
            .catch(error => {
                res.send(error);
            });
    } else {
        var message = "You have already enrolled in this class"
        res.render("classNotFound", {
            errorMessage: message
        })
    }
};

function containsString(list, elt) {
    let found = false;
    list.forEach(function (e) {
        if (JSON.stringify(e) === JSON.stringify(elt)) {
            // console.log(JSON.stringify(e)+ "=="+ JSON.stringify(elt))
            found = true
        } else {
            console.log(JSON.stringify(e) + "!=" + JSON.stringify(elt));
            console.log("Class not found!");
        }
    })
    return found
}

exports.saveClass = (req, res) => {
    const goBackURL = '/classes';
    const response = "success!";
    if (req.body.subject.length === 0 || req.body.courseNum.length === 0) {
        console.log("empty params detected in add class!");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const classCode = req.body.subject.concat(req.body.courseNum).toUpperCase();
    console.log("class code in upper case " + classCode);
    let newClass = new Class({
        subject: req.body.subject,
        courseNum: req.body.courseNum,
        classCode: classCode
    });
    newClass.save()
        .then(() => {
            res.redirect('/classes');
        })
        .catch(error => {
            res.send(error);
        });
};

exports.checkUnique = (req, res, next) => {
    const classCode = req.body.subject.concat(req.body.courseNum).toUpperCase();
    // console.log("classcode is: " + classCode);
    Class.find({classCode: classCode})
        .exec()
        .then((classes) => {
            if (classes.length === 0) {
                next()
            } else {
                res.send(classCode + " is used!")
            }
        })
        .catch((error) => {
            res.send(error)
        })
};

exports.dropClass = (req, res) => {
    const classCode = req.body.classCodesDelete;
    User.findOne(res.locals.user._id)
        .exec()
        .then((user) => {
            user.classCodes.pull(req.session.classV.classCode);
            user.tutorClassCodes.pull(req.session.classV.classCode);
            user.save()
                .then(() => {
                    res.redirect('back')
                })
        })
        .catch((error) => {
            res.send(error)
        })
        .then(() => {
            console.log('drop class complete')
        })
};
