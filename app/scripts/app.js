'use strict';

angular.module('githubViewApp', [])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'AngularRepoCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
