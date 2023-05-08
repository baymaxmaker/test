const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const multer = require('multer');
const axios = require('axios');

const bigCommerce = new BigCommerce({
    secret: 'ef0e2ef89f27e26d376e77aa8fe6329785979cd40e8bf60e9ab95897ee9d63b9',
    responseType: 'json'
});

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('trade.db', (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the databse');
});

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
});
const upload = multer({ storage });


router.get('/', (req, res, next) => {
    // const data = bigCommerce.verify(req.query['signed_payload']);
    // console.log(data);

    res.render('dashboard', { title: 'Dashboard'});
});

router.post('/getuserdata', (req,res) =>{

    var query = "SELECT * from tbl_users ";
    var data = req.body;
    if(data['search[value]'] != ""){
        var search_key = data['search[value]'];
        query = query + "WHERE id LIKE '%" + search_key + "%'";
        for(var i = 1 ; i < 13 ; i++){
            query  = query + " OR " + data['columns['+i+'][data]'] + " LIKE '%" + search_key + "%'";
        }
    }
    var order_index = data['order[0][column]'];
    query = query + " ORDER BY " + data['columns['+order_index+'][data]']+ " " + data['order[0][dir]'];
    query = query + " LIMIT " + data['length'] + " OFFSET " + data['start'];

    var return_data = {};
    var count, filtered_data, filtered_cnt;
    db.get("select count(*) as cnt from tbl_users", (error, row) =>{        
        count = row['cnt'];
        db.all(query,[],(err,rows) =>{
            filtered_data = rows;
            filtered_cnt = rows.length;
            return_data['draw'] = data['draw'];
            return_data['recordsTotal'] = count;
            return_data['recordsFiltered'] = filtered_cnt;
            return_data['data'] = filtered_data;
            res.send(return_data);
        });
    });
});

router.get('/test', (req,res,next) => {
    res.render('trade_account');
})
router.post('/create-account',upload.single('file'), async(req,res)=> {
    var data = req.body; // Form Data
    var filepath;
    if( (typeof req.file) == 'undefined' ){
        filepath = "";
    }
    else{
        filepath = req.file['path'];
    }
    const response = await axios.get('https://api.bigcommerce.com/stores/cj4bn34dc0/v3/customers?email:in='+data['email'],{
            headers:{
                'X-Auth-Token': 'sgrpwhb53g5rt21qyo198b89rxp3it8',
                'Accept': 'application/json'
            }
        });
    custom_info = response.data.data;
    
    //Guest Mode
    if( (typeof data['password'] != 'undefined')){
        
        if( custom_info.length != 0 ){
            res.send("need_login");
            return;
        }
        else{
            const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
            const result = await db.run(sql,[data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
            res.send("success");
        }
    }
    //Customer Mode
    else{
        const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
        db.run(sql, [data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
        res.send("success");
    }
    
});

module.exports = router;