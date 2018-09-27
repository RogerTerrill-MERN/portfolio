const express = require("express");
const router = express.Router();

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (request, response) =>
  response.json({ msg: "Posts Works!" })
);

module.exports = router;
