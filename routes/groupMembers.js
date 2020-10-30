const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const groupMembersController = require("../controllers/groupMembersController");

router.post('/', auth, groupMembersController.createGroupMember);
router.put('/', auth, groupMembersController.updateGroupMember);

router.get('/user/:groupCode', auth, groupMembersController.getGroupMember);
router.get('/:groupCode', auth, groupMembersController.getGroupMembers);

module.exports = router;