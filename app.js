var createError = require('http-errors');
const fileUpload = require('express-fileupload');
var express = require('express');
//working with file and directory paths
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//authentication modules
session = require("express-session"),
bodyParser = require("body-parser"),
User = require( './models/User' ),
flash = require('connect-flash')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//*******************************************
//***********Controller**********************

const profileController = require('./controllers/profileController');
const qAndaController = require('./controllers/qAndaController');
const classController = require('./controllers/classController');



//*******************************************
//***********End of controller***************

// Authentication
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// here we set up authentication with passport
const passport = require('passport')
const configPassport = require('./config/passport')
configPassport(passport)

//connect to mongoose database
const mongoose = require( 'mongoose' );
//fix current URL string parser is deprecated
mongoose.connect( 'mongodb://localhost/claster', {useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!")
});

//start the app.js
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//use upload
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));


const approvedLogins = ["supremeethan@brandeis.edu", "kaimingwang@brandeis.edu", "yhao@brandeis.edu", "richardli@brandeis.edu", "nicolezhang@brandeis.edu"];
// here is where we check on their logged in status
app.use((req,res,next) => {
  res.locals.title="Claster"
  res.locals.loggedIn = false
  if (req.isAuthenticated()){
    if (req.user.googleemail.endsWith("edu") ||
    req.user.googleemail.endsWith("@gmail.com"))
    {
      res.locals.user = req.user
      res.locals.loggedIn = true
      console.log("user has been Authenticated")
    }
    else {
      res.locals.loggedIn = false
    }
    if (req.user){
      if (approvedLogins.includes(req.user.googleemail)){
        // for permission control
        console.log("admin has logged in")
        res.locals.status = 'admin'
      } else {
        console.log('user has logged in')
        res.locals.status = 'user'
      }
    }
  }
  next()
})

// here are the login routes

// app.get('/login', function(req,res){
//   res.render('login',{})
// })

app.get('/loginerror', function(req,res){
  res.render('loginerror',{})
})

// route for logging out
app.get('/logout', function(req, res) {
  req.session.destroy((error)=>{console.log("Error in destroying session: "+error)});
  console.log("session has been destroyed")
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
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/login/authorized',
passport.authenticate('google', {
  successRedirect : '/',
  failureRedirect : '/loginerror'
})
);


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  console.log("checking to see if they are authenticated!")
  // if user is authenticated in the session, carry on
  res.locals.loggedIn = false
  if (req.isAuthenticated()){
    console.log("user has been Authenticated")
    res.locals.loggedIn = true
    return next();
  } else {
    console.log("user has not been authenticated...")
    return next();
  }
}


// END OF THE Google AUTHENTICATION ROUTES

//we can use this or the index router to handle req
app.get('/', function(req, res, next){
  res.render('index', {
    req: req
  })
})

app.post('/:userId/enroll', isLoggedIn, classController.lookupClass, classController.addClass);

// =====================================
// Class =============================
// =====================================

app.get('/classNotFound', isLoggedIn, function(req, res, next){
  res.render('classNotFound')
})

//create new classes
app.get('/classes', isLoggedIn, classController.getAllClasses)

app.post('/createClass', isLoggedIn, classController.checkUnique, classController.saveClass);

// =====================================
// Profile =============================
// =====================================

//show all profiles from all users
app.get('/myProfile/:id', isLoggedIn, profileController.showMyProfile)

// we require them to be logged in to edit their profile
app.get('/editMyProfile/:id', isLoggedIn, profileController.showOldProfile)

//update personal profile
app.post('/updateProfile/:id', isLoggedIn, profileController.updateProfile)

//update personal profile
app.post('/upload/:id', profileController.upload)

//show all profiles from all users
app.get('/showProfiles', isLoggedIn, profileController.getAllProfiles)

//show personal profile
app.get('/showProfile/:id', isLoggedIn, profileController.getOneProfile);


// =====================================
// Location ============================
// =====================================


//find tutor page(temp)
app.get('/location', function(req, res, next){
  res.render('location')
})



// =====================================
// Forum ===============================
// =====================================


//post question page
app.get('/postQuestion/:classCode', function(req, res, next){
  res.render('postQuestion', {
    req: req
  })
})

app.get('/showQuestions/:classCode', isLoggedIn, qAndaController.getAllQuestions)

app.post('/processQuestionPost/:classCode', isLoggedIn, qAndaController.saveQuestionPost)

app.get('/showQuestion/:classCode/:id', isLoggedIn, qAndaController.attachAllAnswers, qAndaController.showOneQuestion)

//to edit an existing question
app.get('/showQuestion/:classCode/:id/editQuestion',isLoggedIn, qAndaController.showPreviousQ, qAndaController.editQuestion)

app.post('/showQuestion/:classCode/:id/editQuestion/processQuestionPost',isLoggedIn, qAndaController.editQuestion)

//to save a new answer post
app.post('/showQuestion/:classCode/:id/processAnswerPost', isLoggedIn, qAndaController.saveAnswer)

//to delete an existing answers
app.post('/showQuestion/:id/answerDelete',qAndaController.deleteAnswer)

//add thumbs up to answers
app.post('/showQuestion/:id/answerLikes',qAndaController.likesAdded)

//about page
app.get('/about', function(req, res, next){
  res.render('about')
})

//about page
app.get('/emptyError', function(req, res, next){
  res.render('emptyError')
})

//FAQ page
app.get('/FAQ', function(req, res, next){
  res.render('FAQ')
})




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
