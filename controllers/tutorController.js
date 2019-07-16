'use strict';
const mongoose = require( 'mongoose' );
const Tutor = require( '../models/Tutor' );

exports.showMyTutorProfile = ( req, res ) => {

  //grab id from the URL, the red id is set by app.js where the URL is formed
  Tutor.findOne(res.locals.user._id)
  .exec()
  .then( ( tutor ) => {
    res.render( 'myTutorProfile', {
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
  .then( ( question ) => {
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
