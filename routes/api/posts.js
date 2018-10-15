const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Since we are dealing with the database
const passport = require('passport'); // Since we want to protect some routes

// Post model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (request, response) =>
    response.json({ msg: 'Posts Works!' })
);

// @route   GET api/posts
// @desc    Get post
// @access  Public
router.get('/', (request, response) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => response.json(posts))

        .catch(err =>
            response
                .status(404)
                .json({ nopostsfound: 'No posts found with that id' })
        );
});

// @route   GET api/posts/:id
// @desc    Get post by id
router.get('/:id', (request, response) => {
    Post.findById(request.params.id)
        .then(post => response.json(post))
        .catch(err =>
            response
                .status(404)
                .json({ nopostfound: 'No post found with that id' })
        );
});

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

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (request, response) => {
        Profile.findOne({ user: request.user.id }).then(profile => {
            Post.findById(request.params.id)
                .then(post => {
                    //Check for post owner
                    if (post.user.toString() != request.user.id) {
                        return response
                            .status(401)
                            .json({ notauthorized: 'User not authorized' });
                    }

                    // Delete
                    post.remove().then(() => response.json({ success: true }));
                })
                .catch(error =>
                    response.status(404).json({ postnotfound: 'No Post found' })
                );
        });
    }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
    '/like/:id',
    passport.authenticate('jwt', { session: false }),
    (request, response) => {
        Profile.findOne({ user: request.user.id }).then(profile => {
            Post.findById(request.params.id)
                .then(post => {
                    if (
                        post.likes.filter(
                            like => like.user.toString() === request.user.id
                        ).length > 0
                    ) {
                        return response.status(400).json({
                            alreadyliked: 'User already liked this post'
                        });
                    }

                    // Add user id to likes array
                    post.likes.unshift({ user: request.user.id });

                    post.save().then(post => response.json(post));
                })
                .catch(error =>
                    response.status(404).json({ postnotfound: 'No Post found' })
                );
        });
    }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
    '/unlike/:id',
    passport.authenticate('jwt', { session: false }),
    (request, response) => {
        Profile.findOne({ user: request.user.id }).then(profile => {
            Post.findById(request.params.id)
                .then(post => {
                    if (
                        post.likes.filter(
                            like => like.user.toString() === request.user.id
                        ).length === 0
                    ) {
                        return response.status(400).json({
                            notliked: 'You have not yet liked this post'
                        });
                    }

                    // Get remove index
                    const removeIndex = post.likes.map(item =>
                        item.user.toString().indexOf(request.user.id)
                    );

                    // Splice out of array
                    post.likes.splice(removeIndex, 1);

                    // Save
                    post.save().then(post => response.json(post));
                })
                .catch(error =>
                    response.status(404).json({ postnotfound: 'No Post found' })
                );
        });
    }
);
module.exports = router;
