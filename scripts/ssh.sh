#/bin/bash
set -e

IP_ADDRESS=$(pulumi stack output dropletIp)
ssh "root@$IP_ADDRESS" -i ./keys/hello_do_docker
