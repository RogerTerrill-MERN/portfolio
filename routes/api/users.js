const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (request, response) =>
  response.json({ msg: "Users Works!" })
);

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (request, response) => {
    User.findOne({ email: request.body.email })
        .then(user => {
            if(user) {
                return response.status(400).json({email: 'Email already exists'});
            } else {
                const avatar = gravatar.url(request.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' // Default
                });

                const newUser = User({
                    name: request.body.name,
                    email: request.body.email,
                    avatar: avatar,
                    password: request.body.password
                });
            }
        })
});

module.exports = router;
