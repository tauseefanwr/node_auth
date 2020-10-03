const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt =  require('bcrypt');

const db = require('../db/connection');
const users = db.get('users');
//users.index('username');
users.createIndex('username',{unique:true});

const schema = Joi.object({
    username: Joi.string()
        .regex(/(^[a-zA-Z0-9_]+$)/)
        .min(3)
        .max(30)
        .required(),

    password: Joi.string().trim().min(6).required(),

});

router.get('/',(req,res)=>{
    res.json({
        message:'This is root router for auth',
    });
});

router.post('/signup',(req,res, next)=>{
    const validate_result = schema.validate(req.body)
    if(validate_result.error == null){
        
        users.findOne({ username:req.body.username }).then(user=>{
            if(user){
                //username exists
                const error = new Error('Please enter another username!');
                next(error);
            }else{
                bcrypt.hash(req.body.password.trim(),12).then(hashedPassword=>{
                    
                    const newUser = {
                        username:req.body.username,
                        password:hashedPassword
                    };
    
                    users.insert(newUser).then(insertedUser=>{
                        delete insertedUser.password;
                        res.json(insertedUser);
                    });
                })
            }
        })
    }else{
        next(validate_result.error);
    }
})

module.exports = router;