
var printit = require('printit');

var options = {};
var config = {};
var program = require('commander');

var cozyLight = {
  logger: printit({ prefix: 'Cozy Light' })
};

var cozyHandler = require('./cozy');
cozyHandler.configure(options, config, program, cozyLight);

program.parse(process.argv);
