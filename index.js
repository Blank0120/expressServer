//主文件
const express = require('express');
const cors = require('cors');

//导入user的路由
const UserRouter = require('./router/users');

const app = express();

app.use(express.static('public'));

app.use(cors());

// x-www-from-urlencoded格式解析
// false表明用node的内置模块querystring来解析
// true表示使用第三方库qs来解析
// urlencoded格式解析，解析后的结果放在了res.body属性中
app.use(express.urlencoded({extended: true}));

app.use('/user', UserRouter);

app.listen(80, (req, res, next) => {
    console.log("server is listening on 80 port");
})
