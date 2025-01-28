import * as digitalocean from '@pulumi/digitalocean';
import * as docker from '@pulumi/docker';
import { makeMachine } from './src/machine';

const region = digitalocean.Region.SFO3;
const sshKeyName = 'terraform-hw';

const {
  dockerProvider,
  reservedIp,
} = makeMachine({
  region,
  sshKeyName,
  keyPath: './keys/hello_do_docker',
});

//
// example guest container
//
const args = {
  serviceName: 'example-whoami',
  containerName: 'example-whoami',
  hostname: 'whoami.playground.kumavis.me',
};
const dockerImageWhoami = new docker.RemoteImage(args.serviceName, { name: 'traefik/whoami' }, { provider: dockerProvider });
const whoami = new docker.Container(args.serviceName, {
  image: dockerImageWhoami.imageId,
  name: args.containerName,
  ports: [{
    internal: 80,
  }],
  labels: [
    {
        label: "traefik.enable",
        value: "true",
    },
    {
        label: `traefik.http.routers.${args.containerName}.rule`,
        value: `Host(\`${args.hostname}\`)`,
    },
    {
        label: `traefik.http.routers.${args.containerName}.entrypoints`,
        value: "websecure",
    },
    {
        label: `traefik.http.routers.${args.containerName}.tls.certresolver`,
        value: "stagingresolver",
    },
],
}, { provider: dockerProvider });


export const dropletIp = reservedIp.ipAddress;