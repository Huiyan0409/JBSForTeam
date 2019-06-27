'use strict';
const Question = require( '../models/Question' );
const Answer = require( '../models/Answer' );

exports.saveQuestionPost = ( req, res ) => {
  //console.log("in saveSkill!")
  //console.dir(req)
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to post to a question.")
  }

  let question = new Question(
   {
    userId: req.user._id,
    userName:req.user.googlename,
    question: req.body.question,
    createdAt: new Date()
   }
  )

  question.save()
    .then( () => {
      res.redirect( 'forum' );
    } )
    .catch( error => {
      res.send( error );
    } );
};


// this displays all of the skills
exports.getAllQuestions = ( req, res, next ) => {
  //gconsle.log('in getAllSkills')
  Question.find({}).sort({createdAt: -1})
    .exec()
    .then( ( questions ) => {
      res.render('forum',{questions:questions,title:"Forum"})
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      //console.log( 'skill promise complete' );
    } );
};

exports.deleteQuestion = (req, res) => {
  console.log("in deleteQuestion")
  let deleteId = req.body.delete
  if (typeof(deleteId)=='string') {
      // you are deleting just one thing ...
      Question.deleteOne({_id:deleteId})
           .exec()
           .then(()=>{res.redirect('/forum')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(deleteId)=='object'){
      Question.deleteMany({_id:{$in:deleteId}})
           .exec()
           .then(()=>{res.redirect('/forum')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(deleteId)=='undefined'){
      //console.log("This is if they didn't select a skill")
      res.redirect('/forum')
  } else {
    //console.log("This shouldn't happen!")
    res.send(`unknown deleteId: ${deleteId} Contact the Developer!!!`)
  }

};


// this displays all of the skills
exports.showOneQuestion = ( req, res ) => {
  //gconsle.log('in getAllSkills')
  const id = req.params.id
  console.log('the id is '+id)
  Question.findOne({_id:id})
    .exec()
    .then( ( forumPost ) => {
      res.render( 'postQuestion', {
        question:questi8on, title:"Post Question"
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      //console.log( 'skill promise complete' );
    } );
};


exports.saveAnswer = (req,res) => {
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to post a comment to the forum.")
  }

  let newAnswer = new Answer(
   {
    userId: req.user._id,
    questionId: req.body.questionId,
    userName:req.user.googlename,
    answer: req.body.answer,
    createdAt: new Date()
   }
  )

  //console.log("skill = "+newSkill)

  newAnswer.save()
    .then( () => {
      res.redirect( 'showQuestion/'+req.body.postId );
    } )
    .catch( error => {
      res.send( error );
    } );
}


// this displays all of the skills
exports.attachAllAnswers = ( req, res, next ) => {
  //gconsle.log('in getAllSkills')
  console.log("in aAFC with id= "+req.params.id)
  var ObjectId = require('mongoose').Types.ObjectId;
  Answer.find({questionId:ObjectId(req.params.id)}).sort({createdAt:-1})
    .exec()
    .then( ( answers ) => {
      res.locals.answers = answers
      next()
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      //console.log( 'skill promise complete' );
    } );
};
