const Database = require("@replit/database")
const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const bodyParser = require('body-parser');
//set storage engine
const db = new Database();

let dbTotalIndex = 0;

const storage = multer.diskStorage({

  destination: './public/uploads',
  filename: function(req, file, cb) {

    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

  }
});

//init upload
const upload = multer({

  storage: storage,
  limits: { filesize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }

}).single('myImage'); //single image

function checkFileType(file, cb) {

  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  //check mimetype 
  const mimetype = filetypes.test(file.mimetype);

  //make sure both are true

  if (mimetype && extname) {
    return cb(null, true);
  }
  else {
    cbb("Error:images only");
  }
};
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/new', function(req, res) {


  res.render('inde');
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('inde', {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render('inde', {
          msg: 'Error: No File Selected!'
        });
      } else {
        data = {
          nama : req.body.nama,
          harga : req.body.harga,
          ukuran : req.body.ukuran,
          type : req.body.type,
          deskripsi : req.body.deskripsi,
          url:req.file.filename
        };
        addDatabase(data);
        
        res.render('inde', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});


app.get("/api/products", (req, res) => {
     
  db.getAll().then(products => {
    let respond = [];
    Object.keys(products).forEach(key => {
      let data = {
        id: key,
        nama:products[key].nama,
        harga:products[key].harga,
        ukuran:products[key].ukuran,
        type:products[key].type,
        deskripsi:products[key].deskripsi,
        url: products[key].url
      }
      respond.push(data);
    })
    return res.status(200).json(respond);
  });
  
});

app.get("/api/product/:id", (req, res) => {
     
  db.get(req.params.id).then((data) => {
    res.status(200).json(data);
  });
  
});

function addDatabase(data){
  db.set(generateUID(), data);
}

function generateUID(){
  return'p' + Math.random().toString(36).substr(2, 9);
}

app.all("/", (req, res) => {
  res.send("Running!!!")
})
app.listen(3000, function(req, res) {

  console.log("you are listening to port 3000");

});