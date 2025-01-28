import * as docker from '@pulumi/docker';

interface BaseOpts {
  provider: docker.Provider;
}

export const setupBase = (opts: BaseOpts) => {
  const { provider } = opts;
  
  const image = new docker.RemoteImage('traefik', { name: 'traefik:v3.3' }, { provider });
  const traefik = new docker.Container('traefik', {
    image: image.imageId,
    name: 'traefik',
    command: [
      // DEBUG
      '--log.level=DEBUG',
      // DEBUG
      '--api.insecure=true',
      '--providers.docker=true',
      '--providers.docker.exposedbydefault=false',
      // DEBUG
      '--entrypoints.web.address=:80',
      '--entrypoints.websecure.address=:443',
      // staging resolver for letsencrypt
      '--certificatesresolvers.stagingresolver.acme.httpchallenge=true',
      '--certificatesresolvers.stagingresolver.acme.httpchallenge.entrypoint=web',
      '--certificatesresolvers.stagingresolver.acme.email=aaron.kumavis@gmail.com',
      '--certificatesresolvers.stagingresolver.acme.storage=/letsencrypt/acme.json',
      '--certificatesresolvers.stagingresolver.acme.caServer=https://acme-staging-v02.api.letsencrypt.org/directory',
    ],
    ports: [
      {
        internal: 80,
        external: 80,
      },
      {
        internal: 443,
        external: 443,
      },
      // DEBUG
      {
        internal: 8080,
        external: 8080,
      }
    ],
    volumes: [
      {
          hostPath: '/var/run/docker.sock',
          containerPath: '/var/run/docker.sock',
          readOnly: true,
      },
      {
          hostPath: '/var/data/traefik/letsencrypt',
          containerPath: '/letsencrypt',
      },
    ],
    restart: 'always',
  }, { provider });

};