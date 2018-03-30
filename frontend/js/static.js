// jshint esversion: 6
(function(){
    "use strict";
    window.addEventListener('load', function(){
        if (api.getCookie("facebookID") || api.getCookie("username")){
            document.querySelector('#signout_button').classList.remove("d-none");
            document.querySelector('#profileLink').classList.remove("d-none");
            document.querySelector('#signin_button').classList.add("d-none");
            document.querySelector('#popularbeatsLink').classList.remove("d-none");
        } else{
            document.querySelector('#signout_button').classList.add("d-none");
            document.querySelector('#profileLink').classList.add("d-none");
            document.querySelector('#signin_button').classList.remove("d-none");
            document.querySelector('#popularbeatsLink').classList.add("d-none");

        }
    });
})();
