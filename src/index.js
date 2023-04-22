//主文件
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from "express-session";
//导入user的路由
import UserRouter from './router/users.js';

// region
// use map for uuid ===> secret
global.uuidMap = new Map();

// endregion

const app = express();
app.use(cors());

app.use(cookieParser('secret'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));

// enable express to parse content type of application/json.
app.use(express.json());

// x-www-from-urlencoded格式解析
// false表明用node的内置模块querystring来解析
// true表示使用第三方库qs来解析
// urlencoded格式解析，解析后的结果放在了res.body属性中
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));
app.use((req, res, next) => {
    console.log(global.uuidMap);
    console.log(req.session);
    next();
})

app.use('/user', UserRouter);

const port = 80;

app.listen(port, (req, res, next) => {
    console.log(`server is listening on ${port} port...`);
})
