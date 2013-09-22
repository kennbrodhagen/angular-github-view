describe('Service: angularRepo', function() {
    'use strict';


    var $httpBackend;
    var angularRepo;
    var promises;

    // Helper function to wrap the logic of testing that raw
    // api content has been transformed to item objects
    // correctly.  For now we test the array sizes match and
    // that the the first item has a contents function.
    var assertContentMatches = function(provided, expected) {
        expect(provided.length).toEqual(expected.length);
        expect(provided[0].contents().then).toBeDefined();
    };

    // before each service test we will initialize the module
    // and capture our injected dependencies.
    beforeEach(function() {
        module('githubViewApp');
        inject(function(_$httpBackend_, $rootScope, _angularRepo_) {
            $httpBackend = _$httpBackend_;
            angularRepo = _angularRepo_;
            promises = $rootScope;
        });
    });

    it('* provides a root node of content for the repo.', function() {
        // Tell the mock http to expect this URL to be called.
        // Have it respond with our test content.
        var EXPECTED_CONTENT = [
                {name:'foo', type:'file'},
                {name:'bar', type:'dir'}];
        $httpBackend.expectGET(
            angularRepo.REPO_ROOT)
            .respond(200, EXPECTED_CONTENT);

        // Perform the operation we are testing.
        var contentProvided;
        angularRepo.rootItem().contents().then(function(content) {
            contentProvided = content;
        });

        // Trigger the async http response to fire and
        // call our callback.
        $httpBackend.flush();

        // Assert our expectation that we saw the content
        // we had the http provide.
        assertContentMatches(contentProvided, EXPECTED_CONTENT);
    });

    describe('* repo contains file and dir type items', function() {
        describe('* file type item', function() {
            var FILE_RESPONSE = {
                name: 'item_name',
                type: 'file'
            };
            var item;

            beforeEach(function() {
                item = angularRepo.createItem(FILE_RESPONSE);
            });


            it('* has name, type, and contents', function() {
                expect(item.name).toEqual(FILE_RESPONSE.name);
                expect(item.type).toEqual(FILE_RESPONSE.type);
                expect(item.contents).toBeDefined();
            });

            it('* contents returns a promise to empty array', function() {
                var callback = jasmine.createSpy('callback');
                item.contents().then(callback);
                promises.$apply();
                expect(callback).toHaveBeenCalledWith([]);
            });

        });

        describe('* dir type item', function() {
            var DIR_RESPONSE = {
                name: 'item_name',
                type: 'dir',
                url: 'http://item.response.url/'
            };
            var CONTENT_RESPONSE = [
                {name: 'file1', type:'file'},
                {name: 'dir1', type:'dir', url:'/dir1'}
            ];

            var item;

            it('* calls the api to get contents list', function() {
                item = angularRepo.createItem(DIR_RESPONSE);

                $httpBackend
                    .expectGET(DIR_RESPONSE.url)
                    .respond(200, CONTENT_RESPONSE);
                var actualContents;
                item.contents().then(function(contents) {
                    actualContents = contents;
                });
                $httpBackend.flush();

                assertContentMatches(actualContents, CONTENT_RESPONSE);
            });
        });

    });

});

describe('Controller: AngularRepoCtrl', function () {
    'use strict';

    var ITEM_CONTENTS = [
        {name: 'foo', type:'file'},
        {name: 'bar', type:'dir'}
    ];
    var ROOT_CONTENTS = [
        {name: 'item', contents: jasmine.createSpy('contents')
            .andReturn(ITEM_CONTENTS)}];

    var AngularRepoCtrl,
    mockAngularRepo,
    scope;

    // load the controller's module
    beforeEach(module('githubViewApp'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        // Create a new scope object to inject.
        // Controllers need a specially created scope with all
        // the extra methods available
        scope = $rootScope.$new();

        // Setup a mock angularRepo service
        mockAngularRepo = jasmine.createSpyObj('angularRepo', ['rootItem']);
        mockAngularRepo.rootItem.andReturn({
            contents: function() {
                return ROOT_CONTENTS;
            }
        });

        // Inject our mock into the controller via the options
        // hash
        AngularRepoCtrl = $controller('AngularRepoCtrl', {
            $scope: scope,
            angularRepo: mockAngularRepo
        });
    }));

    it('should populate repoContent with root contents', function () {
        expect(scope.repoContent).toBe(ROOT_CONTENTS);
    });

    it('should provide an action to choose a dir type item to open', function() {
        var item = scope.repoContent[0];
        scope.viewContent(item);

        expect(item.contents).toHaveBeenCalled();
        expect(scope.repoContent).toBe(ITEM_CONTENTS);
    });
});

describe('* Directive', function() {
    'use strict';

    var FILE_ITEM = {name: 'file-item', type: 'file'};
    var DIR_ITEM = {name: 'dir-item', type: 'dir'};

    var directive;
    var scope;
    // load the controller's module
    beforeEach(module('githubViewApp'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($compile, $rootScope) {
        // A directive is compiled from template html 
        // and linked to a scope
        var html = '<github-content-item item="item" action="action"/>';
        scope = $rootScope.$new();
        scope.item = FILE_ITEM;
        scope.action = jasmine.createSpy('action');

        directive = $compile(html)(scope);
        directive.scope().$digest();

        /*
        directive = angular.element(html);
        var compiled = $compile(directive);

        compiled(scope);
        scope.$digest();
        */
    }));

    it('* tests something', function() {
        expect(directive.find('a').text())
            .toEqual(FILE_ITEM.name);
    });


});
