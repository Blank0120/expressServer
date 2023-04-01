const forge = require('node-forge');

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
	return pemCert.replace(/-----.*?-----/g, '');
}

function getSignature(plaintext, hash, privateKey) {
	// sign data with a private key and output DigestInfo DER-encoded bytes
	// (defaults to RSASSA PKCS#1 v1.5)
	var md = forge.md[hash].create();
	md.update(plaintext, 'utf8');
	const sign = privateKey.sign(md);
	return forge.util.bytesToHex(sign);
}

function randomString(length, chars) {
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

module.exports = { getSelfSignCert, getRsakeyPair, getSignature, randomString }
