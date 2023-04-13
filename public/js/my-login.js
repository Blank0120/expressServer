'use strict';
$(function () {
	$("input[type='password'][data-eye]").each(function (i) {
		var $this = $(this),
			id = 'eye-password-' + i,
			el = $('#' + id);

		$this.wrap($("<div/>", {
			style: 'position:relative',
			id: id
		}));

		$this.css({
			paddingRight: 60
		});
		$this.after($("<div/>", {
			html: 'Show',
			class: 'btn btn-primary btn-sm',
			id: 'passeye-toggle-' + i,
		}).css({
			position: 'absolute',
			right: 10,
			top: ($this.outerHeight() / 2) - 12,
			padding: '2px 7px',
			fontSize: 12,
			cursor: 'pointer',
		}));

		$this.after($("<input/>", {
			type: 'hidden',
			id: 'passeye-' + i
		}));

		var invalid_feedback = $this.parent().parent().find('.invalid-feedback');

		if (invalid_feedback.length) {
			$this.after(invalid_feedback.clone());
		}

		$this.on("keyup paste", function () {
			$("#passeye-" + i).val($(this).val());
		});
		$("#passeye-toggle-" + i).on("click", function () {
			if ($this.hasClass("show")) {
				$this.attr('type', 'password');
				$this.removeClass("show");
				$(this).removeClass("btn-outline-primary");
			} else {
				$this.attr('type', 'text');
				$this.val($("#passeye-" + i).val());
				$this.addClass("show");
				$(this).addClass("btn-outline-primary");
			}
		});
	});

	$(".my-login-validation").submit(function () {
		var form = $(this);
		if (form[0].checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}
		form.addClass('was-validated');
	});
});

$(function () {
	$("#login_form").submit(async function (event) {
		const form = $(this);
		event.preventDefault();
		if (form[0].checkValidity() === false) {
			event.stopPropagation();
			return;
		}
		form.addClass('was-validated');

		try {
			await getSecret();

			const [email, password] = form[0];
			const encryptedEmail = await encrypt(email.value);
			const encryptedPassword = await encrypt(password.value);
			const checkSum = await HMAC_SM3(JSON.stringify({ encryptedEmail, encryptedPassword }));

			$.ajax({
				type: "post",
				url: "/user/passwordAuth",
				data: {
					encryptedEmail,
					encryptedPassword,
					checkSum,
				},

				dataType: "json",
				success: function (result) {
					if (result.code === 200) {
						const user = email.value.replace(/@.*?$/g, "");
						if (!user) {
							alert("登录异常");
							return;
						}
						alert(user + " " + result.message);

						const r = decrypt(result.rString);

						const hasher = CryptoApi.getHasher('sha256');
						const digest = CryptoApi.hmac(KEY, r, hasher);

						$.ajax({
							type: "post",
							url: "/user/auth",
							data: {
								randomString: result.rString,
								hmac: 'HMAC-SM3',
								digest: digest,
							},
							dataType: "json",
							success: function (resJson) {
								if (resJson.code !== 200) {
									alert(resJson.message);
									return;
								}
								window.location.href = '/welcome.html';
							},
							error: function (result) {
								alert(result.responseText);
							}
						});

					} else {
						$('h4[name="msg"]').html(result.message);
						alert(result.message);
						sessionStorage.clear();
						KEY = '';
					}
				},
				error: function (result) {
					alert("请求失败，请稍后重试");
					console.error(result.responseText);
				}
			});

		} catch (error) {
			console.error(error);
		}
	});
});
