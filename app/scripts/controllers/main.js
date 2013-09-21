'use strict';

angular.module('githubViewApp')
    .factory('angularRepo', ['$http', function($http) {
        return {
            content: function() {
                return $http
                    .get('https://api.github.com/repos/angular/angular.js/contents/')
                    .then(function(response) {
                        return response.data;
                    });
            }
        };
    }])
    .controller('AngularRepoCtrl', ['$scope', 'angularRepo', 
        function ($scope, angularRepo) {

        $scope.chooseContent = function(item) {
            var name = !!item ? item.name : null;
            $scope.repoContent = angularRepo.content(name);
        };

        $scope.chooseContent();
    }]);
