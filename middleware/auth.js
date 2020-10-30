require('dotenv').config({path: 'variables.env'})
const admin = require('firebase-admin')
const serviceAccount = require("../config/shared-sub-club-firebase-adminsdk-1z1lm-2c5d6415da.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shared-sub-club.firebaseio.com"
});

module.exports = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            await admin.auth().verifyIdToken(token)
                .then(decodedToken => {
                    req.user = decodedToken;
                    return next();
                }).catch(function (error) {
                    req.user = null;
                    return res.status(403).json({code: "user_no_auth"})
                });
            //req.user = jwt.verify(token, process.env.SECRET_JWT).user; //set user request
        } catch (e) {
            req.user = null;
            return res.status(403).json({code: "user_no_auth"})
        }
    }
}