const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const topicController = require("../controllers/topicController");

router.get('/', auth, topicController.getTopics);

router.put('/:topicId/cover', auth, topicController.uploadAvatar);
router.put('/:topicId', auth, topicController.updateTopic);

router.post('/', [
    check('name', "El nombre de la categoría es requerida").not().isEmpty(),
], auth, topicController.createTopic);
module.exports = router;