const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const groupController = require("../controllers/groupController");
const userController = require("../controllers/userController");
const groupMembersController = require("../controllers/groupMembersController");

router.post('/', auth, groupController.createGroup);

router.get('/', auth, groupController.getGroups);
router.get('/:groupCode', auth, groupController.getGroup);

router.post('/joined', auth, userController.getGroupsJoined);
router.post('/created', auth, userController.getGroupsCreated);
router.post('/pending', auth, userController.getGroupsPending);
router.post('/custom', auth, groupController.getCustomGroups);

router.post('/search', auth, groupController.getSearchResults);

router.put('/:groupId/cover', auth, groupController.uploadCover);
router.put('/', auth, groupController.updateGroup);

module.exports = router;