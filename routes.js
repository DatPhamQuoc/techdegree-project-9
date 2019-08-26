const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User,Course } = db.models;

router.use(express.json());

(async () => {
  await db.sequelize.sync();
})();


function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      err.status = 400;
      next(err);
    }
  };
}


//Authentication middlewear
const authenticateUser = async (req,res,next) => {
  let message = null;
  const credentials = auth(req);
  console.log(credentials);
  if(credentials){
    const user = await User.findOne({
      where: {emailAddress: credentials.name}
    })
    if(user){
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password)
      if(authenticated){
        req.currentUser = await User.findOne({
          where: {emailAddress: credentials.name},
          attributes: { exclude: ['password','createdAt','updatedAt']}
        })
      }else{
        message = `Authentication failure for username: ${user.emailAddress}`
      }
    }else {
      message = `User not found for username: ${credentials.name}`;
    }
  }else {
    message = 'Auth header not found';
  }

  if(message){
    res.status(401).json({message: 'Access Denied: '+ message })
  }else{
    next()
  }
}

// Returns the currently authenticated user
router.get('/users',authenticateUser, asyncHandler( async (req,res) => {
  res.json(req.currentUser);
}));


// Creates a user, sets the Location header to "/", and returns no content
router.post('/users', asyncHandler( async (req,res) => {
  const errors = [];
  const userContent = req.body
  if(!userContent.firstName){
    errors.push('Please provide a value for "firstName"');
  }
  if(!userContent.lastName){
    errors.push('Please provide a value for "lastName"');
  }
  if(!userContent.emailAddress){
    errors.push('Please provide a value for "emailAddress"');
  }
  if(!userContent.password){
    errors.push('Please provide a value for "password"');
  }

  if(errors.length == 0){
    const duplicateEmail = await User.findOne({
      where: {emailAddress: req.body.emailAddress}
    });

    if(duplicateEmail){
      throw new Error (req.body.emailAddress + ' is already associated with an existing account')
    }else{
      await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: bcryptjs.hashSync(req.body.password)
      })
      res.status(201).location('/').end();
    }
  } else {
    res.status(400).json({errors})
  }
}));


// Returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler( async (req,res) => {
  const courses =  await Course.findAll({
    include: [
      {model: User,
      attributes:[
                    "id",
                    "firstName",
                    "lastName",
                    "emailAddress"
                  ]
      }
    ],
    attributes: { exclude: ['createdAt','updatedAt'] }
  });
  res.json(courses);
}));


// Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler( async (req,res) => {
  const course = await Course.findOne({
    include: [
      {model: User,
      attributes:[
                    "id",
                    "firstName",
                    "lastName",
                    "emailAddress"
                  ]
      }
    ],
    where: {id: req.params.id},
    attributes: {exclude:['createdAt','updatedAt']}
  });
  res.json(course);
}));


//  Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses',authenticateUser, asyncHandler(async (req,res,next) => {
    const newCourse = await Course.create({
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded
    });

    res.status(201).location(`/courses/${newCourse.id}`).end();
}));


// Updates a course and returns no content
router.put('/courses/:id',authenticateUser, asyncHandler(async (req,res,next) => {
    const errors = [];
    const courseContent = req.body
    if(!courseContent.userId){
      errors.push('Please provide a value for "userId"');
    }
    if(!courseContent.title){
      errors.push('Please provide a value for "title"');
    }
    if(!courseContent.description){
      errors.push('Please provide a value for "description"');
    }


    const course = await Course.findByPk(req.params.id);
    if(errors.length == 0){
      if(course.userId == req.currentUser.id && req.body){
        await course.update({
          userId: req.body.userId,
          title: req.body.title,
          description: req.body.description,
          estimatedTime: req.body.estimatedTime,
          materialsNeeded: req.body.materialsNeeded
        })
        res.status(204).end();
      }else{
        res.status(403).json({message:'Only owner of the course can edit it'})
      }
    }else {
      res.status(400).json({errors});
    }
}));


// Deletes a course and returns no content
router.delete('/courses/:id',authenticateUser, asyncHandler(async (req,res,next) => {
    const course = await Course.findByPk(req.params.id);
    if(course.userId == req.currentUser.id){
      await course.destroy();
      res.status(204).end();
    }else{
      res.status(403).json({message:'Ony owner of the course can edit it'})
    }
}))

module.exports = router;
