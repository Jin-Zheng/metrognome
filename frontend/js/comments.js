var app = angular.module("popComment", []);

app.controller("CommentController", function($scope, $location) {

    var beatId = $location.absUrl().split('?id=')[1];
    api.getComment(beatId,function(err, data){
        if(err) console.log(err);
        else{
            $scope.$apply(function(){
                $scope.comments = data;
                $scope.filteredComments = [];
                $scope.currentPage = 1
                $scope.numPerPage = 10
                $scope.firstPage = true
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
                }
            
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
                    };
                };

                $scope.disableButtons = function() {
                    var numOfPages =  Math.ceil($scope.comments.length / $scope.numPerPage);
                    $scope.firstPage = $scope.currentPage == 1;
                    $scope.lastPage = $scope.currentPage == numOfPages;
                }
            
                $scope.goBack = function() {
                    $scope.currentPage = $scope.currentPage - 1;
                   
                };
            
                $scope.goForward = function() {
                    $scope.currentPage = $scope.currentPage + 1;
                    
                }
            
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

                $scope.$watch('currentPage + numPerPage + comments', function() {
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                    , end = begin + $scope.numPerPage;
                    
                    $scope.disableButtons();
                    $scope.filteredComments = $scope.comments.slice(begin,end);
                });
            });

        }
    });
});
        