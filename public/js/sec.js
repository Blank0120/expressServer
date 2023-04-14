async function getSecret() {
	console.log("start... :)");
	console.log("");

	async function dh() {
		const power = (a, b, p) => {
			if (b == 1)
				return a;
			else
				return ((Math.pow(a, b)) % p);
		}
		const getRandom = (min, max) => {
			return Math.floor(Math.random() * max) + min;
		}

		const P = 98764321261;

		const G = 7;

		const a = getRandom(3, 10);

		const x = power(G, a, P);

		const yRes = await (await fetch(`/user/dh?x=${x}`)).json();

		if (yRes.code !== 200) {
			alert("与服务器断开连接");
			return
		}

		const ka = power(yRes.y, a, P);

		return ka;
	}

	try {
		seed = await dh();
		console.log(seed);
	} catch (error) {
		console.error(error);
	}
	generateKey();
};
