var api = (function(){
    function sendFiles(method, url, data, callback){
        var formdata = new FormData();
        Object.keys(data).forEach(function(key){
            var value = data[key];
            formdata.append(key, value);
        });
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) return callback("[" + xhr.status + "]" + xhr.responseText, null);
            return callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    // Code taken from https://www.w3schools.com/js/js_cookies.asp
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var module = {};

    module.signin = function (username, password, callback){
        send("POST", "/signin/", {username: username, password: password}, callback);
    };
    module.signup = function (username, password, callback){
        send("POST", "/signup/", {username: username, password: password}, callback);
    };

    module.upload = function(title, file, callback){
        sendFiles('post', '/file/', {title, 'file': file}, callback);
    };

    module.getCurrentUser = function(){
        var l = document.cookie.split("username=");
        if (l.length > 1) return l[1];
        return null;
    };

    module.getFiles = function(callback){
        send('get', '/file/', null, callback);
    };

    module.deleteFile = function(filename, callback){
        send('delete', '/file/' + filename, null, callback);
    };

    //beat is set to public
    module.postBeat = function(beatSequence,tempo,callback){
        send("POST", '/beat/',{beatSequence:beatSequence, tempo:tempo, public:true}, callback);
    }

    //beat is only viewable to user
    module.saveBeat = function(beatSequence,tempo,callback){
        send("POST", '/beat/',{beatSequence:beatSequence, tempo:tempo, public:false}, callback);
    }

    //get beats by provided id
    module.getBeat = function(beatId,callback){
        send("GET","/beat/"+beatId+"/",null,callback);
    }

    //use for profile page
    module.getPrivateBeatsId = function(callback){
        send("GET","/beat/private/",null,callback);
    }

    //will be used for popular beats page
    module.getPublicBeatsId = function(callback){
        send("GET","/beat/public/",null,callback);
    }

    module.deleteBeat = function(beatId, callback){
        send("DELETE","/beat/"+beatId+"/", null,callback);
    }

    module.addComment = function(beatId,content,callback){
        send("POST", "/comment/", {beatId:beatId,content:content});
    }

    module.getComment = function(beatId,offset,callback){
        send("GET","/comment/"+beatId+"/?offset="+offset,null,callback);
    }

    module.deleteComment = function(commentId, callback){
        send("DELETE","/comment/"+commentId+"/",null,callback);
    }

    module.getUserInfo = function(username, callback){
        send("GET", "/api/info/" + username + "/",null , callback);
    };
    module.updateUserInfo = function(userInfo, callback){
        send("PUT", "/api/info/", userInfo , callback);
    };
    module.checkPassword = function(userID, password, callback){
        send("POST", "/api/passCheck/" + userID + "/", {password:password} , callback);
    };
    return module;
})();