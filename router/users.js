//user.js文件
const express = require('express');
const cryptoUtils = require('../utils/crypto');

const router = express.Router();
router.post('/login', (req, res, next) => {
    console.log(req.body);
    res.json({code: 200, message: "user login success"});
})

router.get('/getRandomString', (req, res, next) => {
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
    const rsaKeys = cryptoUtils.getRsakeyPair(1024);
    const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);
    const signature = cryptoUtils.getSignature(rString, 'sha1', rsaKeys.privateKey);

    res.json({ code: 200, rString, serverCert: selfSignCert, signature });
})

module.exports = router
