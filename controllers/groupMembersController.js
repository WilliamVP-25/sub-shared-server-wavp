const User = require('../models/User')
const Group = require('../models/Group')
const GroupMembers = require('../models/GroupMembers')
const {validationResult} = require('express-validator')
const fs = require("fs")

exports.createGroupMember = async (req, res) => {
    const errors = validationResult(req); //validation
    if (!errors.isEmpty()) {
        return res.status(202).json({
            errors: errors.array(),
            details: "data_send_incomplete",
            msg: "Datos enviados incorrectos"
        });
    }

    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupId, lastPaymentDate, startDate, endDate} = req.body;
    let group = await Group.findById(groupId).populate('category');
    if (!group) {
        return res.status(404).json({
            msg: "Error subiendo la imagen, el grupo no existe",
            code: "group_not_exists"
        });
    }

    let member = await GroupMembers.findOne()
        .where('group').gte(group._id)
        .and([{user: user._id}]);
    if (member) {
        return res.status(500).json({
            msg: "El usuario ya esta dentro del grupo",
            code: "member_already_in_group"
        });
    }
    try {
        const price = group.category ? group.category.totalPrice : group.totalPrice
        const lastPaymentPrice = price / parseInt(group.vacancy)
        const dataMember = {
            user: user._id,
            group: group._id,
            relationshipType: group.relationshipType,
            lastPaymentDate: Date.now(),
            lastPaymentPrice,
            startDate: Date.now(),
            endDate: Date.now()
        };

        const member = new GroupMembers(dataMember);
        await member.save();

        //return res.status(200).json({group, code: "success"});
        return res.status(200).json({member, code: "success", msg: "Felicidades. Estas dentro del grupo!"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({details: e.message, code: "error"});
    }
}

exports.getGroupMember = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupCode} = req.params;
    let group = await Group.findOne({code: groupCode});
    if (!group) {
        return res.status(404).json({
            msg: "Error subiendo la imagen, el grupo no existe",
            code: "group_not_exists"
        });
    }

    let member = await GroupMembers.findOne()
        .where('group').gte(group._id)
        .and([{user: user._id}]);
    if (member) {
        return res.status(200).json({member: true, code: "success"});
    } else {
        return res.status(200).json({member: false, code: "success"});
    }
}

exports.getGroupMembers = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupCode} = req.params;
    let group = await Group.findOne({code: groupCode})
        .populate('user')
        .populate('category');
    if (!group) {
        return res.status(404).json({
            msg: "El grupo no existe",
            code: "group_not_exists"
        });
    }

    if (group.user._id.toString() === user._id.toString()) {
        let member = await GroupMembers.findOne({group: group._id})
            //.where('group').gte(group._id)
            .and([{user: user._id}]);
        if (!member) {
            const price = group.category ? group.category.totalPrice : group.totalPrice;
            const lastPaymentPrice = price / parseInt(group.vacancy)
            const dataMember = {
                user: user._id,
                group: group._id,
                relationshipType: group.relationshipType,
                lastPaymentDate: Date.now(),
                lastPaymentPrice,
                startDate: Date.now(),
                endDate: Date.now()
            };
            const member = new GroupMembers(dataMember);
            await member.save();
        }
    }

    let members = await GroupMembers.find({group: group._id})
        .populate('user')
        .sort({'created_at': 'desc'})
    if (members) {
        return res.status(200).json({members, code: "success"});
    } else {
        return res.status(200).json({members: null, code: "success"});
    }
}

exports.updateGroupMember = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {name, lastName, phoneNumber, birthday, address, cityResidence, countryBirth, countryResidence, showProfileTo} = req.body;
    try {
        const dataUser = user
        if (name) dataUser.name = name
        if (lastName) dataUser.lastName = lastName
        if (phoneNumber) dataUser.phoneNumber = phoneNumber
        if (birthday) dataUser.birthday = birthday
        if (address) dataUser.address = address
        if (cityResidence) dataUser.cityResidence = cityResidence
        if (countryBirth) dataUser.countryBirth = countryBirth
        if (countryResidence) dataUser.countryResidence = countryResidence
        if (showProfileTo) dataUser.showProfileTo = showProfileTo

        user = await User.findByIdAndUpdate(
            {_id: user._id},
            {$set: dataUser},
            {new: true}
        );
        return res.status(200).json({user, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}