import cryptoUtils from "../utils/crypto.js";

const userMap = new Map([
	['test@test.com', "test"],
	['fuck@fuck.com', "fuck"],
	['I@I.com', "I"],
	['love@love.com', "love"],
	['you@you.com', "you"],
]);

const userDao = {};



userDao.verifyLogin = (encryptedEmail, encryptedPassword, TEMPKEY) => {
	const email = cryptoUtils.SM4Decrypt(encryptedEmail, TEMPKEY);
	const password = cryptoUtils.SM4Decrypt(encryptedPassword, TEMPKEY);

	return userMap.has(email) && userMap.get(email) === password;
}

export default userDao