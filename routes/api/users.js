const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (request, response) =>
    response.json({ msg: 'Users Works!' })
);

// @route   POST api/users/register
// @desc    Register user, check if email already exists, set avatar options, hash password
// @access  Public
router.post('/register', (request, response) => {
    User.findOne({ email: request.body.email }).then(user => {
        if (user) {
            return response.status(400).json({ email: 'Email already exists' });
        } else {
            // Gravatar pulls avatar based on email and sets options
            const avatar = gravatar.url(request.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
            });

            // Creates new user since email does not exist based on the Schema
            const newUser = User({
                name: request.body.name,
                email: request.body.email,
                avatar: avatar,
                password: request.body.password
            });

            // Hash the plain string password
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (error, hash) => {
                    if (error) throw error;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => response.json(user))
                        .catch(error => console.log(error));
                });
            });
        }
    });
});

// @route   GET api/users/login
// @desc    Login User / Returning Token
// @access  Public
router.post('/login', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    // Find user by email
    User.findOne({ email: email }).then(user => {
        // Check for user
        if (!user) {
            return response.status(404).json({ email: 'User not found' });
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User Matched
                //Create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                };

                // Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (error, token) => {
                        response.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                return response.status(400).json({
                    password: 'Password incorrect'
                });
            }
        });
    });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }), //This is middleware
    (request, response) => {
        response.json({
            id: request.user.id,
            name: request.user.name,
            email: request.user.email
        });
    }
);

module.exports = router;
