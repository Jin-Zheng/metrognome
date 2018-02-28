// jshint esversion: 6

// Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cookie = require('cookie');
const crypto = require('crypto');
const session = require('express-session');

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const multer  = require('multer');
const GridFSStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

// Database connection / storage connection
// Because of Async we cannot use any db or gfs commands on startup
var db; // Access db
var gfs; // Access gridfs filesystem
MongoClient.connect('mongodb://admin:admin@ds041678.mlab.com:41678/jindennisjubin-cscc09', function(err, client){
    if (err) return console.log(err);
    db = client.db('jindennisjubin-cscc09');
    gfs = Grid(db, mongo);
    app.listen(3001, function(){
    console.log('DB listening on 3001');
    });
});
// Access gridfs filesystem (simplified upload)
const storage = new GridFSStorage({
    url: 'mongodb://admin:admin@ds041678.mlab.com:41678/jindennisjubin-cscc09',
    file: function(req, file){
        return {
            filename: file.originalname,
            metadata: req.body
        }
    }
});
const upload = multer({ storage });

// Authentication
function generateSalt(){
    return crypto.randomBytes(16).toString('base64');
}
function generateHash(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');;
}
app.use(session({
    secret: 'I dont know what goes here',
    resave: false,
    saveUninitialized: true,
}));

var isAuthenticated = function(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

// Serve frontend
app.use(express.static('frontend'));
app.use(bodyParser.json());

// -----------------------HTTP-----------------------------

app.post('/file/', upload.single('file'), function(req, res, next){
    return res.json("Success");
});

// Src: https://ciphertrick.com/2017/02/28/file-upload-with-nodejs-and-gridfs-mongodb/
app.get('/file/:filename', function(req, res, next){
    gfs.files.find({filename: req.params.filename}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        var readstream = gfs.createReadStream({
            filename: files[0].filename
        });
        res.set('Content-Type', files[0].contentType)
        return readstream.pipe(res);
    });
});

app.get('/file/', function(req, res, next){
     gfs.files.find({}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        return res.json(files);
     })
})

app.delete('/file/:filename', function(req, res, next){
    gfs.exist({filename: req.params.filename}, function(err, found){
        if (err) return res.status(400).end('file not found');
        gfs.remove({ filename: req.params.filename });
    });
})

// users collection

app.post('/signup/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    db.collection('users').findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");

        var salt = crypto.randomBytes(16).toString('base64');
        var saltedHash = generateHash(password, salt);
        var newUser = {_id: username, saltedHash: saltedHash, salt: salt};

        db.collection('users').insert(newUser, function(err, result){
            if (err) return console.log(err);
            req.session.user = newUser;
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                  path : '/',
                  maxAge: 60 * 60 * 24 * 7
            }));
            return res.json("user " + username + " signed up");
        });
    });
});

app.post('/signin/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // retrieve user from the database
    db.collection('users').findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        if (user.saltedHash !== generateHash(password, user.salt)) return res.status(401).end("access denied");
        // start a session
        req.session.user = user;
        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
              path : '/',
              maxAge: 60 * 60 * 24 * 7
        }));
        return res.json("user " + username + " signed in");
    });
});

app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});

app.get('/', (req, res) => {
  var cursor = db.collection('users').find();
  console.log(cursor);
})

// --------------------------------------------------------

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});