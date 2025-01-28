import { readFileSync } from 'fs';
import * as pulumi from '@pulumi/pulumi';
import * as digitalocean from '@pulumi/digitalocean';
import * as docker from '@pulumi/docker';
import { remote, types } from "@pulumi/command";

import { checkCloudInitDoneScript, installDocker, makeBashScript, sshSecurityEnhancements } from './src/do_scripts';

// https://github.com/pulumi/pulumi-digitalocean/issues/600
const fixForDoId = (id: pulumi.Output<pulumi.ID>) => id.apply(id => parseInt(id, 10));

const region = digitalocean.Region.SFO3;
const sshKeyName = 'terraform-hw';

const sshKey = digitalocean.getSshKeyOutput({
  name: sshKeyName,
});

// https://www.pulumi.com/blog/executing-remote-commands/
// const cloudConfig = cloudinit.getConfig({
//   gzip: false,
//   base64Encode: false,
//   parts: [
//     {
//       contentType: "text/x-shellscript",
//       content: fs.readFileSync("../cloud-init/ensure-curl.sh", "utf8"),
//     },
//     {
//       contentType: "text/x-shellscript",
//       content: fs.readFileSync("../cloud-init/install-k3s.sh", "utf8"),
//     },
//   ],
// });

const droplet = new digitalocean.Droplet('primary', {
  image: 'ubuntu-20-04-x64',
  name: 'test-droplet',
  region,
  size: digitalocean.DropletSlug.DropletS1VCPU1GB,
  sshKeys: [sshKey.fingerprint],
  monitoring: true,
  dropletAgent: false,
  userData: makeBashScript(
    sshSecurityEnhancements,
    installDocker,
  ),
});

// Wait for SSH to become available
const connection: types.input.remote.ConnectionArgs = {
  host: droplet.ipv4Address,
  user: 'root',
  // consider making the tsl key part of the pulumi stack using the tls provider
  // privateKey: new pulumi.asset.StringAsset('./keys/hello_do_docker').text,
  privateKey: readFileSync('./keys/hello_do_docker', 'utf8'),
  dialErrorLimit: 20,
};
const cloudInitDoneCheck = new remote.Command("waitForSSH", {
  connection,
  create: checkCloudInitDoneScript,
}, { dependsOn: droplet });

const reservedIp = new digitalocean.ReservedIp(`primary`, {
  region,
});

new digitalocean.ReservedIpAssignment(`primary`, {
  ipAddress: reservedIp.ipAddress,
  dropletId: fixForDoId(droplet.id),
});

const project = new digitalocean.Project('primary', {
  name: 'playground',
  description: 'A project to represent development resources.',
  // purpose: 'Web Application',
  // environment: 'Development',
  resources: [
    droplet.dropletUrn,
    reservedIp.reservedIpUrn,
  ],
});

const dockerProvider = new docker.Provider('docker', {
  host: droplet.ipv4Address.apply(ip => `ssh://root@${ip}`),
  sshOpts: [
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-i", "./keys/hello_do_docker",
  ],
}, {
  dependsOn: cloudInitDoneCheck,
});


// Pulls the image
const dockerImageWhoami = new docker.RemoteImage('example-whoami', { name: 'traefik/whoami' }, { provider: dockerProvider });
// Create a container
const foo = new docker.Container('example-whoami', {
  image: dockerImageWhoami.imageId,
  name: 'example-whoami',
  ports: [{
    internal: 80,
    external: 80,
  }],
}, { provider: dockerProvider });


export const dropletIp = droplet.ipv4Address;