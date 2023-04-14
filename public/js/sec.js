async function getSecret() {
	console.log("start... :)");
	console.log("");

	async function dh() {
		const bob = getDiffieHellman('modp1');
		bob.generateKeys();

		const x = btoa(JSON.stringify(bob.getPublicKey()));

		const yRes = await (await fetch(`/user/dh?x=${x}`)).json();

		if (yRes.code !== 200) {
			alert("与服务器断开连接");
			return
		}
		const json = JSON.parse(atob(yRes.y));
		const bobSecret = bob.computeSecret(new Uint8Array(json.data), null, 'hex');

		return bobSecret.toString('hex');
	}

	try {
		seed = await dh();
		console.log(seed);
	} catch (error) {
		console.error(error);
	}
	generateKey();
};
