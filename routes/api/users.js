const express = require("express");
const router = express.Router();

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (request, response) =>
  response.json({ msg: "Users Works!" })
);

module.exports = router;
