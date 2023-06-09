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

function getRandomString() {
	const length = 32;
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

export default { getSelfSignCert, getRsakeyPair, getSignature, getRandomString, getSignedData, SM4Encrypt, SM4Decrypt }
