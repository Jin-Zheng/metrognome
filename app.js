// jshint esversion: 6

// Imports
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const cookie = require('cookie');
const crypto = require('crypto');
const session = require('express-session');
const validator = require('validator');
const MongoDBStore = require('connect-mongodb-session')(session);
const assert = require('assert');

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const multer  = require('multer');
const GridFSStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('./configuration/config');

const app = express();
var store = new MongoDBStore(
    {
    uri: 'mongodb://admin:admin@ds041678.mlab.com:41678/jindennisjubin-cscc09',
    databaseName: 'jindennisjubin-cscc09',
    collection: 'session'//,
    //clear_interval:1000 * 60 * 60 * 24 * 7
});
// Catch errors
// From https://www.npmjs.com/package/connect-mongodb-session
store.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(favicon(path.join(__dirname, '/frontend/media/', 'favicon.ico')));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url,
    profileFields: ['email','id', 'first_name', 'gender', 'last_name']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        db.collection('users').findOne({facebookID: profile.id}, function(err, user){
            if (err) return res.status(500).end(err);
            // If user does not exist
            if (!user){
                var newUser = {
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: (profile.emails) ? profile.emails[0].value : '',
                    facebookID: profile.id,
                    token:accessToken,
                    saltedHash: '',
                    salt: ''
                };
                db.collection('users').insert(newUser, function(err, result){
                    if (err) return console.log(err);
                });
            }
        });
      return done(null, profile);
    });
  }
));

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
        };
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
    return hash.digest('base64');
}
app.use(session({
    secret: 'I dont know what goes here',
    cookie: {
        secure: true, // Only send over https
        httpOnly: true, // Client side cannot access cookie
        sameSite: 'lax', // protect from CSRF request
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true,
}));

var isAuthenticated = function(req, res, next) {
    if (!req.username && !req.facebookID) return res.status(401).end("access denied");
    next();
};

var checkUsername = function(req,res,next){
    if(!validator.isAlphanumeric(req.body.username)) return res.status(400).end("bad input");
    next();
};

var checkUsernameParam = function(req,res,next){
	if(!validator.isAlphanumeric(req.params.username)) return res.status(400).end("bad input");
	next();
};


var sanitizeContent = function(req,res,next){
    req.body.content = validator.escape(req.body.content);
    next();
};

var checkId = function(req,res,next){
    if(!validator.isAlphanumeric(req.params.id)) return res.status(400).end("bad id");
    next();
};

var checkUserInfo = function(req,res,next){
    if(!validator.isAlphanumeric(req.body.firstName)) return res.status(400).end("bad input for first name");
    if(!validator.isAlphanumeric(req.body.lastName)) return res.status(400).end("bad input for last name");
    if(!validator.isEmail(req.body.email)) return res.status(400).end("bad email input");
    next();
};

app.use(function(req,res,next){
    var cookies = cookie.parse(req.headers.cookie || '');
    req.username = (req.session.username)? req.session.username:cookies.username;
    req.facebookID = (req.session.facebookID)? req.session.facebookID:cookies.facebookID;
    next();
});

// Serve frontend
app.use(express.static('frontend'));
app.use(bodyParser.json());


// -----------------------HTTP-----------------------------

// ################################# FILES ##################################
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
        res.set('Content-Type', files[0].contentType);
        return readstream.pipe(res);
    });
});

app.get('/file/', function(req, res, next){
     gfs.files.find({$or: [{'metadata.username': req.username}, {'metadata.username': null}]}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        return res.json(files);
     });
});

app.delete('/file/:filename', function(req, res, next){
    gfs.exist({filename: req.params.filename}, function(err, found){
        if (err) return res.status(400).end('file not found');
        gfs.remove({ filename: req.params.filename });
    });
});

// ################################# USERS ##################################

app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest'}));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/profile.html' }),
    function(req, res) {
        console.log(req.user);
        req.session.facebookID = req.user.id;
        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('facebookID', req.user.id, {
            path : '/',
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        }));
        res.redirect('/');
});

// Get user information
app.get('/users/info/', function(req, res, next){
    if (req.session.username) {
        db.collection('users').findOne({_id: req.session.username}, function(err, user){
            if (err) return res.status(500).end(JSON.stringify(err));
            if (!user) return res.status(404).end("User #" + req.session.username + " does not exists");
            return res.json(user);
        });
    } else if(req.session.facebookID)
        db.collection('users').findOne({facebookID: req.session.facebookID}, function(err, user){
            if (err) return res.status(500).end(JSON.stringify(err));
            if (!user) return res.status(404).end("Facebook User #" + req.session.facebookID + " does not exists");
            return res.json(user);
        });
});

// Update user info of current user logged in
app.put('/users/info/',checkUserInfo, function(req, res, next){
    var user = req.body;
    if(user.password) {
        var salt = crypto.randomBytes(16).toString('base64');
        var saltedHash = generateHash(user.password, salt);
        delete user.password;
        user.salt = salt;
        user.saltedHash = saltedHash;
    }
    if(req.session.facebookID) {
        db.collection('users').findOne({facebookID: req.session.facebookID}, function(err, facebookFound){
            if (err) return res.status(500).end(JSON.stringify(err));
            if (!facebookFound) return res.status(404).end("Facebook User #" + req.session.facebookID + " does not exists");
            //Do not want to update id so delete
            delete user._id;
            db.collection('users').update({facebookID: user.facebookID}, {$set: user} , function(err, result){
                if (err) return res.status(500).end(JSON.stringify(err));
                return res.json("User has been updated");
            });
        });
    }
    else if (req.session.username) {
        db.collection('users').findOne({_id: req.session.username}, function(err, found){
            if (err) return res.status(500).end(JSON.stringify(err));
            if (!found) return res.status(404).end("User #" + req.session.username + " does not exists");
            db.collection('users').update({_id: user._id}, {$set: user} , function(err, result){
                if (err) return res.status(500).end(JSON.stringify(err));
                return res.json("User has been updated");
            });
        });
    }
});

// Check whether password is equal to user password
app.post('/users/passCheck/', function(req, res, next){
    var password = req.body.password;
    db.collection('users').findOne({_id: req.session.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(404).end("User #" + req.session.username + " does not exists");
        var salt = user.salt;
        var currSaltedHash = user.saltedHash;
        var saltedHash = generateHash(password, salt);
        if (saltedHash === currSaltedHash)
            return res.json(true);
        else
            return res.json(false);
    });
});

app.post('/signup/',checkUsername, function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    db.collection('users').findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");

        var salt = crypto.randomBytes(16).toString('base64');
        var saltedHash = generateHash(password, salt);
        var newUser = {
            _id: username,
            firstName: '',
            lastName: '',
            email: '',
            saltedHash: saltedHash,
            salt: salt,
            facebookID: '',
            token:''
        };

        db.collection('users').insert(newUser, function(err, result){
            if (err) return console.log(err);
            req.session.username = newUser._id;
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                path : '/',
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            }));

            return res.json("user " + username + " signed up");
        });
    });
});

app.post('/signin/', checkUsername,function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // retrieve user from the database
    db.collection('users').findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        if (user.saltedHash !== generateHash(password, user.salt)) return res.status(401).end("access denied");
        // start a session
        //adding ._id because user var is a collection of info, we just want _id from it
        req.session.username = user._id;
        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
            path : '/',
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: 'lax'
        }));
        return res.json("user " + username + " signed in");
    });
});

app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', [cookie.serialize('facebookID', '', {
        path : '/',
        secure: true,
        sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }),cookie.serialize('username', '', {
        path : '/',
        secure: true,
        sameSite: 'lax',
     maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    })]);
    req.logout();
    res.redirect('/');
});

// ################################# BEATS ##################################

//save beat into db
app.post('/beat/',isAuthenticated,function(req,res,next){
    var beatSequence = req.body.beatSequence;
    var tempo = req.body.tempo;
    var publicBool = req.body.publicBool;
    var title = req.body.title;
    var desc = req.body.desc;
    var newBeat = {username:req.username, title:title, desc:desc, beatSequence:beatSequence, tempo:tempo, publicBool:publicBool, upvotes:0, dateCreated: new Date()};

    //maybe later on add a check to not allow duplicate beats?
    db.collection('beats').insert(newBeat, function(err,result){
        if(err) return res.status(500).end(err);
        else{
            return res.json(result);
        }
    });
});

//get beat id by owner
app.get('/beat/private/',isAuthenticated,function(req,res,next){
    var usersBeats = [];
    db.collection('beats').find({username:req.username, publicBool:false}).toArray(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("No private beats found for user");
        else{
            for(var i =0;i<result.length;i++){
                usersBeats.push([result[i]._id, result[i].title]);
            }
            return res.json(usersBeats);
        }
    });
});

//get all public beat
app.get('/beat/public/popular',isAuthenticated,function(req,res,next){
    var allBeats = [];
    db.collection('beats').find({publicBool:true},{username:1}).sort({upvotes:-1}).limit(24).toArray(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("No public beats found");
        else{
            return res.json(result);
            
        }
    });
}); 

//get beat by id
app.get('/beat/:id/',isAuthenticated,function(req,res,next){
    var ObjectId = require('mongodb').ObjectId;
    var id = req.params.id;
    var o_id = new ObjectId(id);
    db.collection('beats').findOne({_id:o_id},function(err,beat){
        if(err) return res.status(500).end(err);
        if(beat === null) return res.status(404).end("Beat with that id: "+req.params.id+" doesn't exist");
        else{
            return res.json(beat);
        }
    });
});



//delete beat by id
app.delete('/beat/:id/',checkId,isAuthenticated,function(req,res,next){
    var ObjectId = require('mongodb').ObjectId;
    var id = req.params.id;
    var o_id = new ObjectId(id);
    db.collection('beats').findOne({_id:o_id},function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("Beat id not found");
        else{
            db.collection('beats').remove({_id:result._id}, function(err,num){
                if(err) return res.status(500).end(err);
                else{
                    res.json(result);
                }
            });
        }
    });
});


app.patch('/beat/upvote/:id/',isAuthenticated,function(req,res,next){
    var ObjectId = require('mongodb').ObjectId;
    var id = req.params.id;
    var o_id = new ObjectId(id);
    db.collection('beats').update({_id:o_id},{$inc: {upvotes:1}}); 
});

// ################################# COMMENTS ##################################

//post a comment
//might need to add a createdAt field
app.post('/comment/',sanitizeContent,isAuthenticated,function(req,res,next){
    var username = req.session.username;
    var beatId = req.body.beatId;
    var content = req.body.content;
    var comment = {username:username,beatId:beatId,content:content};
    db.collection('comments').insert(comment,function(err,result){
        if(err) return res.status(500).end(err);
        else{
            return res.json(result);
        }
    });
});

//get comments for given beat id
//modify later to return based on timestamp
app.get('/comment/:id/',checkId,isAuthenticated,function(req,res,next){
    var comments = [];
    db.collection('comments').find({beatId:req.params.id}).toArray(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("no comments for this beat found");
        else{
            return res.json(result);
        }
    });
});

app.delete('/comment/:id/',checkId,isAuthenticated,function(req,res,next){
    var ObjectId = require('mongodb').ObjectId;
    var id = req.params.id;
    var o_id = new ObjectId(id);
    db.collection('comments').findOne({_id:o_id},function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("comment id not found");
        else{
            db.collection('comments').remove({_id:result._id}, function(err,num){
                if(err) return res.status(500).end(err);
                else{
                    res.json(result);
                }
            });
        }
    });
});

app.get('/', (req, res) => {
  var cursor = db.collection('users').find();
  console.log(cursor);
});

// --------------------------------------------------------

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
    next();
});



const http = require('http');
const PORT = process.env.PORT || 3000;


http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

