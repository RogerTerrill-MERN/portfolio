const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Since we are dealing with the database
const passport = require('passport'); // Since we want to protect some routes

// Post model
const Post = require('../../models/Post');

// Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (request, response) =>
    response.json({ msg: 'Posts Works!' })
);

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),

    (request, response) => {
        const { errors, isValid } = validatePostInput(request.body);

        // Check Validation
        if (!isValid) {
            // If any errors, send 400 with errors object
            return response.status(400).json(errors);
        }

        const newPost = new Post({
            text: request.body.text,
            name: request.body.name,
            avatar: request.body.avatar,
            user: request.user.id
        });

        newPost.save().then(post => response.json(post));
    }
);

module.exports = router;
