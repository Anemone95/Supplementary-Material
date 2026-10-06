#! /bin/bash
scp -r server/ root@$1:/opt/soletta-dev-app/
scp -r scripts/ root@$1:/opt/soletta-dev-app/
scp -r client/js root@$1:/opt/soletta-dev-app/client/
scp -r client/css root@$1:/opt/soletta-dev-app/client/
scp -r client/img* root@$1:/opt/soletta-dev-app/client/
scp *.sh root@$1:/opt/soletta-dev-app/
