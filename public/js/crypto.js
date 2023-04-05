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
function getUUID() {
	const temp_url = URL.createObjectURL(new Blob());
	const uuid = temp_url.toString();
	URL.revokeObjectURL(temp_url);
	return uuid.substr(uuid.lastIndexOf("/") + 1);
}

function getKey() {
	KEY = seed.toString().padEnd(32, seed);
	sessionStorage.setItem("key", KEY);
}
