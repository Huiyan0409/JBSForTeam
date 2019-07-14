'use strict';
const mongoose = require( 'mongoose' );
const Class = require( '../models/Class' );
/*
this looks up the class with the specified pin, or sends an error message
*/

//get all profiles for all users, visible only when admin is logged in
exports.getAllClasses = ( req, res ) => {
  //find all users from database
  Class.find()
  .exec()
  .then( ( classes ) => {
    res.render( 'classes', {
      classes: classes
    });
  })
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  })
};

exports.lookupClass = (req,res,next) => {
  var classCode = req.body.classCode
  classCode = classCode.toUpperCase()
  Class.findOne({classCode:classCode})
  .exec()
  .then((classV)=> {
    if (classV){
      console.log('found a class:'+classV.classCode+" "+classV)
      req.session.classV = classV
      next()
    }
    else {
      console.log("class not found");
      res.redirect("/classNotFound")
    }
  })
  .catch((error)=>{
    console.log("Error in lookupClass")
    console.log(error.message)
    return []
  })
  .then( ()=>{
    console.log('lookupClass promise complete')
  })
}

exports.addClass = (req,res) => {
  /* We have a class req.classV and need to add it to the user's classes ...
  then return the class page for this class...
  */
  req.user.classCodes = req.user.classCodes || []
  // console.log("in addclass");

  if (!containsString(req.user.classCodes, req.session.classV.classCode)) {
    req.user.classCodes.push(req.session.classV.classCode)
    req.user.save()
    .then( () => {
      res.redirect('back')
    })
    .catch( error => {
      res.send( error );
    } );
  }
}

function containsString(list,elt){
  let found=false
  list.forEach(function(e){
  if (JSON.stringify(e)==JSON.stringify(elt)){
  // console.log(JSON.stringify(e)+ "=="+ JSON.stringify(elt))
    found=true}
    else {
      // console.log(JSON.stringify(e)+ "!="+ JSON.stringify(elt))
      console.log("Class not found!");
    }
  })
  return found
}

exports.saveClass = ( req, res ) => {
  console.log("in saveClass!")
  console.dir(req.user)
  console.log("req.user._id is ")
  console.dir(req.user._id)
  var classCode = req.body.subject.concat(req.body.courseNum)
  classCode = classCode.toUpperCase()
  console.log("class code in upper case " + classCode);
  //console.dir(req)
  // let newcode = 1000000+Math.floor(8999999*Math.random())
  let newClass = new Class({
    // semester: req.body.semester,
    subject: req.body.subject,
    courseNum: req.body.courseNum,
    classCode: classCode
    // pin: newcode,
  })

  console.dir("class = "+newClass)
  newClass.save()
  .then( () => {
    res.redirect( '/classes' );
  } )
  .catch( error => {
    res.send( error );
  } );
};

exports.checkUnique = (req,res,next) => {
  var classCode = req.body.subject.concat(req.body.courseNum)
  Class.find({classCode:classCode})
  .exec()
  .then((classes) => {
    if (classes.length==0) {
      next()
    } else {
      res.send(classCode + " is used!")
    }
  })
  .catch((error)=> {res.send(error)})
  .then(() => console.log('checkunique promise is complete!'))
}
