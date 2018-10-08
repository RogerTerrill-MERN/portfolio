const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Profile Model
const Profile = require('../../models/Profile');

//Load User Profile
const User = require('../../models/User');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (request, response) =>
    response.json({ msg: 'Profile Works!' })
);

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (request, response) => {
        const errors = {};
        Profile.findOne({ user: request.user.id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return response.status(404).json(errors);
                }
                response.json(profile);
            })
            .catch(error => response.status(404).json(error));
    }
);

// @route   POST api/profile
// @desc    Create user or Edit profile
// @access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (request, response) => {
        const { errors, isValid } = validateProfileInput(request.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return response.status(400).json(errors);
        }

        const profileFields = {};
        profileFields.user = request.user.id;
        if (request.body.handle) {
            profileFields.handle = request.body.handle;
        }
        if (request.body.company) {
            profileFields.company = request.body.company;
        }
        if (request.body.website) {
            profileFields.website = request.body.website;
        }
        if (request.body.location) {
            profileFields.location = request.body.location;
        }
        if (request.body.bio) {
            profileFields.bio = request.body.bio;
        }
        if (request.body.status) {
            profileFields.status = request.body.status;
        }
        if (request.body.githubusername) {
            profileFields.githubusername = request.body.githubusername;
        }

        // Skills - Split into array
        if (typeof request.body.skills !== 'undefined') {
            //We check if there are skills
            profileFields.skills = request.body.skills
                .split(',')
                .map(item => item.trim()); // Then we put them as an array in profileField.skills
        }

        // Social
        profileFields.social = {};
        if (request.body.youtube) {
            profileFields.social.youtube = request.body.youtube;
        }
        if (request.body.twitter) {
            profileFields.social.twitter = request.body.twitter;
        }
        if (request.body.facebook) {
            profileFields.social.facebook = request.body.facebook;
        }
        if (request.body.linkedin) {
            profileFields.social.linkedin = request.body.linkedin;
        }
        if (request.body.instagram) {
            profileFields.social.instagram = request.body.instagram;
        }

        Profile.findOne({ user: request.user.id }).then(profile => {
            if (profile) {
                // Update
                Profile.findOneAndUpdate(
                    { user: request.user.id },
                    { $set: profileFields },
                    { new: true }
                ).then(profile => response.json(profile));
            } else {
                // Create

                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle }).then(
                    profile => {
                        if (profile) {
                            errors.handle = 'That handle already exists';
                            response.status(400).json(errors);
                        }

                        // Save Profile
                        new Profile(profileFields)
                            .save()
                            .then(profile => response.json(profile));
                    }
                );
            }
        });
    }
);

module.exports = router;
