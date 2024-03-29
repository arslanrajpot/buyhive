const express = require("express");
const router = express.Router();

const { getCategories } = require("../controllers/categoryControllers");

router.get("/", getCategories);

module.exports = router;
