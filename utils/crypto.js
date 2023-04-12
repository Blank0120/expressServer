import forge from 'node-forge';
import sm_crypto from 'sm-crypto';
const { sm4 } = sm_crypto;

function getRsakeyPair(length) {
	const pki = forge.pki;
	// create rsa pairkey
	return pki.rsa.generateKeyPair(length);
}

function getSelfSignCert(keys) {
	const pki = forge.pki;
	// create an X.509v3 certificate
	const cert = pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.serialNumber = '01';
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
	const attrs = [{
		name: 'commonName',
		value: 'server.com'
	}, {
		name: 'countryName',
		value: 'CN'
	}, {
		name: 'organizationName',
		value: 'Server'
	}, {
		shortName: 'OU',
		value: 'Server'
	}];
	cert.setSubject(attrs);
	cert.setIssuer(attrs);

	// self-sign certificate
	cert.sign(keys.privateKey);
	const pemCert = pki.certificateToPem(cert);
	return pemCert;
}

function getSignature(plaintext, hash, privateKey) {
	// sign data with a private key and output DigestInfo DER-encoded bytes
	// (defaults to RSASSA PKCS#1 v1.5)
	const md = forge.md[hash].create();
	md.update(plaintext, 'utf8');
	const sign = privateKey.sign(md);
	return forge.util.bytesToHex(sign);
}

function getRandomString(length, chars) {
	let result = '';
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

function getSignedData(data, signer) {
	let result = '';
	try {
		// create PKCS#7 signed data
		const p7 = forge.pkcs7.createSignedData();
		p7.content = forge.util.createBuffer(data, 'utf8');

		p7.addCertificate(signer.certificate);
		p7.addSigner({
			key: signer.keys.privateKey,
			certificate: signer.certificate,
			digestAlgorithm: forge.pki.oids.sha1,
		});

		p7.sign();

		result = forge.pkcs7.messageToPem(p7);
		console.log('Signed PKCS #7 message:\n' + result);
	} catch (ex) {
		if (ex.stack) {
			console.log(ex.stack);
		} else {
			console.log('Error', ex);
		}
	}
	return result;
}

function SM4Encrypt(data, KEY) {
	const iv = '0'.repeat(32);
	const encryptData = sm4.encrypt(data, KEY, { mode: 'cbc', iv });
	return encryptData;
}

function SM4Decrypt(data, KEY) {
	const iv = '0'.repeat(32);
	const decryptData = sm4.decrypt(data, KEY, { mode: 'cbc', iv });
	return decryptData;
}

function rsaDecryptString(cipherText) {
	const rsaTokenPublicExponent = '10001';
	const rsaTokenPrivateExponent = '0e409b9db42fe09d4c21906491d3a06560bbfcc5480f0b685b61ed9704f689f4b23f0c88608b16a7befe781a008aeedeb7fd958aae760b6455de03b9207c578818ac00af2f0fc5510ec5f93c9691ae16442fd4491e5767ce25cd80b08ae4bfd7d6016753077aff5bf2d493a77f4dfbf4ed70094478ab5230ccffe953c83fc9d578cd89c1e356c5b75a5c428b3c5207267858376e616291f8e97020f9e9ecc7ddd8381910c239d95cc97a5c39f7b61783b892bfeb7fb809de3bdaacae7a4d4b31ba77adb7c2da56b8a8c3dc3d6f2a1be25b5f59b62f337bc40ab4d7724759e78c975ae06fd90d56cf579f0fe6f4fbb32f1a26f782e3cd256055cb7391918cfdc1';
	const rsaTokenPublicModulus = 'C5FA3DC3DE71C5E58FBA5BB5063241D165C20205B02584E7BBF91B81D21263CC235D2725105B8C40FC1ADD30C2BC93AD766990AC1D1F76866AB1D7CD01B51F2B4F8D0AB30B8E12ED72A756D8D043F82F011723F8C35D8D7C8F71F92A68AF15690A28E03A1A27A7D2F968A3DEBC78DA1138CEFCA9D4CC2C8002A4A4B7B3CB96CF73F6754FA359FE1ACB11AFA052F597E6D5AEDFAEB13853EBFA493A125EF176CF1960CDF8502BB9E41E7973BE3DC2C5493F9F94E1D8AAF55030CCA5824F7C3A581C51CA816347A5EA442CE319BF990072A499CDDBCE86326CA4806A2FC79F765E3045ED977C4924EA23DFB9D90FC3672F4BBCD6E509EC50ED7E74D65B575F6F2F';
	const key = RSA.getKeyPair(rsaTokenPublicExponent, rsaTokenPrivateExponent, rsaTokenPublicModulus);

	return RSA.decryptedString(key, cipherText);
}

export default { getSelfSignCert, getRsakeyPair, getSignature, getRandomString, getSignedData, SM4Encrypt, SM4Decrypt, rsaDecryptString }
