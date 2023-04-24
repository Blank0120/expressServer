//主文件
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from "express-fileupload";
import session, { MemoryStore } from "express-session";
//导入user的路由
import UserRouter from './router/users.js';
import FileRouter from './router/file.js';

const app = express();
app.use(cors());

app.use(cookieParser('secret'));
app.use(fileUpload());

app.use(session({
    store: new MemoryStore(),
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: "secret",
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
    console.log(req.sessionID);
    // @ts-ignore
    req.sessionStore.all((e, sessions) => {
        console.log(sessions);
    })
    next();
})

app.use('/user', UserRouter);
app.use('/file', FileRouter);

const port = 80;

app.listen(port, (req, res, next) => {
    console.log(`server is listening on ${port} port...`);
})
