#/bin/bash
set -e

IP_ADDRESS=$(pulumi stack output dropletIp)
echo "$IP_ADDRESS"
