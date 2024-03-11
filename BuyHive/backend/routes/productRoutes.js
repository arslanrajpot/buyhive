const express = require("express");
const router = express.Router();

const { getProducts, getFilteredProducts } = require("../controllers/productControllers");

router.get("/", getProducts);
router.get("/filter", getFilteredProducts);

module.exports = router;