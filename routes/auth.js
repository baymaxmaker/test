const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
clientId: 'nwojlercch9hikjr19um9oefv8fl8sq',
secret: 'ef0e2ef89f27e26d376e77aa8fe6329785979cd40e8bf60e9ab95897ee9d63b9',
callback: 'https://a5b0-45-126-3-252.ngrok-free.app/auth',
responseType: 'json'
});

router.get('/', (req, res, next) => {
bigCommerce.authorize(req.query)
.then(data => console.log(data))
.then(data => res.render('auth', { title: 'Authorized!' }));
});
module.exports = router;