// module 模块间传值， 给window
window.seed = '';

// html 间传值，url参数，window.open, cookie, storage
window.KEY = sessionStorage.getItem('key') ?? '';

window.encrypt = function encrypt(data) {
	const iv = '0'.repeat(32);
	const encryptData = sm4.encrypt(data, KEY, { mode: 'cbc', iv });
	return encryptData;
}

window.decrypt = function decrypt(data) {
	const iv = '0'.repeat(32);
	const decryptData = sm4.decrypt(data, KEY, { mode: 'cbc', iv });
	return decryptData;
}

window.SHA256 = function SHA256(data) {
	if (!data) {
		return;
	}
	return CryptoJS.SHA256(data).toString();
}
