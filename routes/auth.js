const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt-nodejs')
const models = require('../models')


router.post('/register', (req, res) => {
    const login = req.body.login
    const password = req.body.password
    const passwordConfirm = req.body.passwordConfirm

    if(!login || !password || !passwordConfirm){
        res.json({
            ok: false,
            error: 'All field must be are filled',
            fields: ['login', 'password', 'passwordConfirm']
        })
    }else if (!/^[a-zA-Z0-9]+$/.test(login)) {
        res.json({
            ok: false,
            error: 'latin characters and 0-9 only',
            fields: ['login']
        })
    }
    else if(login.length < 3 || login.length > 16){
        res.json({
            ok: false,
            error: 'Login length must be from 3 to 16 characters',
            fields: ['login']
        })
    }else if (password !== passwordConfirm){
        res.json({
            ok: false,
            error: 'Passwords do not match',
            field: ['password', 'passwordConfirm']

        })
    }else if(password.length < 8){
        res.json({
            ok: false,
            error: 'Passwords must be more 8 characters',
            field: ['password']
        })
    }else{
        models.User.findOne({
            login
        }).then(user => {
            if (!user){
                bcrypt.hash(password, null, null, (err, hash) => {
                    models.User.create({
                        login,
                        password: hash
                    }).then(user => {
                        req.session.userId = user.id
                        req.session.userLogin = user.login
                        console.log(user)
                        res.json({
                            ok: true
                        })
                    }).catch(err => {
                        console.log(err)
                        res.json({
                            ok: false,
                            error: 'Error, try later'
                        })
                    })
                })
            }else {
                res.json({
                    ok: false,
                    error: 'Such login exists try again',
                    field: ['login']
                })
            }
        })


    }
})

router.post('/login', (req, res) => {
    const login = req.body.login
    const password = req.body.password

    if(!login || !password){
        res.json({
            ok: false,
            error: 'All field must be are filled',
            fields: ['login', 'password']
        })
    }else {
        models.User.findOne({
            login
        }).then(user => {
            if (!user){
                res.json({
                    ok: false,
                    error: 'Wrong login or password'
                })
            }else {
                bcrypt.compare(password, user.password, (err, result) =>{
                    if (!result){
                        res.json({
                            ok: false,
                            error: 'Wrong login or password'
                        })
                    }else {
                        req.session.userId = user.id
                        req.session.userLogin = user.login
                        res.json({
                            ok: true
                        })
                    }
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                ok: false,
                error: 'Error, try later'
            })
        })
    }
})

router.get('/logout', (req, res)=>{
    if (req.session){
        req.session.destroy(() =>{
            res.redirect('/')
        })
    }else {
        res.redirect('/')
    }
})

module.exports = router