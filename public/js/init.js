$(() => {
	const uuid = Cookies.get("uuid");
	if (document.cookie && uuid) {
		$.ajax({
			type: "post",
			url: "/user/loginOut",
			data: {
				uuid
			},
			dataType: "json",
			success: function (result) {
				// console.log(result);
				KEY = '';
				sessionStorage.clear();

				const cookies = document.cookie.split(";");

				for (let i = 0; i < cookies.length; i++) {
					const cookie = cookies[i];
					const eqPos = cookie.indexOf("=");
					const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
					document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}
			},
			error: function (error) {
				// console.error(error.responseText);
			}
		});
	}
})
