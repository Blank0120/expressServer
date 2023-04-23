// module 模块间传值， 给window
window.seed = '';

// html 间传值，url参数，window.open, cookie, storage
window.KEY = sessionStorage.getItem('key') ?? '';
