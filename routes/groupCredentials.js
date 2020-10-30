const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const groupCredentialsController = require("../controllers/groupCredentialsController");

router.get('/:groupCode', auth, groupCredentialsController.getGroupCredentials);
router.post('/', auth, groupCredentialsController.createGroupCredential);
router.put('/:credentialId', auth, groupCredentialsController.updateGroupCredential);
router.post('/update/:groupCode', auth, groupCredentialsController.updateGroupCredentials);

module.exports = router;