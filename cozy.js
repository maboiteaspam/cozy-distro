
var npmHelper = require('npm-manifest-helper')();

var plugin = {
  configure: function(options, config, program, cozyLight) {
    if (program.command) {

      var logger = cozyLight.logger;
      var actions = cozyLight.actions;

      program
        .command('display <distroname>')
        .description('Displays given distro plugins and apps.')
        .action(function(distroname){

          npmHelper.fetchManifest({}, distroname, function(err, manifest){
            if (err) {
              logger.error('Distro not found !');
            } else {

              logger.info('Found distro: ' + distroname);

              if (manifest['distro'] !== undefined) {
                var logAttributeList = function (key) {
                  logger.info('    ' + key + ':');
                  var list = manifest['distro'][key];
                  if (list !== undefined && Object.keys(list).length > 0) {
                    Object.keys(list).forEach(function displayListElement (keyName) {
                      logger.info('        - ' + (keyName.split('/')[1] || keyName) );
                    });
                  } else {
                    logger.warn('        no ' + key);

                    console.log('        no ' + key);
                  }
                };

                logAttributeList('plugins');
                logAttributeList('apps');
              } else {
                logger.warn('Distro does not have dependencies');
              }

            }
          });
        });

      program
        .command('install <distroname>')
        .description('Installs given distro plugins and apps.')
        .action(function(distroname){

          npmHelper.fetchManifest({}, distroname, function(err, manifest){
            if (err) {
              logger.error('Distro not found !');
            } else {

              logger.info('Found distro: ' + manifest.name + '@' + manifest.version);

              if (manifest['distro'] !== undefined) {
                var distro = manifest['distro'];
                logger.info('Installing plugins...');
                async.eachSeries(distro.plugins, function addPlugin (pluginName, cb) {
                  actions.installPlugin(pluginName, cb);
                }, function installApps (err) {
                  if (err) {
                    logger.error(err);
                    logger.raw(err.stack);
                  } else {
                    logger.info('Installing apps...');
                    async.eachSeries(distro.apps,
                      function addApp (appName, cb) {
                      actions.installApp(appName, cb);
                    },
                    function updateConfig (){
                      config.distros[manifest.name] = {
                        date:(new Date())
                      };
                      cozyLight.configHelperss.saveConfig();
                    });
                  }
                });
              } else {
                logger.warn('Distro does not have dependencies');
              }
            }
          });
        });

      program
        .command('remove <distroname>')
        .description('Removes given distro plugins and apps.')
        .action(function(distroname){

          npmHelper.fetchManifest({}, distroname, function(err, manifest, type){
            if (err) {
              logger.error('Distro not found !');
            } else {

              logger.info('Found distro: ' + manifest.name + '@' + manifest.version);

              if (manifest['distro'] !== undefined) {
                var distro = manifest['distro'];
                logger.info('Removing plugins...');
                async.eachSeries(distro.plugins, function removePlugin (pluginName, cb) {
                  actions.uninstallPlugin(pluginName, cb);
                }, function installApps (err) {
                  if (err) {
                    logger.error(err);
                    logger.raw(err.stack);
                  } else {
                    logger.info('Removing apps...');
                    async.eachSeries(distro.apps,
                      function removeApp (appName, cb) {
                        actions.uninstallApp(appName, cb);
                      },
                      function updateConfg(){
                        delete config.distros[manifest.name];
                        cozyLight.configHelperss.saveConfig();
                      });
                  }
                });
              } else {
                logger.warn('Distro does not have dependencies');
              }
            }
          });
        });



    }
  }
};

module.exports = plugin;
