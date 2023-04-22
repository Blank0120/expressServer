//user.js文件
import express from 'express';
import cryptoUtils from '../utils/crypto.js';
import { v4 as uuidv4 } from 'uuid';
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

    const { encryptedEmail, encryptedPassword, checkSum } = req.body;
    // console.log(encryptedEmail, encryptedPassword);
    if (!encryptedEmail || !encryptedPassword) {
        res.json({
            code: 404,
            message: "请填写邮箱与密码"
        });
        return;
    }

    const TEMPKEY = crypto.createHash('md5').update(global.kb).digest('hex');
    console.log('TEMPKEY', '==>', TEMPKEY);
    if (userDao.verifyLogin(encryptedEmail, encryptedPassword, TEMPKEY)) {
        // login success
        // @ts-ignore
        req.session.isLogin = true;

        const uuid = uuidv4();
        global.uuidMap.set(uuid, TEMPKEY);
        const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
        console.log("rString ==>", rString);    // the format of hmac key is utf-8
        const rsaKeys = cryptoUtils.getRsakeyPair(1024);
        const selfSignCert = cryptoUtils.getSelfSignCert(rsaKeys);
    
        const signer = { certificate: selfSignCert, keys: { privateKey: rsaKeys.privateKey } };
        const signedData = cryptoUtils.getSignedData(rString, signer);

        res.cookie('uuid', uuid, { signed: true });
        res.cookie('user', JSON.stringify({ user: 'test' }), { signed: true })
        res.json({
            code: 200,
            message: "user login success",
            rString: cryptoUtils.SM4Encrypt(rString, global.uuidMap.get(uuid)),
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
    const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
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
    const data = cryptoUtils.rsaDecryptString(cipherBase64);
    console.log("RSAdecrypt =>", data);
    res.json({ code: 200, msg: "发送成功", error: "" });
})

router.post('/loginOut' ,(req, res, next) => {
    // @ts-ignore
    delete req.session.isLogin;

    const uuid = req.signedCookies.uuid;
    if (global.uuidMap.has(uuid)) {
        global.uuidMap.delete(uuid);
        res.json({ code: 200, msg: 'loginOut success' });
    } else {
        res.json({ code: 404, error: '不存在此uuid' });
    }
})

export default router
