const createError = require('http-errors');
const express = require('express');
//working with file and directory paths
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//authentication modules
session = require("express-session");
bodyParser = require("body-parser");
User = require('./models/User');
Answer = require('./models/Answer');
flash = require('connect-flash');


// const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

//*******************************************
//***********Controller**********************

const profileController = require('./controllers/profileController');
const qAndaController = require('./controllers/qAndaController');
const classController = require('./controllers/classController');
const tutorController = require('./controllers/tutorController');
const communicationController = require('./controllers/communicationController');


//*******************************************
//***********End of controller***************

// Authentication
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// here we set up authentication with passport
const passport = require('passport');
const configPassport = require('./config/passport');
configPassport(passport);

// Created mongolab-cylindrical-33366 as MONGODB_URI
//connect to mongoose database
const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_URI = 'mongodb://localhost/iclaster';
// console.log("MONGODB_URI: " + process.env.MONGODB_URI);

const mongoose = require('mongoose');

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we are connected!")
});

//start the app.js
const app = express();

//set up AWS S3
const aws = require('aws-sdk');

/*
* Configure the AWS region of the target bucket.
* Remember to change this to the relevant region.
*/
aws.config.region = 'us-east-2';

/*
* Load the S3 information from the environment variables.
*/
const S3_BUCKET = process.env.S3_BUCKET;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*************************************************************************
 HERE ARE THE AUTHENTICATION ROUTES
 **************************************************************************/

//fix warnings of express-session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize(1));
app.use(passport.session(1));
app.use(bodyParser.urlencoded({extended: false}));

const approvedLogins = process.env.approvedLogins;
// const approvedLogins = ["supremeethan@brandeis.edu"];

// here is where we check on their logged in status
app.use((req, res, next) => {
    res.locals.title = "Claster";
    res.locals.loggedIn = false;
    if (req.isAuthenticated()) {
        if (req.user.googleemail.endsWith("edu") ||
            req.user.googleemail.endsWith("@gmail.com")) {
            res.locals.user = req.user;
            res.locals.loggedIn = true;
            console.log("user has been Authenticated")
        } else {
            res.locals.loggedIn = false
        }
        if (req.user) {
            if (approvedLogins.includes(req.user.googleemail)) {
                // for permission control
                console.log("admin has logged in");
                res.locals.status = 'admin'
            } else {
                console.log('user has logged in');
                res.locals.status = 'user'
            }
        }
    }
    next()
});

// here are the login routes

// app.get('/login', function(req,res){
//   res.render('login',{})
// })

app.get('/loginerror', function (req, res) {
    res.render('loginerror', {})
});

// route for logging out
app.get('/logout', function (req, res) {
    req.session.destroy((error) => {
        console.log("Error in destroying session: " + error)
    });
    console.log("session has been destroyed");
    req.logout();
    res.redirect('/');
});

//the indexRouter handles passing req to the page
// app.use('/', indexRouter);
app.use('/users', usersRouter);


// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/login/authorized',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/loginerror'
    })
);


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log("checking to see if they are authenticated!");
    // if user is authenticated in the session, carry on
    res.locals.loggedIn = false;
    if (req.isAuthenticated()) {
        console.log("user has been Authenticated");
        res.locals.loggedIn = true;
        return next();
    } else {
        console.log("user has not been authenticated...");
        return next();
    }
}

// END OF THE Google AUTHENTICATION ROUTES


// =====================================
// INDEX ===============================
// =====================================

//we can use this or the index router to handle req
app.get('/', function (req, res) {
    if (req.user && !req.user.userName) {
        console.log("first time user!");
        res.redirect('/editMyProfileFirstTime/' + req.user._id)
    } else {
        res.render('index', {
            req: req
        })
    }
});


// =====================================
// Class ===============================
// =====================================

app.post('/:userId/enroll',
    isLoggedIn,
    classController.lookupClass,
    classController.addClass
);

//create new classes
app.get('/classes',
    isLoggedIn,
    classController.getAllClasses
);

//process the form
app.post('/createClass',
    isLoggedIn,
    classController.checkUnique,
    classController.saveClass
);

//error handle
app.get('/classNotFound', isLoggedIn, function (req, res) {
    res.render('classNotFound')
});

app.post('/dropClass',
    isLoggedIn,
    classController.lookupClass,
    classController.dropClass
);

// =====================================
// Profile =============================
// =====================================


app.get('/userFunction',
    isLoggedIn,
    function (req, res) {
        res.render('userFunction')
    }
);


//show all profiles from all users
app.get('/myProfile/:id',
    isLoggedIn,
    profileController.showMyProfile
);

// we require them to be logged in to edit their profile
app.get('/editMyProfile/:id',
    isLoggedIn,
    profileController.showOldProfile
);

// we require them to be logged in to edit their profile
app.get('/editMyProfileFirstTime/:id',
    isLoggedIn,
    function (req, res) {
        res.render('editMyProfileFirstTime', {
            req: req
        })
    }
);

//update personal profile
app.post('/updateProfile/:id',
    isLoggedIn,
    profileController.updateProfile
);

//show all profiles from all users
app.get('/showProfiles',
    isLoggedIn,
    profileController.getAllProfiles
);

//show personal profile
app.get('/showProfile/:id',
    isLoggedIn,
    profileController.getOneProfile
);

/*
* Respond to GET requests to /signAWS.
* Upon request, return JSON containing the temporarily-signed S3 request and
* the anticipated URL of the image.
*/
app.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

/*
* Respond to POST requests to /submit_form.
* This function needs to be completed to handle the information in
* a way that suits your application.
*/
app.post('/save-details', (req, res) => {
    const imageURL = req.body.imageURL;
    //find the user using user_id
    User.findOne(res.locals.user._id)
        .exec()
        .then((profile) => {
            profile.profilePicURL = imageURL;
            profile.save();
        });
    Answer.updateMany({userId: req.user._id}, {profilePicURL: req.body.imageURL}, {multi: true})
        .exec()
        .then(() => {
            res.redirect('back')
        })
        // handle error
        .catch(function (error) {
            console.log("read file failed");
            console.log(error);
        })
});

// =====================================
// Location ============================
// =====================================


//find tutor page(temp)
// app.get('/location', function(req, res, next){
//   res.render('location')
// })


// =====================================
// Forum ===============================
// =====================================


//post question page
app.get('/postQuestion/:classCode',
    function (req, res) {
        res.render('postQuestion', {
            req: req
        })
    }
);

app.get('/showQuestions/:classCode',
    isLoggedIn,
    qAndaController.getAllQuestions,
    qAndaController.displayAllQuestions
);

app.get('/forumFunction',
    isLoggedIn,
    function (req, res) {
        res.render('forumFunction')
    }
);

app.post('/processQuestionPost/:classCode',
    isLoggedIn,
    qAndaController.saveQuestionPost
);

app.get('/showQuestion/:classCode/:id',
    isLoggedIn,
    qAndaController.attachAllAnswers,
    qAndaController.showOneQuestion
);

//to edit an existing question
app.get('/showQuestion/:classCode/:id/editQuestion',
    isLoggedIn,
    qAndaController.showPreviousQ,
    qAndaController.editQuestion
);

app.post('/showQuestion/:classCode/:id/editQuestion/processQuestionPost',
    isLoggedIn,
    qAndaController.editQuestion
);

//to save a new answer post
app.post('/showQuestion/:classCode/:id/processAnswerPost',
    isLoggedIn,
    qAndaController.saveAnswer
);

//to delete an existing answers
app.post('/showQuestion/:id/answerDelete',
    qAndaController.deleteAnswer
);

//add thumbs up to answers
app.post('/showQuestion/:id/answerLikes',
    qAndaController.likesAdded
);


// =====================================
// TUTOR ===============================
// =====================================

app.get('/tutorFunction',
    isLoggedIn,
    function (req, res) {
        res.render('tutorFunction')
    }
);


//tutor profile related
// we require them to be logged in to edit their profile
app.get('/editMyTutorProfile/:id',
    isLoggedIn,
    function (req, res) {
        res.redirect('/tutorRegister')
    }
);

//update personal profile
app.post('/updateTutorProfile/:id',
    isLoggedIn,
    tutorController.updateTutorProfile
);

//tutor rating
app.get('/tutorRatings/:appointmentId/:tutorId',
    isLoggedIn,
    tutorController.getOneAppointment
);

app.post('/processTutorRating/:appointmentId/:tutorId',
    isLoggedIn,
    tutorController.saveRating
);

//tutor rating
app.post('/updateTutorRatings',
    isLoggedIn,
    tutorController.updateTutorRatingProfile
);

//tutor tutorRegister
app.get('/tutorRegister', function (req, res) {
    res.render('tutorRegister')
});

app.post('/processTutorRegister',
    isLoggedIn,
    tutorController.saveTutor
);

app.get('/showTutors',
    isLoggedIn,
    tutorController.getAllTutorProfile
);

//task board related
app.get('/taskBoard',
    isLoggedIn,
    tutorController.getAppointments
);

app.get('/communication/:tuteeId/:tutorId',
    isLoggedIn,
    tutorController.getName,
    communicationController.getName,
    communicationController.getCommunication,
    tutorController.getOneTutorProfile
);

// app.post('/contactTutor/:userId/:tutorId', isLoggedIn, tutorController.setupGroup)

app.post('/updateAppointment/:tuteeId/:tutorId',
    isLoggedIn,
    tutorController.updateAppointment,
);

app.post('/saveCommunication/:tuteeId/:tutorId',
    isLoggedIn,
    communicationController.saveCommunication
);

app.get('/communicationBoard',
    isLoggedIn,
    communicationController.getCommunicationBoard,
);


// =====================================
// STATIC PAGES ========================
// =====================================


//about page
app.get('/about', function (req, res) {
    res.render('about')
});

//empty error page
app.get('/emptyError', function (req, res) {
    res.render('emptyError')
});

//FAQ page
app.get('/FAQ', function (req, res) {
    res.render('FAQ')
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
