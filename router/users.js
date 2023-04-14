//user.js文件
import express from 'express';
import cryptoUtils from '../utils/crypto.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";

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
            message: "请填写邮箱与密码"
        });
        return;
    }
    
    const TEMPKEY = crypto.createHash('md5').update(global.kb).digest('hex');
    console.log('TEMPKEY', '==>', TEMPKEY);
    if (cryptoUtils.SM4Decrypt(encryptedEmail, TEMPKEY) === 'test@test.com' && cryptoUtils.SM4Decrypt(encryptedPassword, TEMPKEY) === "test") {
        // login success
        const uuid = uuidv4();
        global.uuidMap.set(uuid, TEMPKEY);
        const rString = cryptoUtils.getRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=+/');
        console.log("rString ==>", rString);    // the format of hmac key is utf-8
        res.cookie('uuid', uuid, { signed: true });
        res.cookie('user', JSON.stringify({ user: 'test' }), { signed: true })
        res.json({
            code: 200,
            message: "user login success",
            rString: cryptoUtils.SM4Encrypt(rString, global.uuidMap.get(uuid))
        });
    } else {
        // login failed
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
        message: "auth success"
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

    console.log("x ===> ", req.query.x);
    const kb = power(req.query.x, b, P);
    console.log("kb ==> ", kb);

    global.kb = kb.toString();
    res.json({ code: 200, y });
})

router.post('/decrypt', (req, res, next) => {
    console.log("cookies =", req.signedCookies);
    const cipherBase64 = req.body.cipherBase;
    const data = cryptoUtils.rsaDecryptString(cipherBase64);
    console.log(data);
    res.json({ code: 200, msg: "发送成功", error: "" });
})

router.post('/loginOut', (req, res, next) => {
    const uuid = req.signedCookies.uuid;
    console.log('loginOut => uuid =', uuid);
    if (global.uuidMap.has(uuid)) {
        global.uuidMap.delete(uuid);
        res.json({ code: 200, msg: 'loginOut success' });
    } else {
        res.json({ code: 404, error: '不存在此uuid' });
    }
})

export default router
