const express = require('express');
const router = express.Router();


const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('trade.db', (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the databse');
});

router.get('/', (req, res, next) => {

    res.render('dashboard', { title: 'Dashboard'});
});

router.post('/userdata',(req,res) => {
    const page_index = req.body.current_page;
    const view_count = req.body.count;
    const query = "SELECT * FROM tbl_users LIMIT " + view_count + " OFFSET " + (page_index-1) * view_count;

    db.all(query, [], (err, rows) => {
        if(err){
            return console.error(err.message);
        }
        res.send(rows);
    });

});


module.exports = router;