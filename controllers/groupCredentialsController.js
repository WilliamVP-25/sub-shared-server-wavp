const User = require('../models/User')
const Group = require('../models/Group')
const GroupMembers = require('../models/GroupMembers')
const GroupCredentials = require('../models/GroupCredentials')
const {validationResult} = require('express-validator')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

exports.createGroupCredential = async (req, res) => {
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

    const {groupId, name, value} = req.body;
    let group = await Group.findById(groupId).populate('category');
    if (!group) {
        return res.status(404).json({
            msg: "Error subiendo la imagen, el grupo no existe",
            code: "group_not_exists"
        });
    }

    let credential_exists = await GroupMembers.findOne()
        .where('group').gte(group._id)
        .and([{name}]);
    if (credential_exists) {
        return res.status(500).json({
            msg: "Esta credecial ya esta creada en el grupo",
            code: "credential_already_in_group"
        });
    }

    try {
        const dataCredential = {
            group: group._id,
            name,
            value: cryptr.encrypt(value)
        };

        const member = new GroupCredentials(dataCredential);
        await member.save();

        //return res.status(200).json({group, code: "success"});
        return res.status(200).json({member, code: "success", msg: "Credencial ingresada correctamente"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({details: e.message, code: "error"});
    }
}

exports.getGroupCredentials = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupCode} = req.params;
    let group = await Group.findOne({code: groupCode});
    if (!group) {
        return res.status(404).json({
            msg: "El grupo no existe",
            code: "group_not_exists"
        });
    }

    let credentials = await GroupCredentials.find()
        .where('group').gte(group._id);
    if (credentials) {
        let credentialsDecrypt = [];
        for (let credential of credentials) {
            credential.value = cryptr.decrypt(credential.value);
            credentialsDecrypt.push(credential)
        }
        return res.status(200).json({credentials: credentialsDecrypt, code: "success"});
    } else {
        return res.status(200).json({credentials: null, code: "success"});
    }
}

exports.updateGroupCredential = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {credentialId} = req.params;
    let credential = await GroupCredentials.findById(credentialId)
    if (!credential) {
        return res.status(404).json({code: "credential_not_exists", msg: "La credencial ya no existe"});
    }

    let group = await Group.findById(credential.group)
    if (!group) {
        return res.status(404).json({code: "group_not_exists", msg: "El grupo ya no existe"});
    }
    if (user._id !== group.user) {
        return res.status(403).json({
            code: "user_not_creator",
            msg: "No tienes permiso para modificar esta credencial"
        });
    }

    const {name, value} = req.body;
    try {
        const dataCredential = credential
        if (name) dataCredential.name = name
        if (value) dataCredential.value = cryptr.encrypt(value)
        dataCredential.updated_at = Date.now()

        credential = await GroupCredentials.findByIdAndUpdate(
            {_id: credential._id},
            {$set: dataCredential},
            {new: true}
        );
        return res.status(200).json({credential, code: "success"});
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}

exports.updateGroupCredentials = async (req, res) => {
    const {uid} = req.user;
    if (!uid) return res.status(403).json({code: "not_auth"});

    let user = await User.findOne({uid}); //validar user exists
    if (!user) return res.status(403).json({code: "user_not_exists"});

    const {groupCode} = req.params;
    let group = await Group.findOne({code: groupCode})
    if (!group) {
        return res.status(404).json({code: "group_not_exists", msg: "El grupo ya no existe"});
    }

    if (user._id.toString() !== group.user.toString()) {
        return res.status(403).json({
            code: "user_not_creator",
            msg: "No tienes permiso para modificar esta credencial"
        });
    }

    const {credentials, newCredentials} = req.body;

    try {
        if (credentials && credentials.length > 0) {
            for (let credential of credentials) {
                let credentialReg = await GroupCredentials.findById(credential._id)
                if (!credentialReg) {
                    continue;
                    //return res.status(404).json({code: "credential_not_exists", msg: "La credencial ya no existe"});
                } else {
                    const dataCredential = credential
                    const {name, value} = dataCredential
                    if (name) dataCredential.name = name
                    if (value) dataCredential.value = cryptr.encrypt(value)
                    dataCredential.updated_at = Date.now()

                    credential = await GroupCredentials.findByIdAndUpdate(
                        {_id: credentialReg._id},
                        {$set: dataCredential},
                        {new: true}
                    );
                }
            }
        }

        if (newCredentials && newCredentials.length > 0) {
            for (let credential of newCredentials) {
                let credentialReg = await GroupCredentials.findById(credential._id)
                if (!credentialReg) {
                    const {name, value} = credential
                    const dataCredential = {
                        group: group._id,
                        name,
                        value: cryptr.encrypt(value)
                    };
                    const member = new GroupCredentials(dataCredential);
                    await member.save();
                } else {
                    const dataCredential = credentialReg
                    const {name, value} = dataCredential
                    if (name) dataCredential.name = name
                    if (value) dataCredential.value = cryptr.encrypt(value)
                    dataCredential.updated_at = Date.now()

                    credential = await GroupCredentials.findByIdAndUpdate(
                        {_id: credentialReg._id},
                        {$set: dataCredential},
                        {new: true}
                    );
                }
            }
        }

        let credentialsGroup = await GroupCredentials.find()
            .where('group').gte(group._id);
        if (credentialsGroup) {
            let credentialsDecrypt = [];
            for (let credential of credentialsGroup) {
                credential.value = cryptr.decrypt(credential.value);
                credentialsDecrypt.push(credential)
            }
            return res.status(200).json({credentials: credentialsDecrypt, code: "success"});
        } else {
            return res.status(200).json({credentials: null, code: "success"});
        }
    } catch (e) {
        return res.status(500).json({msg: e.message, code: "error"});
    }
}