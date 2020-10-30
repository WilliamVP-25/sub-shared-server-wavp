const express = require('express');
const router = express.Router();
const {check} = require('express-validator')
const auth = require("../middleware/auth");

const categoryController = require("../controllers/categoryController");

router.get('/', auth, categoryController.getCategories);
router.get('/:slug', auth, categoryController.getCategory);
router.post('/:slug/groups', auth, categoryController.getGroupsCategory);

router.put('/:categoryId/cover', auth, categoryController.uploadCover);
router.put('/:categoryId', auth, categoryController.updateCategory);

router.post('/', [
    check('name', "El nombre de la categoría es requerida").not().isEmpty(),
], auth, categoryController.createCategory);
module.exports = router;