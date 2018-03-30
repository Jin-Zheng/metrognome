(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        
        function submit(){
            console.log(document.querySelector("form").checkValidity());
            if (document.querySelector("form").checkValidity()){
                var username = document.querySelector("form [name=username]").value;
                var password =document.querySelector("form [name=password]").value;
                var action =document.querySelector("form [name=action]").value;
                api[action](username, password, function(err, res){
                    if (err) {
                        if (err.substring(1,4) === '401')
                            document.querySelector('.alert').innerHTML = "Invalid username or password";
                        else if(err.substring(1,4) === '409')
                            document.querySelector('.alert').innerHTML = "Username already exist";
                        else if(err.substring(1,4) === '400')
                            document.querySelector('.alert').innerHTML = "Username can only contain alphabet and interger characters";
                        else
                            document.querySelector('.alert').innerHTML = err;
                    }
                    else if(window.location.protocol + window.location.host + "/" + "profile.html" === window.location.href)
                        window.location = window.location.href;
                    else window.location = '';
                });
            }
        }
        
        document.querySelector('#signin').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signin';
            submit();
        });
        
        document.querySelector('#signup').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signup';
            submit();
        });
        
        document.querySelector('form').addEventListener('submit', function(e){
            e.preventDefault();
        });
    });
}());


