const User = require('../models/User')
const Category = require('../models/Category')
const Topic = require('../models/Topic')
const Group = require('../models/Group')
const GroupMembers = require('../models/GroupMembers')
const multer = require('multer')
const shortid = require('shortid')
const urlSlug = require('url-slug')
const {validationResult} = require('express-validator')
const fs = require("fs");

exports.getGroups = async (req, res) => {
    try {
        let groups = await Group.find()
            .populate('category')
            .populate('topic')
            .populate('user');
        return res.status(200).json({groups, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}

exports.getSearchResults = async (req, res) => {
    try {
        const {query} = req.body

        let results = [];
        let categories = await Category.find()
            .or([{"name": {$regex: `.*${query}.*`, $options: 'i'}},
                {"description": {$regex: `.*${query}.*`, $options: 'i'}},
                {"slug": {$regex: `.*${query}.*`, $options: 'i'}}
            ]);

        for (let category of categories) {
            let groups_categories = await Group.find({category: category._id})
                //.where('status', "ACTIVE")
                .populate('category')
                .populate('topic')
                .populate('user');
            for (let group of groups_categories) {
                results.push(group._doc);
            }
        }

        let groups = await Group.find().or([
            {"name": {$regex: `.*${query}.*`, $options: 'i'}},
            {"description": {$regex: `.*${query}.*`, $options: 'i'}},
        ])
            .populate('category')
            .populate('topic')
            .populate('user');

        for (let group of groups) {
            if (results.includes(group)) continue
            results.push(group._doc);
        }

        return res.status(200).json({groups: results, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}

exports.getCustomGroups = async (req, res) => {
    try {
        let groups = await Group.find({category: null})
            .populate('topic')
            .populate('user');
        return res.status(200).json({groups, code: "success"});
    } catch (e) {
        return res.status(500).json({details: e.message, code: "error"});
    }
}

exports.getGroup = async (req, res) => {
    try {
        const {uid} = req.user;
        if (!uid) return res.status(403).json({code: "not_auth"});

        let user = await User.findOne({uid}); //verify user exists
        if (!user) return res.status(403).json({code: "user_not_exists"});

        const {groupCode} = req.params
        let group = await Group.findOne({code: groupCode})
            .populate('category')
            .populate('topic')
            .populate('user');

        let members = await GroupMembers.find({group: group._id})

        if (!group) return res.status(404).json({code: "group_not_exists", msg: "El grupo que buscas no existe"});

        let dataGroup;
        if (group.category) {
            dataGroup = {
                ...group.category._doc,
                ...group._doc,
                membersCount: members.length
            }
        } else {
            dataGroup = group;
        }

        return res.status(200).json({group: dataGroup, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}

exports.createGroup = async (req, res, next) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //verify user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {
        category, name, renewalFrequency, description,
        totalPrice, vacancy, acceptanceRequest,
        relationshipType, visibility, topic
    } = req.body;

    let dataGroup
    if (category && category !== 'personalize') {
        let category_exists = await Category.findById(category);
        if (!category_exists) {
            return res.status(404).json({msg: "La categoría ya no existe", code: "category_not_exists"});
        }
        dataGroup = {
            slug: urlSlug(name),
            code: shortid.generate(),
            user: user._id,
            vacancy,
            category: category_exists._id,
            visibility
        }
    } else {
        let topic_exists = await Topic.findById(topic);
        if (!topic_exists) {
            return res.status(404).json({msg: "El tema elegido ya no existe", code: "topic_not_exists"});
        }
        dataGroup = {
            name, slug: urlSlug(name),
            code: shortid.generate(),
            user: user._id,
            vacancy, renewalFrequency, description,
            totalPrice, acceptanceRequest,
            relationshipType, visibility, topic
        }
    }
    try {
        const group = new Group(dataGroup);
        await group.save();
        return res.status(200).json({group, code: "success"});
    } catch (e) {
        return res.status(500).json({code: "error", details: e.message});
    }
}

exports.uploadCover = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupId} = req.params;
    let group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({
            msg: "Error subiendo la imagen, el grupo no existe",
            code: "group_not_exists"
        });
    }

    const config = {
        limits: {fileSize: 1024 * 1024 * 10},
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, callback) => {
                callback(null, __dirname + "/../uploads/groups/cover/")
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
            if (group.cover) {
                if (!group.cover.includes("http")) {
                    fs.unlinkSync(__dirname + `/../uploads/groups/cover/${group.cover}`);
                }
            }
            const dataGroup = {
                cover: req.file.filename,
                updated_at: Date.now()
            }
            group = await Group.findByIdAndUpdate(
                {_id: group._id},
                {$set: dataGroup},
                {new: true}
            );
            return res.status(200).json({group, code: "success"});
        } else {
            console.log(error);
            return res.status(500).json({details: "error", err: error.message});
        }
    })
    //upload.single('file');
}

exports.updateGroup = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {groupCode} = req.body;
    let group = await Group.findOne({code: groupCode});
    if (!group) {
        return res.status(404).json({msg: "El grupo no existe", code: "group_not_exists"});
    }

    let dataGroup = {};
    if (req.body.category && req.body.category !== 'personalize') {
        let category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(404).json({msg: "La categoría no existe", code: "category_not_exists"});
        }

        const {visibility, vacancy} = req.body;
        if (visibility) dataGroup.visibility = visibility
        if (vacancy) dataGroup.vacancy = vacancy
        if (name) dataGroup.name = name
    } else {
        const {visibility, vacancy, name, description} = req.body;
        if (visibility) dataGroup.visibility = visibility
        if (vacancy) dataGroup.vacancy = vacancy
        if (name) dataGroup.name = name
        if (description) dataGroup.description = description
    }

    try {
        group = await Group.findByIdAndUpdate(
            {_id: group._id},
            {$set: dataGroup},
            {new: true});
        return res.status(200).json({group, code: "success"});
    } catch (e) {
        return res.status(500).json({details: e.message, code: "error"});
    }
}