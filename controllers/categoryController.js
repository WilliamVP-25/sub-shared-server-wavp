const User = require('../models/User')
const Category = require('../models/Category')
const Group = require('../models/Group')
const Topic = require('../models/Topic')
const multer = require('multer')
const shortid = require('shortid')
const urlSlug = require('url-slug')
const {validationResult} = require('express-validator')
const fs = require("fs")

exports.getCategories = async (req, res) => {
    try {
        let categories = await Category.find({status: true});
        return res.status(200).json({categories, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: "", code: "error", details: e.message});
    }
}

exports.getCategory = async (req, res) => {
    const {slug} = req.params;
    try {
        let category = await Category.findOne({slug})
            .where('status').gte(true)
            .populate('topic');
        if (!category) {
            return res.status(404).json({code: "category_not_exists", msg: "La categoria que buscas no existe"});
        }
        return res.json({category, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: "", code: "error", details: e.message});
    }
}

exports.getGroupsCategory = async (req, res) => {
    const {slug} = req.params;
    try {
        let category = await Category.findOne({slug});
        let groups = await Group.find({category: category._id})
            .populate('category')
            .populate('topic')
            .populate('user');
        return res.status(200).json({groups, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}

exports.createCategory = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //verify user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {name, description, slug} = req.body;
    console.log(name)
    let category = await Category.findOne().or([{name, slug: urlSlug(slug)}]);
    if (category) {
        return res.status(404).json({msg: "La categoría ya existe", code: "category_exists"});
    }

    try {
        const dataCategory = {
            name, description,
            slug: urlSlug(name),
            created_by: user._id
        }
        const category = new Category(dataCategory);
        await category.save();
        return res.status(200).json({category, code: "success"});
    } catch (e) {
        return res.status(500).json({code: "error", error: e.message});
    }
}

exports.uploadCover = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(400).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {categoryId} = req.params;
    let category = await Category.findById(categoryId);
    if (!category) {
        return res.status(404).json({msg: "La categoría no existe", code: "category_not_exists"});
    }

    const config = {
        limits: {fileSize: 1024 * 1024 * 10},
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, callback) => {
                callback(null, __dirname + "/../uploads/categories/cover/")
            },
            filename: (req, file, callback) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.', file.originalname.length));
                const name = `${shortid.generate()}.${extension}`
                callback(null, name)
            },
            fileFilter: (req, file, callback) => {
                if (file.mimetype === "application/exe") { //validation extension file
                    return callback(null, true);
                }
            }
        })
    }
    const upload = multer(config).single('file');

    upload(req, res, async (error) => {
        if (!error) {
            if (category.cover) {
                if (!category.cover.includes("http")) {
                    fs.unlinkSync(__dirname + `/../uploads/categories/cover/${category.cover}`);
                }
            }

            const dataCategory = {
                cover: req.file.filename,
                updated_at: Date.now()
            }
            category = await Category.findByIdAndUpdate(
                {_id: category._id},
                {$set: dataCategory},
                {new: true}
            );
            return res.status(200).json({category, code: "success"});
        } else {
            console.log(error);
            return res.status(500).json({details: "error", err: error.message});
        }
    })
    //upload.single('file');
}

exports.updateCategory = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {categoryId} = req.params;
    let category = await Category.findById(categoryId);
    if (!category) {
        return res.status(404).json({msg: "La categoría no existe", code: "category_not_exists"});
    }

    let topic;
    if (req.body.topic) {
        topic = await Topic.findById(req.body.topic);
        if (!topic) {
            return res.status(404).json({
                msg: "La categoría del servicio ya no existe. Selecciona otra",
                code: "topic_not_exists"
            });
        }
    }

    const {
        name, description, status, renewalFrequency,
        totalPrice, vacancy, acceptanceRequest,
        relationshipType
    } = req.body;
    try {
        const dataCategory = category
        if (name) dataCategory.name = name
        if (name) dataCategory.slug = urlSlug(name)
        if (status) dataCategory.status = status
        if (description) dataCategory.description = description

        if (renewalFrequency) dataCategory.renewalFrequency = renewalFrequency
        if (totalPrice) dataCategory.totalPrice = totalPrice
        if (vacancy) dataCategory.vacancy = vacancy
        if (acceptanceRequest) dataCategory.acceptanceRequest = acceptanceRequest
        if (relationshipType) dataCategory.relationshipType = relationshipType
        if (topic) dataCategory.topic = topic._id
        dataCategory.updated_at = Date.now()

        category = await Category.findByIdAndUpdate(
            {_id: category._id},
            {$set: dataCategory},
            {new: true}
        );
        return res.status(200).json({category, code: "success"});
    } catch (e) {
        return res.status(500).json({error: e.message, code: "error"});
    }
}