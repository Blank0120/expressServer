const forge = require('node-forge');
const sm4 = require('sm-crypto').sm4;

function getRsakeyPair(length) {
	const pki = forge.pki;
	// create rsa pairkey
	return pki.rsa.generateKeyPair(length);
}

function getSelfSignCert(keys) {
	const pki = forge.pki;
	// create an X.509v3 certificate
	var cert = pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.serialNumber = '01';
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
	var attrs = [{
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
	var md = forge.md[hash].create();
	md.update(plaintext, 'utf8');
	const sign = privateKey.sign(md);
	return forge.util.bytesToHex(sign);
}

function getRandomString(length, chars) {
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

function getSignedData(data, signer) {
	var result = '';
	try {
		// create PKCS#7 signed data
		var p7 = forge.pkcs7.createSignedData();
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

function SM4Encrypt(data) {
	const SM4Key = '85ea44ba735bc287ecd3c9865997b0f1';
	const iv = 'cf1ee0181c961b8fdd45e5b397114e2b';
	const encryptData = sm4.encrypt(data, SM4Key, { mode: 'cbc', iv });
	return encryptData;
}

function SM4Decrypt(data) {
	const SM4Key = '85ea44ba735bc287ecd3c9865997b0f1';
	const iv = 'cf1ee0181c961b8fdd45e5b397114e2b';
	const decryptData = sm4.decrypt(data, SM4Key, { mode: 'cbc', iv });
	return decryptData;
}

module.exports = { getSelfSignCert, getRsakeyPair, getSignature, getRandomString, getSignedData, SM4Encrypt, SM4Decrypt }
