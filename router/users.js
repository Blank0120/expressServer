//user.js文件
const express = require('express');
const cryptoUtils = require('../utils/crypto');

const router = express.Router();

router.get('/login', (req, res, next) => {
    console.log(req.query);
    // res.json({ code: 200, message: "user login success" });
    res.redirect('/user/getRandomStr');
})

router.post('/login', (req, res, next) => {
    console.log(req.body);
    res.json({ code: 200, message: "user login success" });
})

router.post('/passwordAuth', (req, res, next) => {
    console.log(req.body);
    const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
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
})

router.post('/secret', (req, res, next) => {
    console.log(req.body);
    res.json({
        code: 200,
        message: "you already know the secret",
    });
})

router.get('/getRandomString', (req, res, next) => {
    const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
    const rsaKeys = cryptoUtils.getRsakeyPair(1024);
    const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);
    const signature = cryptoUtils.getSignature(rString, 'sha1', rsaKeys.privateKey);
    console.log({ code: 200, rString, serverCert: selfSignCert, signature });
    res.json({ code: 200, rString, serverCert: selfSignCert.replace(/-----.*?-----/g, ''), signature });
})

router.get('/getRandomStr', (req, res, next) => {
    const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
    const rsaKeys = cryptoUtils.getRsakeyPair(1024);
    const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);

    const signer = { certificate: selfSignCert, keys: { privateKey: rsaKeys.privateKey } };
    const signedData = cryptoUtils.getSignedData(rString, signer);

    res.json({ code: 200, signedData, randomString: rString });
})

module.exports = router
