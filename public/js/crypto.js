function encrypt(data) {
	const encryptData = sm4.encrypt(data, SM4Key, { mode: 'cbc', iv });
	return encryptData;
}

function dencrypt(data) {
	const decryptData = sm4.decrypt(data, SM4Key, { mode: 'cbc', iv });
	return decryptData;
}

function HMAC_SM3(data) {
	if (!data) {
		return;
	}
	return CryptoJS.SHA256(data).toString();
}
