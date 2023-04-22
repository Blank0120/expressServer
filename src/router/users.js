//user.js文件
import express from 'express';
import cryptoUtils from '../utils/crypto.js';
import crypto from "crypto";
import atob from "atob";
import btoa from "btoa";
import userDao from "../database/userDao.js";

const router = express.Router();

const isLogin = (req, res, next) => {
    if (!req.session.isLogin) {
        res.json({
            code: 401,
            message: '请先登录'
        })
        return;
    }
    next();
};

router.post('/login', (req, res, next) => {
    // @ts-ignore
    delete req.session.isLogin;

    const { email, encryptedPassword, checkSum } = req.body;
    // console.log(email, encryptedPassword);
    if (!email || !encryptedPassword) {
        res.json({
            code: 404,
            message: "请填写邮箱与密码"
        });
        return;
    }

    const TEMPKEY = crypto.createHash('md5').update(global.kb).digest('hex');
    console.log('TEMPKEY', '==>', TEMPKEY);
    if (userDao.verifyLogin(email, encryptedPassword, TEMPKEY)) {
        // login success
        // @ts-ignore
        req.session.isLogin = true;
        // @ts-ignore
        req.session.secretKey = TEMPKEY;
        // @ts-ignore
        const { secretKey } = req.session;

        const rString = cryptoUtils.getRandomString();
        console.log("rString ==>", rString);    // the format of hmac key is utf-8
        const rsaKeys = cryptoUtils.getRsakeyPair(1024);
        const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);

        const signer = { certificate: selfSignCert, keys: { privateKey: rsaKeys.privateKey } };
        const signedData = cryptoUtils.getSignedData(rString, signer);

        res.cookie('signedUsername', email.replace(/@.+\.com/g,''), { signed: true });
        res.json({
            code: 200,
            message: "user login success",
            rString: cryptoUtils.SM4Encrypt(rString, secretKey),
            signedData
        });
    } else {
        // login failed
        res.json({
            code: 401,
            message: "邮箱地址或密码错误",
        });
    }
})

router.post('/auth', isLogin, (req, res, next) => {
    // console.log(req.body);
    res.json({
        code: 200,
        message: "auth success"
    });
})

router.get('/getRandomString', isLogin, (req, res, next) => {
    const rString = cryptoUtils.getRandomString();
    const rsaKeys = cryptoUtils.getRsakeyPair(1024);
    const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);
    const signature = cryptoUtils.getSignature(rString, 'sha1', rsaKeys.privateKey);
    console.log({ code: 200, rString, serverCert: selfSignCert, signature });
    res.json({ code: 200, rString, serverCert: selfSignCert.replace(/-----.*?-----/g, ''), signature });
})

router.get('/dh/:x', (req, res, next) => {
    const alice = crypto.getDiffieHellman('modp1');
    alice.generateKeys();

    const aliceSecret = alice.computeSecret(req.params.x, 'base64', 'hex');

    const y = btoa(JSON.stringify(alice.getPublicKey()));

    global.kb = aliceSecret;
    res.json({ code: 200, y });
})

router.post('/decrypt', isLogin, (req, res, next) => {
    // console.log("cookies =", req.signedCookies);
    const cipherBase64 = req.body.cipherBase;
    // @ts-ignore
    const { secretKey } = req.session;
    const data = cryptoUtils.SM4Decrypt(atob(cipherBase64), secretKey);
    // const data = cryptoUtils.rsaDecryptString(cipherBase64);
    console.log("RSAdecrypt =>", data);
    res.json({ code: 200, msg: "发送成功", error: "" });
})

router.get('/loginOut', (req, res, next) => {
    // @ts-ignore
    delete req.session.isLogin;
    // @ts-ignore
    delete req.session.secretKey;

    res.json({ code: 200, msg: 'loginOut success' });
})

export default router
