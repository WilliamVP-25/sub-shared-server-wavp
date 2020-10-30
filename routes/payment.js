const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const payController = require("../controllers/payController");
router.post('/:groupCode', auth, payController.saveTransaction);

module.exports = router;