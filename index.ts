import * as digitalocean from '@pulumi/digitalocean';
import { makeMachine } from './src/machine';
import { makeWebService } from './src/web-service';

const region = digitalocean.Region.SFO3;
const sshKeyName = 'terraform-hw';

const {
  dockerProvider,
  reservedIp,
} = makeMachine({
  region,
  sshKeyName,
  keyPath: './keys/hello_do_docker',
  letsEncryptEmail: 'aaron.kumavis@gmail.com',
});

makeWebService({
  serviceName:  'example-whoami',
  imageName: 'traefik/whoami',
  hostname: 'whoami.playground.kumavis.me',
  provider: dockerProvider,
});

makeWebService({
  serviceName:  'example-starwars',
  imageName: 'modem7/docker-starwars',
  hostname: 'starwars.playground.kumavis.me',
  internalPort: 8080,
  provider: dockerProvider,
});

makeWebService({
  serviceName:  'example-cats',
  imageName: 'goncalommarques/flask-cat-gif',
  hostname: 'cats.playground.kumavis.me',
  internalPort: 5000,
  provider: dockerProvider,
});

makeWebService({
  serviceName:  'example-dockercraft',
  imageName: 'rajchaudhuri/voxel-dockerclient',
  hostname: 'dockercraft.playground.kumavis.me',
  internalPort: 8080,
  provider: dockerProvider,
  extraArgs: {
    volumes: [
      {
          hostPath: '/var/run/docker.sock',
          containerPath: '/var/run/docker.sock',
      },
    ],
  }
});


export const dropletIp = reservedIp.ipAddress;