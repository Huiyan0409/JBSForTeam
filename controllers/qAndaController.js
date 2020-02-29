'use strict';
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');


exports.saveQuestionPost = (req, res) => {
    const goBackURL = '/postQuestion/' + req.params.classCode;
    if (req.body.question.length === 0 || req.body.helpWith.length === 0) {
        console.log("empty params detected in post question");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const classCode = req.params.classCode;
    if (!res.locals.loggedIn) {
        return res.send("You must be logged in to post to a question.")
    }

    let newQuestion = new Question(
        {
            userId: req.user._id,
            userName: req.user.userName,
            question: req.body.question,
            haveDone: req.body.haveDone,
            helpWith: req.body.helpWith,
            createdAt: new Date(),
            answerNum: 0,
            classCode: classCode
        }
    );
    newQuestion.save()
        .then(() => {
            let tutorEmailList = [];
            User.find()
                .exec()
                .then((users) => {
                    users.forEach(user => {
                        // console.log("tutor class codes: " + user.tutorClassCodes.toString());
                        // console.log("class code: " + classCode);
                        if (user.tutorClassCodes.includes(classCode) && user.receiveUpdate) {
                            tutorEmailList.push(user.googleemail);
                        }
                    })
                })
                .then(() => {
                    console.log("tutor list: " + tutorEmailList.toString());
                    send_notification(tutorEmailList, classCode, req.body.question, req.body.haveDone, req.body.helpWith);
                    res.redirect('/showQuestions/' + classCode);
                });
        })
        .catch(error => {
            res.send(error);
        });
};

function send_notification(tutorEmailList, classCode, question, haveDone, helpWith) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    tutorEmailList.forEach(tutorEmail => {
        let messageToTutor = {
            to: 'supremeethan@brandeis.edu',
            from: 'iclasterteam@gmail.com',
            subject: 'iClaster: a new question is posted in class: ' + classCode,
            text: 'iClaster: a new question is posted in class: ' + classCode,
            html: 'Hi, here is the new question post in class: ' + classCode + '<br><br>'
                + '     title: ' + question + '<br>'
                + '     the student is working on: ' + haveDone + '<br>'
                + '     the student needs help with: ' + helpWith
                + '<br><br>' + 'You can unsubscribe email notifications by [Notifications & Settings => View/edit profile => edit => uncheck Receive forum updates via email]' + '<br><br>' + 'iClaster support team',
        };
        sgMail.send(messageToTutor);
    })
}

exports.getAllQuestions = (req, res, next) => {
    const classCode = req.params.classCode;
    Question.find({classCode: classCode}).sort({createdAt: '-1'})
        .exec()
        .then((questions) => {
            if (questions.length === 0) {
                next()
            }
            let asyncKiller = 0;
            for (let i = 0; i < questions.length; i++) {
                let counts = 0;
                Answer.find({questionId: questions[i]._id}).countDocuments()
                    .exec()
                    .then((count) => {
                        if (count > 0) {
                            count = 1;
                        }
                        counts = count;
                        // determine whether a question is answered or not
                        questions[i].answerNum = counts;
                        questions[i].save();
                        asyncKiller++;
                        if (asyncKiller === questions.length) {
                            next()
                        }
                    })
                    .catch((error) => {
                        console.log(error.message);
                        return []
                    })
            }
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.displayAllQuestions = (req, res) => {
    const classCode = req.params.classCode;
    Question.find({classCode: classCode}).sort({createdAt: '-1'})
        .exec()
        .then((questions) => {
            res.render('showQuestions', {
                req: req,
                questions: questions
            })
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

// this displays all of the skills
exports.showOneQuestion = (req, res) => {
    const id = req.params.id;
    console.log('the id is ' + id);
    Question.findOne({_id: id})
        .exec()
        .then((question) => {
            res.render('showQuestion', {
                req: req,
                question: question
            });
        })
        .catch((error) => {
            console.log(error.message);
        })
};

//show previous question input
exports.showPreviousQ = (req, res) => {
    const id = req.params.id;
    Question.findOne({_id: id})
        .exec()
        .then((question) => {
            res.render('editQuestion', {
                req: req,
                question: question
            });
        })
        .then(() => {
            res.redirect('back')
        })
        .catch(function (error) {
            console.log(error);
        })
};

//edit question function
exports.editQuestion = (req, res) => {
    const goBackURL = '/postQuestion/' + req.params.classCode;
    if (req.body.question.length === 0 || req.body.helpWith.length === 0) {
        console.log("empty params detected in post question");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const classCode = req.params.classCode;
    const id = req.params.id;
    Question.findOne({_id: id})
        .exec()
        .then((question) => {
            question.question = req.body.question;
            question.haveDone = req.body.haveDone;
            question.save()
        })
        .then(() => {
            res.redirect('/showQuestion/' + classCode + '/' + id)
        })
        .catch(function (error) {
            console.log("edit question failed!");
            console.log(error);
        })
};

let replyName;
let userId;
let userEmail;
let questionTitle;
exports.saveAnswer = (req, res) => {
    const goBackURL = '/showQuestion/' + req.params.classCode + '/' + req.params.id
    if (req.body.answer.length === 0) {
        console.log("empty params detected in save answer");
        res.render('emptyError', {
            goBackURL: goBackURL
        });
        return
    }
    const questionId = req.params.id;
    const classCode = req.params.classCode;
    let newAnswer = new Answer({
        userId: req.user._id,
        questionId: questionId,
        userName: req.user.userName,
        answer: req.body.answer,
        createdAt: new Date(),
        profilePicURL: req.user.profilePicURL,
        likes: 0,
        agreeList: [],
        classCode: classCode
    });
    newAnswer.save()
        .then(() => {
            Question.findOne({_id: questionId})
                .exec()
                .then((question) => {
                    userId = question.userId;
                    questionTitle = question.question;
                    User.findOne({_id: userId})
                        .exec()
                        .then((user) => {
                            console.log("user: " + user.toString());
                            userEmail = user.googleemail;
                            replyName = user.userName;
                            console.log("userEmail: " + userEmail);
                            send_to_student(userEmail, req.body.answer, replyName, questionTitle, classCode)
                            res.redirect('/showQuestion/' + classCode + '/' + questionId)
                        })
                })
                .catch(error => {
                    res.send(error);
                });
        })
        .catch(error => {
            res.send(error);
        });
};

function send_to_student(userEmail, answer, replyName, question, classCode) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let messageToStudent = {
        to: userEmail,
        from: 'iclasterteam@gmail.com',
        subject: 'iClaster: your question in class: ' + classCode + ' is answered',
        text: 'iClaster: your question in class: ' + classCode + ' is answered',
        html: 'Hi, ' + replyName + ' has answered your question in class: ' + classCode + '<br><br>'
            + '     question title: ' + question + '<br>'
            + '     answer: ' + answer + '<br>'
            + '<br><br>' + 'You can unsubscribe email notifications by [Notifications & Settings => View/edit profile => edit => uncheck Receive forum updates via email]' + '<br><br>' + 'iClaster support team',
    };
    sgMail.send(messageToStudent);
}


exports.likesAdded = (req, res) => {
    let answerId = req.body.likes;
    let userId = req.body.user;
    Answer.findOne({_id: answerId})
        .exec()
        .then((answer) => {
            if (answer.agreeList.includes(userId)) {
                answer.agreeList.pull(userId);
                answer.likes = answer.likes - 1;
                answer.save()
            } else {
                answer.agreeList.push(userId);
                answer.likes = answer.likes + 1;
                answer.save()
            }
        })
        .then(() => {
            res.redirect('back')
        })
        .catch(function (error) {
            console.log("Adding likes failed!");
            console.log(error);
        })
};

//attach all answers
exports.attachAllAnswers = (req, res, next) => {
    console.log("in aAFC with id= " + req.params.id);
    const ObjectId = require('mongoose').Types.ObjectId;
    Answer.find({questionId: ObjectId(req.params.id)}).sort({likes: -1})
        .exec()
        .then((answers) => {
            res.locals.answers = answers;
            next()
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
};

exports.deleteAnswer = (req, res) => {
    let deleteId = req.body.delete;
    if (typeof (deleteId) == 'string') {
        // you are deleting just one thing ...
        Answer.deleteOne({_id: deleteId})
            .exec()
            .then(() => {
                res.redirect('back')
            })
            .catch((error) => {
                res.send(error)
            })
    } else if (typeof (deleteId) == 'object') {
        Answer.deleteMany({_id: {$in: deleteId}})
            .exec()
            .then(() => {
                res.redirect('back')
            })
            .catch((error) => {
                res.send(error)
            })
    } else if (typeof (deleteId) == 'undefined') {
        //console.log("This is if they didn't select a skill")
        res.redirect('back')
    } else {
        //console.log("This shouldn't happen!")
        res.send(`unknown deleteId: ${deleteId} Contact the Developer!!!`)
    }

};
