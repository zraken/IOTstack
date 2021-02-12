const BootstrapScript = ({
  req,
  scriptName,
  options,
  server,
  settings,
  version,
  logger
}) => {
  return new Promise((resolve, reject) => {
    try {
      const result = {
        filename: 'scripts',
        data: 'No Data'
      };
      
      if (!options) {
        result.data = 'No options given';
      }
      result.data = `Options given for ${scriptName} and ${options?.build}`;

      result.data = `
# Download, extract and execute:
# Ensure you are in IOTstack's main directory.
$ curl http://${req.get('host')}/build/get/${options?.build}/zip \\
--output iotstack_build_${options?.build}.zip \\
&& unzip -o ./iotstack_build_${options?.build}.zip \\
&& bash installer.sh --from-net --overwrite
`;

      return resolve(result);
    } catch (err) {
      console.error(err);
      console.trace();
      console.trace();
      console.debug("\nParams:");
      console.debug({ scriptName });
      console.debug({ version });
      console.debug({ options });
      return reject({
        component: `BootstrapScript: - '${scriptName}'`,
        message: 'Unhandled error occured',
        error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
      });
    }
  });
};

module.exports = BootstrapScript;