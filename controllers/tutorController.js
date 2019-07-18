'use strict';
const mongoose = require( 'mongoose' );
const Tutor = require( '../models/Tutor' );

exports.saveTutor = ( req, res ) => {
  const goBackURL = '/tutorRegister'
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to become a tutorRegister.")
  }

  let newTutor = new Tutor(
    {
      userName: req.user.userName,
      introduction: req.body.introduction,
      score: 0,
      comments: [],
      classCodes: req.body.chosen,
      //characteristic
      patient: 0,
      excellentG: 0,
      askGood: 0,
      encouraging: 0,
      helpful: 0,
      abilityT: 0,
      gEnergy: 0,
      humility: 0,
      passionate: 0,
      onTime: 0,
      gPaced: 0,
      impatient: 0,
      notgTeaching: 0,
      late: 0,
      notPrepared: 0,
      notHelpful: 0
    }
  )
  newTutor.save()
  .then( () => {
    res.redirect( '/tutorRegister');
  } )
  .catch( error => {
    res.send( error );
  } );
};

exports.showMyTutorProfile = ( req, res ) => {

  //grab id from the URL, the red id is set by app.js where the URL is formed
  Tutor.findOne(res.locals.user._id)
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
  Tutor.findOne({_id: id})
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
  Tutor.findOne({_id: id})
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
  Tutor.find()
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
