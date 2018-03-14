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


app.use(function(req,res,next){
    var cookies = cookie.parse(req.headers.cookie || '');
    req.username = (req.session.username)? req.session.username:null;
    next();
})


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

// ################################# USERS ##################################

// Get user information
app.get('/users/info/:username', function(req, res, next){
    db.collection('users').findOne({_id: req.params.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(404).end("User #" + req.params.username + " does not exists");
        return res.json(user);
    });
})

// Update user info
app.put('/users/info/', function(req, res, next){
    var user = req.body;
    if(user.password) {
        var salt = crypto.randomBytes(16).toString('base64');
        var saltedHash = generateHash(user.password, salt);
        delete user['password'];
        user.salt = salt;
        user.saltedHash = saltedHash;
    }
    db.collection('users').findOne({_id: user._id}, function(err, found){
        if (err) return res.status(500).end(err);
        if (!found) return res.status(404).end("User #" + user._id + " does not exists");
        db.collection('users').update({_id: user._id}, {$set: user} , function(err, result){
            if (err) return res.status(500).end(err);
            return res.json("User has been updated");
        });
    });
})

// Check whether password is equal to user password
app.post('/users/passCheck/:username', function(req, res, next){
    var password = req.body.password;
    db.collection('users').findOne({_id: req.params.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(404).end("User #" + req.params.username + " does not exists");
        var salt = user.salt;
        var currSaltedHash = user.saltedHash;
        var saltedHash = generateHash(password, salt);
        if (saltedHash === currSaltedHash)
            return res.json(true);
        else
            return res.json(false);
    });
})

app.post('/signup/', function(req, res, next) {
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
            salt: salt
        };

        db.collection('users').insert(newUser, function(err, result){
            if (err) return console.log(err);
            req.session.username = newUser;
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
        //adding ._id because user var is a collection of info, we just want _id from it
        req.session.username = user._id;
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

// ################################# BEATS ##################################

//save beat into db
app.post('/beat/',isAuthenticated,function(req,res,next){
    var beatSequence = req.body.beatSequence;
    var tempo = req.body.tempo;
    var public = req.body.public;
    var newBeat = {username:req.session.username,beatSequence:beatSequence,tempo:tempo,public:public,upvotes:0, dateCreated: new Date()};

    //maybe later on add a check to not allow duplicate beats?
    db.collection('beats').insert(newBeat, function(err,result){
        if(err) return res.status(500).end(err);
        else{
            return res.json(result);
        }
    });
});

//get beat by id
app.get('/beat/:id',isAuthenticated,function(req,res,next){
    db.collection('beats').findOne({_id:req.param.id},function(err,beat){
        if(err) return res.status(500).end(err);
        if(beat === null) return res.status(404).end("No beat with that id exists");
        else{
            return res.json(beat);
        }
    });
});

//get beat id by owner
app.get('/beat/private/',isAuthenticated,function(req,res,next){
    var usersBeats = [];
    db.collection('beats').find({username:req.session.username,public:false}).exec(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("No private beats found for user");
        else{
            for(var i =0;i<result.length;i++){
                usersBeats.push(result[i]._id);
            }
            return res.json(usersBeats);
        }
    });
});

//get all public beat ids
app.get('/beat/public/',isAuthenticated,function(req,res,next){
    var allBeats = [];
    db.collection('beats').find({public:true}).sort({upvotes:1}).exec(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("No public beats found");
        else{
            for(var i=0;i<result.length;i++){
                allBeats.push(result[i]._id);
            }
            return res.json(allBeats);
        }
    });
});

//delete beat by id
app.delete('/beat/:id/',isAuthenticated,function(req,res,next){
    db.collection('beats').findOne({_id:req.params.id},function(err,result){
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

// ################################# COMMENTS ##################################

//post a comment
//might need to add a createdAt field
app.post('/comment/',isAuthenticated,function(req,res,next){
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
app.get('/comment/:id/',isAuthenticated,function(req,res,next){
    var comments = []
    db.collection('comments').find({beatId:req.params.id}).exec(function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("no comments for this beat found");
        else{
            if(!req.query.offset) req.query.offset=0;
            //return only 10 comments at most;
            return res.json(result.splice(req.query.offset,req.query.offset+10));
        }
    });
});

app.delete('/comment/:id/',isAuthenticated,function(req,res,next){
    db.collection('comments').findOne({_id:req.params.id},function(err,result){
        if(err) return res.status(500).end(err);
        if(result === null) return res.status(404).end("comment id not found");
        else{
            db.collection('comments').remove({_id:result._id}, function(err,num){
                if(err) return res.status(500).end(err);
                else{
                    res.json(result);
                }
            })
        }
    })
})

app.get('/', (req, res) => {
  var cursor = db.collection('users').find();
  console.log(cursor);
})

// --------------------------------------------------------

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
