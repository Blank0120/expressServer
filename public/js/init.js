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
				console.log(result);
			},
			error: function (error) {
				console.error(error.responseText);
			}
		});

		KEY = '';
		sessionStorage.clear();
		Cookies.remove('user');
		Cookies.remove('uuid');
	}
})