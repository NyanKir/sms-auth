const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// api/check
router.post('/check', async (req, res) => {
    jwt.verify(req.headers.cookie, process.env.MY_SECRET, function (err, decode) {
        if (!err && decode) {
            res.status(200).json({message: 'Welcome'})
            return [req, res]
        }
        res.status(401).json({message: 'Sorry you are not authenticated'})
        res.end()

    })
})

// api/register
router.post('/register', [
    check('name').isLength({min: 2}).withMessage('Must be at least 2 chars long')
        .custom(value => !/\s/.test(value))
        .withMessage('No spaces are allowed in the password')
        .custom(value => isNaN(value)).withMessage('The string contains numbers'),

    check('password',).isLength({min: 6}).withMessage('Must be at least 6 chars long')
        .custom(value => !/\s/.test(value))
        .withMessage('No spaces are allowed in the password'),

    check('r_password',).custom((value, {req}) => value === req.body.password).withMessage('Passwords do not match'),

    check('phone').custom(value => /(\+7)/.test(value)).withMessage('Starts at +7')
        .custom(value => /(\+7)[0-9]{10}/.test(value)).withMessage('Incorrect phone number')
], async (req, res) => {
    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect data'
            })
        }
        const {name, password, phone} = req.body
        const candidate = await User.findOne({phone}).exec();
        if (candidate) {
            return res.status(400).json({message: "Such a phone already exists"})
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = new User({name, password: hash, phone})
        await user.save()


        res.status(201).json({message: "Good job!!!"})

    } catch (e) {
        res.status(500).json({message: 'Try late'})
        console.log(e)
    }
})

// api/login
router.post('/login',
    [
        check('password',)
            .isLength({min: 6}).withMessage('Must be at least 6 chars long')
            .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password'),
        check('phone')
            .custom(value => /(\+7)/.test(value)).withMessage('Starts at +7')
            .custom(value => /(\+7)[0-9]{10}/.test(value)).withMessage('Incorrect phone number')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect data'
                })
            }
            User.findOne({'phone': req.body.phone}, function (err, p) {
                if (p) {
                    bcrypt.compare(req.body.password, p.password, (e, check) => {
                        if (check) {
                            client.verify.services(process.env.SERVICE_SID)
                                .verifications
                                .create({to: p.phone, channel: 'sms', locale: 'RU'})
                                .then(verification => {
                                    res.status(200).json({message: 'Welcome!!!', id: p._id})
                                })
                                .catch((e) => res.status(400).json({message: "Error!!!", e}));


                        } else {
                            res.status(401).json({message: 'Incorrect password'})
                        }
                    });
                }
            })
        } catch (e) {
            res.status(500).json({message: 'Try late'})
        }
    })

// api/auth
router.post('/auth', async (req, res) => {

    const user_id = req.body.user_id
    const code = req.body.code
    console.log(code, user_id)

    await User.findById(user_id, function (err, result) {
        if (err) {
            res.status(401).json({message: "Error your data was not found"})
        } else {
            const token = jwt.sign({id: user_id}, process.env.MY_SECRET,
                {expiresIn: '1h'})
            client.verify.services(process.env.SERVICE_SID)
                .verificationChecks
                .create({to: result.phone, code: code})
                .then(verification_check => {
                    if(verification_check.valid){
                        res.cookie('auth', token, {
                            expires: new Date(Date.now() + 900000),
                            path: '/',
                        })

                        res.status(200).json({
                            message: 'Welcome!!!',
                        })
                        res.end()
                    }
                    res.status(500).json({message: 'Incorrect code'})
                })
                .catch(err => res.status(500).json({message: 'Incorrect data'}));

        }
    });

})

// api/logout
router.post('/logout', async (req, res) => {
    res.clearCookie('auth')
    res.end()
})

module.exports = router
