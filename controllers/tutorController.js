'use strict';
const mongoose = require( 'mongoose' );
const User = require( '../models/User' );

exports.saveTutor = ( req, res ) => {
  const goBackURL = '/tutorRegister'
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to become a tutorRegister.")
  }
  User.findOne(res.locals.user._id)
  .exec()
  .then((profile) => {
    console.log("user is found! " + profile);
    profile.introduction = req.body.selfIntro
    profile.status = "tutor"
    profile.score = 0
    profile.comments = []
    profile.tutorClassCodes = req.body.chosen
    profile.patient= 0
    profile.excellentG= 0
    profile.askGood= 0
    profile.encouraging= 0
    profile.helpful= 0
    profile.abilityT= 0
    profile.gEnergy= 0
    profile.humility= 0
    profile.passionate= 0
    profile.onTime= 0
    profile.gPaced= 0
    profile.impatient= 0
    profile.notgTeaching= 0
    profile.late= 0
    profile.notPrepared= 0
    profile.notHelpful= 0
    console.log("profile: " + profile);
    profile.save();
  })
  .then( () => {
    console.log("update success");
    res.redirect( '/tutorRegister');
  } )
  .catch( error => {
    console.log("update failed");
    res.send( error );
  } );
};

exports.showMyTutorProfile = ( req, res ) => {

  //grab id from the URL, the red id is set by app.js where the URL is formed
  User.findOne(res.locals.user._id)
  .exec()
  .then( ( tutor ) => {
    res.render( 'myProfile', {
      tutor: tutor
    } );
  } )
  //catch error
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};


//load profile of current user
exports.showOldTutorProfile = ( req, res ) => {
  const id = req.params.id
  User.findOne({_id: id})
  .exec()
  .then( ( tutor ) => {
    console.log("in show old profile");
    res.render( 'editMyTutorProfile');
  })
  .catch(function (error) {
    console.log(error);
  })
};

//update personal profile
exports.updateTutorProfile = ( req, res ) => {
  const goBackURL = '/editMyTutorProfile/' + req.params.id
  if (req.body.userName.length==0){
    console.log("empty params detected in profile");
    res.render('emptyError', {
      goBackURL: goBackURL
    })
    return
  }
  const id = req.params.id
  User.findOne({_id: id})
  .exec()
  .then((tutor) => {
    tutor.introduction = req.body.introduction
  })
  .then(() => {
    res.redirect('/myProfile/' + id)
  })
  // handle error
  .catch(function (error) {
    console.log("update failed!")
    console.log(error);
  })
};

exports.getAllTutorProfile = ( req, res ) => {
  //find all users from database
  User.find()
  .exec()
  .then( ( tutors ) => {
    res.render( 'showTutors', {
      tutors: tutors
    } );
  } )
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};
