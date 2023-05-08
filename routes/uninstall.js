const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
    secret: 'ef0e2ef89f27e26d376e77aa8fe6329785979cd40e8bf60e9ab95897ee9d63b9',
    responseType: 'json'
});

router.get('/', (req, next) => {
    try {
        const data = bigCommerce.verify(req.query['signed_payload']);
        console.log(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;