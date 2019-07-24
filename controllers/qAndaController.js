'use strict';
const Question = require( '../models/Question' );
const Answer = require( '../models/Answer' );

exports.saveQuestionPost = ( req, res ) => {
  const goBackURL = '/postQuestion/' + req.params.classCode
  if (req.body.question.length==0 || req.body.description.length==0){
    console.log("empty params detected in post question");
    res.render('emptyError', {
      goBackURL: goBackURL
    })
    return
  }
  const classCode = req.params.classCode
  console.log("classcodecode is " + classCode);
  if (!res.locals.loggedIn) {
    return res.send("You must be logged in to post to a question.")
  }

  let newQuestion = new Question(
    {
      userId: req.user._id,
      userName:req.user.userName,
      question: req.body.question,
      description: req.body.description,
      createdAt: new Date(),
      classCode: classCode
    }
  )
  newQuestion.save()
  .then( () => {
    console.log("CLASSCODE IS: " + req.params.classCode);
    res.redirect( '/showQuestions/' + classCode);
  } )
  .catch( error => {
    res.send( error );
  } );
};

exports.getAllQuestions = ( req, res, next ) => {
  const classCode = req.params.classCode
  Question.find({classCode: classCode}).sort({createdAt: '-1'})
  .exec()
  .then( ( questions ) => {
    res.render('showQuestions',{
      req: req,
      questions: questions,
      title: "showQuestions"
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
exports.showOneQuestion = ( req, res ) => {
  //gconsle.log('in getAllSkills')
  const id = req.params.id
  console.log('the id is '+id)
  Question.findOne({_id:id})
  .exec()
  .then( ( question ) => {
    res.render( 'showQuestion', {
      req: req,
      question: question
    } );
  } )
  .catch( ( error ) => {
    console.log( error.message );
  } )
};

//show previous question input
exports.showPreviousQ = (req, res ) => {
  const id = req.params.id
  Question.findOne({_id:id})
  .exec()
  .then( ( question ) => {
    res.render( 'editQuestion', {
      req: req,
      question: question
    });
  })
  .then(() => {
    res.redirect('back')
  })
  .catch(function (error) {
    console.log(error);
  })
}

//edit question function
exports.editQuestion = ( req, res ) => {
  const goBackURL = '/postQuestion/' + req.params.classCode
  if (req.body.question.length==0 || req.body.description.length==0){
    console.log("empty params detected in post question");
    res.render('emptyError', {
      goBackURL: goBackURL
    })
    return
  }
  const classCode = req.params.classCode
  const id = req.params.id
  Question.findOne({_id:id})
  .exec()
  .then( ( question ) => {
    question.question = req.body.question
    question.description = req.body.description
    question.save()
  })
  .then(() => {
    res.redirect('/showQuestion/'+classCode + '/' + id)
  })
  .catch(function (error) {
    console.log("edit question failed!")
    console.log(error);
  })
};

exports.saveAnswer = (req,res) => {

  const goBackURL = '/showQuestion/' + req.params.classCode + '/' + req.params.id
  if (req.body.answer.length==0){
    console.log("empty params detected in save answer");
    res.render('emptyError', {
      goBackURL: goBackURL
    })
    return
  }

  const questionId = req.params.id
  const classCode = req.params.classCode
  console.log("questionId is: " + questionId);

  let newAnswer = new Answer({
    userId: req.user._id,
    questionId: questionId,
    userName:req.user.userName,
    answer: req.body.answer,
    createdAt: new Date(),
    profilePicURL: req.user.profilePicURL,
    likes: 0,
    agreeList: [],
    classCode: classCode
  })

  newAnswer.save()
  .then( () => {
    res.redirect( '/showQuestion/'+ classCode + '/' + questionId );
  } )
  .catch( error => {
    res.send( error );
  } );
}

exports.likesAdded = ( req, res ) => {
  let answerId = req.body.likes
  let userId = req.body.user
  console.log("userId: " + userId);
  Answer.findOne({_id:answerId})
  .exec()
  .then( ( answer ) => {
    if (answer.agreeList.includes(userId)){
      answer.agreeList.pull(userId)
      answer.likes = answer.likes - 1
      answer.save()
    }
     else{
      answer.agreeList.push(userId)
      answer.likes = answer.likes + 1
      answer.save()
    }
  })
  .then(() => {
    res.redirect('back')
  })
  .catch(function (error) {
    console.log("Adding likes failed!")
    console.log(error);
  })
};

//attach all answers
exports.attachAllAnswers = ( req, res, next ) => {
  console.log("in aAFC with id= "+req.params.id)
  const ObjectId = require('mongoose').Types.ObjectId;
  Answer.find({questionId:ObjectId(req.params.id)}).sort({likes: -1})
  .exec()
  .then( ( answers ) => {
    res.locals.answers = answers
    next()
  } )
  .catch( ( error ) => {
    console.log( error.message );
    return [];
  } )
};

exports.deleteAnswer = (req, res) => {
  let deleteId = req.body.delete
  if (typeof(deleteId)=='string') {
    // you are deleting just one thing ...
    Answer.deleteOne({_id:deleteId})
    .exec()
    .then(()=>{res.redirect('back')})
    .catch((error)=>{res.send(error)})
  } else if (typeof(deleteId)=='object'){
    Answer.deleteMany({_id:{$in:deleteId}})
    .exec()
    .then(()=>{res.redirect('back')})
    .catch((error)=>{res.send(error)})
  } else if (typeof(deleteId)=='undefined'){
    //console.log("This is if they didn't select a skill")
    res.redirect('back')
  } else {
    //console.log("This shouldn't happen!")
    res.send(`unknown deleteId: ${deleteId} Contact the Developer!!!`)
  }

};
