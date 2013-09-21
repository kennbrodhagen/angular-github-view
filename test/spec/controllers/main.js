describe('Service: angularRepo', function() {
    beforeEach(function() {
        module('githubViewApp');
    });

    it('* Fetches the content of the repo from a particular url and returns it as a promise', function() {
        // I like inject to be broken out so it's easier to 
        // move around if we need to.
        inject(function($httpBackend, angularRepo) {
            // Declare the test content we will mock deliver
            // and expect to see.
            var EXPECTED_CONTENT = [
                    {name:'foo', type:'file'}, 
                    {name:'bar', type:'dir'}];

            // Tell the mock http to expect this URL to be called.
            // Have it respond with our test content.
            $httpBackend.expectGET(
                'https://api.github.com/repos/angular/angular.js/contents/')
                .respond(200, EXPECTED_CONTENT);

            // Perform the operation we are testing.
            angularRepo.content().then(function(content) {
                contentProvided = content;
            });

            // Trigger the async http response to fire and
            // call our callback.
            $httpBackend.flush();

            // Assert our expectation that we saw the content
            // we had the http provide.
            expect(contentProvided).toEqual(EXPECTED_CONTENT);
        });
    });
});

describe('Controller: AngularRepoCtrl', function () {
    'use strict';

    // load the controller's module
    beforeEach(module('githubViewApp'));

    var EXPECTED_CONTENT = [{name:'EXPECTED_CONTENT'}];
    var AngularRepoCtrl,
    mockAngularRepo,
    scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        // Create a new scope object to inject.
        // Controllers need a specially created scope with all
        // the extra methods available
        scope = $rootScope.$new();

        // Setup a mock angularRepo service
        mockAngularRepo = jasmine.createSpyObj('angularRepo', ['content']);
        mockAngularRepo.content.andReturn(EXPECTED_CONTENT);

        // Inject our mock into the controller via the options
        // hash
        AngularRepoCtrl = $controller('AngularRepoCtrl', {
            $scope: scope,
            angularRepo: mockAngularRepo
        });
    }));

    it('should populate the repoContent collection', function () {
        expect(scope.repoContent).toBe(EXPECTED_CONTENT);
    });

    it('should provide an action to choose a dir type item to open', function() {
        mockAngularRepo.content.reset();
        scope.chooseContent(scope.repoContent[0]);
        expect(mockAngularRepo.content)
            .toHaveBeenCalledWith(scope.repoContent[0].name);
    });
});
