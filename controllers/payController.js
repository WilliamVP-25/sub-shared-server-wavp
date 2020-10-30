const User = require('../models/User')
const Group = require('../models/Group')
const Payment = require('../models/Payment')
const GroupMembers = require('../models/GroupMembers')
const moment = require('moment');

exports.saveTransaction = async (req, res) => {
    const {uid} = req.user;

    let user = await User.findOne({uid}); //validar user exists
    if (!user) {
        return res.status(404).json({msg: "El usuario no existe", code: "user_not_exists"});
    }

    const {groupCode} = req.params;
    let group = await Group.findOne({code: groupCode});
    if (!group) {
        return res.status(404).json({
            msg: "El grupo ya no existe",
            code: "group_not_exists"
        });
    }

    let member = await GroupMembers.findOne()
        .where('user').gt(user._id)
        .where('group').gte(group._id)

    console.log(group._id)
    console.log(user._id)
    console.log(member)

    if (member) {
        let transaction = await Payment.findOne()
            .where('group').gte(group._id)
            .and([{user: user._id}]);
        return res.status(200).json({
            member: true,
            transaction,
            msg: "El usuario ya esta en el grupo",
            code: "already_in_group"
        });
    } else {
        try {
            const dataPayment = req.body.data;
            let payment_reference_exists = await Payment.findOne({reference: dataPayment.reference});
            if (payment_reference_exists) {
                return res.status(200).json({
                    member: true,
                    transaction: payment_reference_exists,
                    msg: "El usuario ya esta en el grupo",
                    code: "already_in_group"
                });
            }
            let payment = new Payment(dataPayment);
            payment.group = group._id
            payment.user = user._id
            await payment.save();

            const dataMember = {
                user: user._id,
                group: group._id,
                relationshipType: group.relationshipType,
                lastPaymentDate: Date.now(),
                lastPaymentPrice: payment.value,
                startDate: Date.now(),
                endDate: moment().add(31, 'days').format()
            };
            const member = new GroupMembers(dataMember);
            await member.save();

            return res.status(200).json({
                member: true,
                transaction: payment,
                msg: "Transacción exitosa",
                code: "success"
            });
        } catch (e) {
            return res.status(500).json({msg: e.message, code: "error"});
        }
    }
}
