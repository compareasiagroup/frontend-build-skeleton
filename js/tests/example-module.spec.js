// Loading dependencies.
var exampleModule = require('../src/module');

describe('Example tests', function() {

    beforeEach(function() {
    });

    afterEach(function() {
    });

    it('should have keys', function() {
        expect(exampleModule).to.be.a('object');
        expect(Object.keys(exampleModule).length).to.be.at.least(1);
    });

});