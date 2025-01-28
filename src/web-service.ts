import * as docker from '@pulumi/docker';

interface WebServiceOpts {
  provider: docker.Provider;
  serviceName: string;
  containerName?: string;
  imageName: string;
  hostname: string;
  internalPort?: number;
  extraArgs?: any;
}

export const makeWebService = (opts: WebServiceOpts) => {
  const {
    provider,
    hostname,
    imageName,
    serviceName,
    containerName = serviceName,
    internalPort = 80,
    extraArgs = {},
  } = opts;

  const image = new docker.RemoteImage(serviceName, { name: imageName }, { provider });
  const container = new docker.Container(serviceName, {
    image: image.imageId,
    name: containerName,
    ports: [{
      internal: internalPort,
    }],
    labels: [
      {
        label: "traefik.enable",
        value: "true",
      },
      {
        label: `traefik.http.routers.${containerName}.rule`,
        value: `Host(\`${hostname}\`)`,
      },
      {
        label: `traefik.http.routers.${containerName}.entrypoints`,
        value: "websecure",
      },
      // // DEBUG
      // {
      //   label: `traefik.http.routers.${containerName}.tls.certresolver`,
      //   value: "stagingresolver",
      // },
      {
        label: `traefik.http.routers.${containerName}.tls.certresolver`,
        value: "prodresolver",
      },
    ],
    ...extraArgs,
  }, { provider });

  return { container };
};