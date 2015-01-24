
var plugin = {
  configure: function(options, config, program) {
    if (program.command) {
      program
        .command('put command here')
        .description('describe command here')
        .action(function(){

        });
    }
  },
  onExit: function(options, config, callback) {
    callback();
  }
};

module.exports = plugin;
