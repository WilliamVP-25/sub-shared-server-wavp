const User = require('../models/User')
const Topic = require('../models/Topic')
const multer = require('multer')
const shortid = require('shortid')
const urlSlug = require('url-slug')
const {validationResult} = require('express-validator')
const fs = require("fs")

exports.getTopics = async (req, res) => {
    try {
        let topics = await Topic.find();
        return res.json({topics, code: "success"});
    } catch (e) {
        return res.json({msg: e.message, code: "error"});
    }
}

exports.createTopic = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //verify user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {name, description} = req.body;
    let topic = await Topic.findOne({name});
    if (topic) {
        return res.json({message: "El Tema ya existe", code: "topic_exists"});
    }

    try {
        const dataTopic = {
            name, description,
            created_by: user._id
        }
        const topic = new Topic(dataTopic);
        await topic.save();
        return res.json({topic, code: "success"});
    } catch (e) {
        return res.json({code: "error", error: e.message});
    }
}

exports.uploadAvatar = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(400).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {topicId} = req.params;
    let topic = await Topic.findById(topicId);
    if (!topic) {
        return res.json({message: "El Tema no existe", code: "topic_not_exists"});
    }

    const config = {
        limits: {fileSize: 1024 * 1024 * 10},
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, callback) => {
                callback(null, __dirname + "/../uploads/topics/avatar/")
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
            if (topic.avatar) {
                if (!topic.avatar.includes("http")) {
                    fs.unlinkSync(__dirname + `/../uploads/topics/avatar/${topic.avatar}`);
                }
            }

            const dataTopic = {
                avatar: req.file.filename,
                updated_at: Date.now()
            }
            topic = await Topic.findByIdAndUpdate(
                {_id: topic._id},
                {$set: dataTopic},
                {new: true}
            );
            res.json({topic, code: "success"});
        } else {
            console.log(error);
            return res.json({details: "error", err: error.message});
        }
    })
    //upload.single('file');
}

exports.updateTopic = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {topicId} = req.params;
    let topic = await Topic.findById(topicId);
    if (!topic) {
        return res.json({message: "El Tema no existe", code: "topic_not_exists"});
    }

    const {name, description} = req.body;
    try {
        const dataTopic = topic
        if (name) dataTopic.name = name
        if (description) dataTopic.description = description

        topic = await Topic.findByIdAndUpdate(
            {_id: topic._id},
            {$set: dataTopic},
            {new: true}
        );
        return res.json({topic, code: "success"});
    } catch (e) {
        return res.json({error: e.message, code: "error"});
    }
}