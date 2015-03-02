console.info('Logging from inside main.js');

// Including additional module.
var myModule = require('./module');

try {
    var _ = require('underscore');
} catch(e) {}

console.log('This should be undefined or null', _);