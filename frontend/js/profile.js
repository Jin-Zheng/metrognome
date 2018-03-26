// jshint esversion: 6
(function(){
    "use strict";
    var app = angular.module("profileApp", []);
    app.controller('profileCtrl', ['$scope', function($scope) {
        // If user is not signed in don't show any user profile
        if (!api.getCookie("username") && !api.getCookie("facebookID")){
            $scope.notLoggedInProfile = true;
        } else{
            $scope.showProfile = true;
            $scope.showSuccessfulUpdate = false;
        }
        // Get the user information to populate profile page
        // Only run if there is a user logged in
        if (api.getCookie("username") || api.getCookie("facebookID")) {
            api.getUserInfo(api.getCookie("username"), api.getCookie("facebookID"), function(err, user){
                if (err) console.log(err);
                //Update scope with user information
                if(user) {
                    $scope.$apply(function(){
                        $scope._id = user._id;
                        $scope.oldpass = '';
                        $scope.pass1 = '';
                        $scope.pass2 = '';
                        $scope.email = (user.email) ? user.email : '';
                        $scope.firstName = (user.firstName) ? user.firstName : '';
                        $scope.lastName = (user.lastName) ? user.lastName : '';
                        $scope.emailPlaceholder = (user.email) ? user.email : 'Enter email here';
                        $scope.firstNamePlaceholder = (user.firstName) ? user.firstName : 'Enter first name here';
                        $scope.lastNamePlaceholder = (user.lastName) ? user.lastName : 'Enter last name here';
                        $scope.facebookID = api.getCookie("facebookID");
                    });
                }
            });
        }
        // When the user hit's submit, check form and update
        $scope.updateInfo = function() {
            var user = {
                _id: $scope._id,
                facebookID: $scope.facebookID,
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                email : $scope.email
            };
            // If user want's to change password check if the old password is correct
            if ($scope.pass1 !== '' && $scope.oldpass !== '' && $scope.pass1 && $scope.oldpass) {
                api.checkPassword($scope._id, $scope.oldpass, function(err, correctPass){
                    // Update if user has entered the correct password
                    if(correctPass) {
                        user.password = $scope.pass1;
                        api.updateUserInfo(user, function(err, user){
                            if (err) console.log(err);
                            else {
                                $scope.$apply(function(){
                                    $scope.showProfile = false;
                                    $scope.showSuccessfulUpdate = true;

                                });
                            }
                        });
                    } else {
                        // Show warning message if user has entered the wrong password
                        $scope.$apply(function(){
                            $scope.wrongPass = true;
                        });
                    }
                });
            // For all other updates that aren't password related
            } else {
                api.updateUserInfo(user, function(err, user){
                    if (err) console.log(err);
                    else {
                        $scope.$apply(function(){
                            $scope.showProfile = false;
                            $scope.showSuccessfulUpdate = true;
                        });
                    }
                });
            }
        };
    // Load profile template
    }]).directive("profileDirective", function() {
        return {
            restrict: 'A',
            templateUrl: '/templateHTML/my-profile.html',
        };
    });
    // Directive to check if user has entered the same 'new password' and 'confirmed password'
    app.directive("passCheck", function() {
        function linkFunction(scope, elem, attr, ctrl) {
            // Watch pass1 and pass2 and check when they change
            scope.$watchGroup(['pass1', 'pass2','oldpass'], function(newValues, oldValues, scope) {
                ctrl.$setValidity("same", newValues[0] == newValues[1]);
                var allEmpty = (newValues[0] === '' && newValues[1] === ''&& newValues[2] === '');
                var oldPasswordSet = newValues[2] !== '';
                ctrl.$setValidity("empty", allEmpty || oldPasswordSet);
                var noNewPassword = (newValues[0] === '' && newValues[1] === ''&& newValues[2] !== '');
                var atLeastOneNewPass = (newValues[0] !== '' || newValues[1] !== '');
                ctrl.$setValidity("newPassword", (!noNewPassword || allEmpty || atLeastOneNewPass));
            });
        }
        return {
            require: 'ngModel',
            link: linkFunction
        };
    });

})();