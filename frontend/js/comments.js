//// jshint esversion: 6
var app = angular.module("popComment", []);

app.controller("CommentController", function($scope, $location) {

    var beatId = $location.absUrl().split('?id=')[1];
    if ((api.getCookie("facebookID") !== null && api.getCookie("facebookID") !== '' || (api.getCookie("username") !== null && api.getCookie("username") !== ''))){
        $scope.loggedin = true;
        api.getComment(beatId,function(err, data){
            if(err) console.log(err);
            else{
                $scope.$apply(function(){
                    $scope.comments = data;
                    $scope.filteredComments = [];
                    $scope.currentPage = 1;
                    $scope.numPerPage = 10;
                    $scope.firstPage = true;
                    $scope.lastPage = false;
                                
                
                    $scope.deleteAccess = function(username) {
                        var user = "";
                        if ((api.getCookie("facebookID") !== null && api.getCookie("facebookID") !== '')){
                            user = api.getCookie("facebookID");
                        }else{
                            if((api.getCookie("username") !== null && api.getCookie("username") !== '')){
                                user = api.getCookie("username");
                            }
                        }
                        return  user == username ? true : false;
                    };
                
                    //take in what user writes for comments
                    $scope.submit = function(){
                        if($scope.commentSubmit){
                            api.addComment(beatId, $scope.commentSubmit, function(err, result){
                                if(err) console.log(err);
                                else{
                                    api.getComment(beatId,function(err, data){
                                        if(err) console.log(err);
                                        else{
                                            $scope.$apply(function(){
                                                $scope.comments = data;
                                            });
                                        }
                                    });
                                }
                            });
                            $scope.commentSubmit='';
                        }
                    };

                    //disable buttons for navigation
                    $scope.disableButtons = function() {
                        var numOfPages =  Math.ceil($scope.comments.length / $scope.numPerPage);
                        $scope.firstPage = $scope.currentPage == 1;
                        $scope.lastPage = $scope.currentPage == numOfPages;
                    };
                    //nav button back
                    $scope.goBack = function() {
                        $scope.currentPage = $scope.currentPage - 1;
                    
                    };
                    //nav button forward
                    $scope.goForward = function() {
                        $scope.currentPage = $scope.currentPage + 1;
                        
                    };
                    //using this to delete comments
                    $scope.deleteComment = function(id){
                        api.deleteComment(id, function(err,data){
                            if(err) console.log(err);
                            else{
                                var elmt = document.getElementById(id);
                                elmt.parentNode.parentNode.removeChild(elmt.parentNode);
                                api.getComment(beatId,function(err, data){
                                    if(err) console.log(err);
                                    else{
                                        $scope.$apply(function(){
                                            $scope.comments = data;
                                        });
                                    }
                                });
                            }
                        });
                    };
                    //list of variables that being watched and updating page based on it
                    $scope.$watch('currentPage + numPerPage + comments', function() {
                        var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                        var end = begin + $scope.numPerPage;
                        
                        $scope.disableButtons();
                        $scope.filteredComments = $scope.comments.slice(begin,end);
                    });
                });

            }
        });
    }
    else{
        $scope.loggedin = false;
    }
});
        