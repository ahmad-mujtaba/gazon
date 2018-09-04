const express = require("express"),
    util = require("../controllers/util.controller"),
  router = express.Router();

router.use("/", util.logRequest);

module.exports = router;