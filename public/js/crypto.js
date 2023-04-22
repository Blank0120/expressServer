function encrypt(data) {
	const encryptData = sm4.encrypt(data, KEY, { mode: 'cbc', iv });
	return encryptData;
}

function decrypt(data) {
	const decryptData = sm4.decrypt(data, KEY, { mode: 'cbc', iv });
	return decryptData;
}

function HMAC_SM3(data) {
	if (!data) {
		return;
	}
	return CryptoJS.SHA256(data).toString();
}

function generateKey() {
	KEY = CryptoJS.MD5(seed.toString()).toString();
	sessionStorage.setItem("key", KEY);
}
