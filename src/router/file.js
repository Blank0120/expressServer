//user.js文件
import express from 'express';

const router = express.Router();

router.post('/upload', (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		res.status(400).send({
			code: 1,
			msg: 'Bad Request.'
		})
		return;
	}

	const fileObj = req.files.plainFile;

	console.log("fileObj", fileObj);
	// @ts-ignore
	const filePath = './upload/' + fileObj.name;
	// @ts-ignore
	fileObj.mv(filePath, (err) => {
		if (err) {
			console.log(err);
			return res.status(500).send({
				code: 1,
				msg: 'System error'
			})
		}
		res.send({
			code: 0,
			data: 'Upload Successfuly'
		})
	})
})

export default router;
