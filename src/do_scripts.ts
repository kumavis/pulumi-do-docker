export const makeBashScript = (...parts: string[]) => `#!/bin/bash\nset -e\n\n${parts.join('\n\n')}`

export const sshSecurityEnhancements = (
`
echo "XX JOB START XX"
# disable ssh while we configure the box
systemctl stop ssh\n

# Disable password authentication for SSH
sed -i 's/^#\\\\?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\\\\?PermitRootLogin .*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config`
)

export const installDocker = (
`

# Install Docker https://docs.docker.com/engine/install/ubuntu/
apt-get update
apt-get install -y docker.io
# Enable and start the Docker service
systemctl enable docker
systemctl start docker

# restart ssh which applies changes and tells pulumi that the droplet is ready
systemctl restart ssh\n
echo "XX JOB DONE XX"
touch /var/log/machine_setup_complete
`
// apt-get install -y apt-transport-https ca-certificates curl software-properties-common
// apt-get remove -y docker.io docker-doc docker-compose docker-compose-v2 containerd runc
// sudo install -m 0755 -d /etc/apt/keyrings
// sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
// sudo chmod a+r /etc/apt/keyrings/docker.asc
// # Add the repository to Apt sources:
// echo \
//   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
//   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
//   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
// sudo apt-get update
// sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
// # Enable and start the Docker service
// sudo systemctl enable docker
// sudo systemctl start docker
)

export const checkCloudInitDoneScript = (
`
# wait for cloud-init to finish, it can take a long time
for i in {1..100}; do
  if [ -f /var/log/machine_setup_complete ]; then
    echo "File exists!";
    exit 0;
  fi
  echo "Attempt $i/100: File not found, retrying in 5 seconds...";
  sleep 5;
done
echo "File still missing after 100 retries.";
exit 1;
`
)