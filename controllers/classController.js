'use strict';
const mongoose = require( 'mongoose' );
const Class = require( '../models/Class' );
const User = require( '../models/User' );

exports.saveClass = ( req, res ) => {
  const userId = req.params.userId;
  const classCode = req.body.classCode;
  console.log("classcode is: " + classCode);
  console.log("userId: " + userId);
  User.findOne({_id:userId})
  .exec()
  .then( ( user ) => {
    user.classCodes.push(classCode)
    user.save()
  })
  .then(() => {
    res.redirect('back')
  })
  .catch(function (error) {
    console.log("Adding class failed!")
    console.log(error);
  })
};

// this displays all of the classes
exports.getAllClasses = ( req, res ) => {
  console.log('in getAllClasses')
  User.find( {_id:userId} )
  .exec()
  .then( ( user ) => {
    res.render( 'index', {
      user: user
    } );
  } )
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
  .then( () => {
    console.log( 'getAllClasses promise complete' );
  } );
};
