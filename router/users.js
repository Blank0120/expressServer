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
    const { encryptedEmail, encryptedPassword, checkSum } = req.body;
    // console.log(encryptedEmail, encryptedPassword);
    if (!encryptedEmail || !encryptedPassword) {
        res.json({
            code: 500,
            message: "Please fill your email or password"
        });
        return;
    }
    if (cryptoUtils.SM4Decrypt(encryptedEmail) === 'test@test.com' && cryptoUtils.SM4Decrypt(encryptedPassword) === "test") {
        const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
        console.log(rString);
        res.json({
            code: 200,
            message: "user login success",
            rString: cryptoUtils.SM4Encrypt(rString)
            // redirectUrl: `./auth.html?rString=${rString}`
        });
    } else {
        res.json({
            code: 404,
            message: "邮箱地址或密码错误",
        });
    }
})

router.post('/auth', (req, res, next) => {
    console.log(req.body);
    res.json({
        code: 200,
        message: "auth success",
        // redirectUrl: `./welcome.html`
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

router.get('/dh', (req, res, next) => {
    const power = (a, b, p) => {
        if (b == 1)
            return a;
        else
            return ((Math.pow(a, b)) % p);
    }
    const getRandom = (min, max) => {
        return Math.floor(Math.random() * max) + min;
    }
    const P = 98764321261;
    const G = 7;
    const b = getRandom(3, 10);

    const y = power(G, b, P);

    console.log("x ====> ", req.query.x);
    const kb = power(req.query.x, b, P);
    console.log("kb ====> ", kb);

    res.json({ code: 200, y });
})

module.exports = router
