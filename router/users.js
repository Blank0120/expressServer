//user.js文件
const express = require('express');
const cryptoUtils = require('../utils/crypto');

const router = express.Router();
router.post('/login', (req, res, next) => {
    console.log(req.body);
    res.json({code: 200, message: "user login success"});
})

router.post('/passwordAuth', (req, res, next) => {
    console.log(req.body);
    const rString = cryptoUtils.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
    res.json({
        code: 200,
        message: "user login success",
        redirectUrl: `http://127.0.0.1:8080/certAuth.html?rString=${rString}`
    });
})

router.post('/certAuth', (req, res, next) => {
    console.log(req.body);
    res.json({
        code: 200,
        message: "certAuth success",
        redirectUrl: `http://127.0.0.1:8080/welcome.html`
    });
});

router.get('/getRandomString', (req, res, next) => {
    var rString = cryptoUtils.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
    const rsaKeys = cryptoUtils.getRsakeyPair(1024);
    const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);
    const signature = cryptoUtils.getSignature(rString, 'sha1', rsaKeys.privateKey);
    console.log({ code: 200, rString, serverCert: selfSignCert, signature });
    res.json({ code: 200, rString, serverCert: selfSignCert, signature });
})

module.exports = router
