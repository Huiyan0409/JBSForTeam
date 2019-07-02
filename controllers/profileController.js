'use strict';
const User = require( '../models/User' );
const Question = require( '../models/Question' );

//import axios
const axios = require('axios');
const apikey = require('../config/apikey');
var path = require('path');


exports.showOldProfile = ( req, res ) => {

  User.findOne(res.locals.user._id)
  .exec()
  .then( ( question ) => {
    console.log("in show old profile");
    res.render( 'editMyProfile');
  })
  .catch(function (error) {
    console.log(error);
  })
};

//update personal profile
exports.updateProfile = ( req, res ) => {

  //find the user using user_id
  User.findOne(res.locals.user._id)
  .exec()
  .then((profile) => {
    profile.userName = req.body.userName
    // profile.profilePicURL = req.body.profilePicURL
    profile.zipcode = req.body.zipcode
    profile.status = req.body.status

    // Make a request for a user with a given ID
    axios.get("https://www.zipcodeapi.com/rest/"+apikey.apikey.zipcode+"/info.json/"+profile.zipcode+"/degrees")
    .then(function (response) {
      console.log("API data success!")
      // handle success
      console.log(response);
      profile.city = response.data.city
      profile.state = response.data.state
      profile.lastUpdate = new Date()

      profile.save()
    })
  })
  // .then(() => {
  //   res.redirect('/myProfile')
  // })
  // handle error
  .catch(function (error) {
    console.log("update failed!")
    console.log(error);
  })
};

// //update personal profile
// exports.updateProfileInQA = ( req, res ) => {
//   //in the question collection, find the questions with same user
//   Question.find(res.locals.user._id)
//   .exec()
//   .then((question) => {
//     question.userName = req.body.userName
//     question.save()
//   })
//   .then(() => {
//     console.log("update success!!");
//     res.redirect('/myProfile')
//   })
//   // handle error
//   .catch(function (error) {
//     console.log("update failed!")
//     console.log(error);
//   })

//};

exports.upload = ( req, res ) => {
  //find the user using user_id
  User.findOne(res.locals.user._id)
  .exec()
  .then((profile) => {
    let readPath;
    let sampleFile;
    let uploadPath;

    if (Object.keys(req.files).length == 0) {
      res.status(400).send('No files were uploaded.');
      return;
    }
    sampleFile = req.files.sampleFile;

    console.log("uploadPath: " + uploadPath);

    let reqPath = path.join(__dirname, '../');
    uploadPath = reqPath + 'public/images/uploads/' + sampleFile.name;
    console.log("uploadPath: " + uploadPath);

    sampleFile.mv(uploadPath, function(err) {
      if (err) {
        return res.status(500).send(err);
      }
    });

    readPath = '/images/uploads/' + sampleFile.name;
    profile.profilePicURL = readPath;
    profile.profilePicName = sampleFile.name;
    profile.save();
  })
  .then(() => {
    res.redirect('back')
  })
  // handle error
  .catch(function (error) {
    console.log("upload file failed!")
    console.log(error);
  })
};

//get all profiles for all users, visible only when admin is logged in
exports.getAllProfiles = ( req, res ) => {
  //find all users from database
  User.find()
  .exec()
  .then( ( profiles ) => {
    res.render( 'showProfiles', {
      profiles: profiles
    } );
  } )
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};

//get personal profile from admin permission, view them individually
exports.getOneProfile = ( req, res ) => {

  //grab id from the URL, the red id is set by app.js where the URL is formed
  const id = req.params.id
  User.findOne({_id: id})
  .exec()
  .then( ( profile ) => {
    res.render( 'showProfile', {
      profile: profile
    } );
  } )
  //catch error
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};
