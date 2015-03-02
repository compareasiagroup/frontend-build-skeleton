console.info('Logging from inside module.js');

// Demonstrating templating.
window.addEventListener('DOMContentLoaded', function() {
    var exampleTemplate = require('./templates/module.hbs');
    document.querySelector('body').innerHTML = exampleTemplate();
});

// Example output for the test suite.
module.exports = {
    hello: 'world'
};