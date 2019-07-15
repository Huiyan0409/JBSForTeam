'use strict';
const Tutor = require( '../models/Tutor' );

exports.saveTutor = ( req, res ) => {
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to become a tutor.")
  }
  let newTutor = new Tutor(
    {
      userId: req.user._id,
      userName:req.user.userName,
      introduction: req.body.introduction,
      classCode: req.body.classCode,
      createdAt: new Date(),
      professor: req.body.professor,
      score: 0,
      comments: [],
      patient: false,
      excellentG: false,
      askGood: false,
      encouraging: false,
      helpful: false,
      abilityT: false,
      gEnergy: false,
      humility: false,
      passionate: false,
      onTime: false,
      gPaced: false,
      impatient: false,
      notgTeaching: false,
      late: false,
      notPrepared: false,
      notHelpful: false
    }
  )
  newTutor.save()
  .then( () => {
    res.redirect( '/showTutors');
  } )
  .catch( error => {
    res.send( error );
  } );
};

exports.getAllTutors = ( req, res, next ) => {
  Tutor.find({}).sort({score: '-1'})
  .exec()
  .then( ( tutors ) => {
    res.render('showTutors',{
    })
  } )
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
  .then( () => {
    //console.log( 'skill promise complete' );
  } );
};


// this displays all of the skills
exports.showOneTutor = ( req, res ) => {
  //gconsle.log('in getAllSkills')
  const id = req.params.id
  console.log('the id is '+id)
  Tutor.findOne({_id:id})
  .exec()
  .then( ( tutor ) => {
    res.render( 'showTutor', {
      req: req,
      question:question
    } );
  } )
  .catch( ( error ) => {
    console.log( error.message );
  } )
};

//load profile of current user
exports.showOldTutor = ( req, res ) => {
  const id = req.params.id
  Tutor.findOne({_id: id})
  .exec()
  .then( ( tutor ) => {
    console.log("in show old tutor profile");
    res.render( 'editMyTutorProfile');
  })
  .catch(function (error) {
    console.log(error);
  })
};

//update personal profile
exports.updateTutorProfile = ( req, res ) => {
  const goBackURL = '/editMyTutorProfile/' + req.params.id
  if (req.body.userName.length==0 || req.body.zipcode.length==0 || req.body.status.length==0){
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

    tutor.introduction = req.body.introduction,
    tutor.classCode = req.body.classCode,
    tutor.professor = req.body.professor,
    .then(() => {
      res.redirect('/myTutorProfile/' + id)
    })
  })

  // handle error
  .catch(function (error) {
    console.log("update failed!")
    console.log(error);
  })
};
