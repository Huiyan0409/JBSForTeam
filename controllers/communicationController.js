'use strict';
const Communication = require( '../models/Communication' );


exports.getCommunication = ( req, res, next ) => {
  const userId = req.params.userId
  const tutorId = req.params.tutorId
  Communication.find({
    $or:[
      { $and: [{userId: userId}, {tutorId: tutorId}]},
      { $and: [{userId: tutorId}, {tutorId: tutorId}]}
      // { $and: [{userId: userId}, {tutorId: userId}]},
    ]
  })
  .exec()
  .then( (communications) => {
    res.locals.communications = communications;
    next()
  })
  .catch( error => {
    res.send( error );
  } );
};

exports.saveCommunication = ( req, res ) => {

  console.log("tutor name is " + req.body.tutorName);
  let newCommunication = new Communication(
    {
      userId: req.user._id,
      userName: req.user.userName,
      tutorId: req.params.tutorId,
      tutorName: req.body.tutorName,
      comment: req.body.comment,
      profilePicURL: req.user.profilePicURL
    }
  )
  newCommunication.save()
  .then( () => {
    res.redirect( 'back' );
  } )
  .catch( error => {
    res.send( error );
  } );
};

exports.getCommunicationBoard = ( req, res ) => {
  //find all users from database
  const id = res.locals.user._id;
  Communication.find({$or:[{tutorId: id}, {userId: id}]})
  .exec()
  .then( ( communicationBoard ) => {
    res.render( 'communicationBoard', {
      communicationBoard: communicationBoard
    });
  })

  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};
