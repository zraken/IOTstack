const {
  getExternalVolume,
  getInternalVolume,
  replaceExternalVolume,
  getEnvironmentKey,
  getEnvironmentValue,
  replaceEnvironmentValue,
} = require('./dockerParse');


const setModifiedPorts = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  const modifiedPortList = Object.keys(serviceConfig?.ports ?? {});
  let updated = false;

  for (let i = 0; i < modifiedPortList.length; i++) {
    (serviceTemplate?.ports ?? []).forEach((port, index) => {
      if (port === modifiedPortList[i]) {
        if (serviceTemplate.ports[index] !== serviceConfig.ports[modifiedPortList[i]]) {
          updated = true;
        }
        serviceTemplate.ports[index] = serviceConfig.ports[modifiedPortList[i]];
      }
    });
  }

  return updated;
};

const setLoggingState = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  if (serviceConfig?.loggingEnabled === false) {
    if (serviceTemplate.logging) {
      delete serviceTemplate?.logging;
      return true;
    }
    return false;
  }

  return true;
};

const setNetworkMode = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  if (serviceConfig?.networkMode) {
    if (
      serviceTemplate['network_mode'] !== serviceConfig.networkMode
      && serviceConfig.networkMode !== 'Unchanged'
      && serviceConfig.networkMode !== ''
    ) {
      serviceTemplate['network_mode'] = serviceConfig.networkMode;
      return true;
    }
  }

  return false;
};

const setNetworks = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  Object.keys(serviceConfig?.networks ?? {}).forEach((network) => {
    serviceTemplate.networks = [];
    if (serviceConfig.networks[network] === true) {
      serviceTemplate.networks.push(network);
    }
    updated = true;
  });

  return updated;
};

const setVolumes = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  if (Array.isArray(serviceConfig?.volumes ?? false)) {
    serviceConfig.volumes.forEach((configVolume, volumeIndex) => {
      const configInternalVolume = getInternalVolume(configVolume);
      let found = false;
      for (let i = 0; i < (serviceTemplate?.volumes ?? []).length; i++) {
        const templateInternalVolume = getInternalVolume(serviceTemplate.volumes[i]);
  
        if (templateInternalVolume === configInternalVolume) {
          const configExternalVolume = getExternalVolume(configVolume);
          if (configExternalVolume === '') {
            serviceTemplate.volumes.splice(i, 1);
          } else {
            serviceTemplate.volumes[i] = replaceExternalVolume(configVolume, configExternalVolume);
          }
          updated = true;
          found = true;
          break;
        }
      }

      if (!found) {
        serviceTemplate.volumes[i].push(configVolume);
      }
    });
  }

  return updated;
};

const setEnvironmentVariables = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  if (Array.isArray(serviceConfig?.environment ?? false)) {
    serviceConfig.environment.forEach((configEnvironment, environmenteIndex) => {
      const configEnvironmentKey = getEnvironmentKey(configEnvironment);
      let found = false;
      for (let i = 0; i < (serviceTemplate?.environment ?? []).length; i++) {
        const templateEnvironmentKey = getEnvironmentKey(serviceTemplate.environment[i]);

        if (templateEnvironmentKey === configEnvironmentKey) {
          const newEnvironmentValue = getEnvironmentValue(configEnvironment);
          if (newEnvironmentValue === '') {
            serviceTemplate.environment.splice(i, 1);
          } else {
            serviceTemplate.environment[i] = replaceEnvironmentValue(configEnvironment, newEnvironmentValue);
          }
          updated = true;
          found = true;
          break;
        }
      }

      if (!found) {
        serviceTemplate.environment[i].push(configEnvironment);
      }
    });
  }

  return updated;
};

module.exports = {
  setModifiedPorts,
  setLoggingState,
  setNetworkMode,
  setNetworks,
  setVolumes,
  setEnvironmentVariables
};