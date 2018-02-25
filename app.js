// jshint esversion: 6

// Imports
const cookie = require('cookie');
const crypto = require('crypto');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const multer  = require('multer');

app.use(express.static('frontend'));
app.use(bodyParser.json());

// Database
var db
MongoClient.connect('mongodb://admin:admin@ds041678.mlab.com:41678/jindennisjubin-cscc09', (err, client) => {
  if (err) return console.log(err);
  db = client.db('jindennisjubin-cscc09');
  app.listen(3001, () => {
    console.log('listening on 3001');
  });
});

const upload = multer({ dest: path.join(__dirname, 'uploads')});

function generateSalt (){
    return crypto.randomBytes(16).toString('base64');
}

function generateHash (password, salt){
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

// -----------------------HTTP-----------------------------

//Create

app.post('/signup/', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    db.collection('users').findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");

        var salt = crypto.randomBytes(16).toString('base64');
        var saltedHash = generateHash(password, salt);
        var newUser = {_id: username, saltedHash: saltedHash, salt: salt};

        db.collection('users').insert(newUser, (err, result) => {
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
})

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