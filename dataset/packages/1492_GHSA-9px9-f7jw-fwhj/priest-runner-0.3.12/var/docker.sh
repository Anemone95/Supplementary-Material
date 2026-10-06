#!/bin/bash

docker run \
  -v $PWD:/app \
  -v ~/tmp:/priest \
  -w /app \
  -p 7000:7000 \
  --entrypoint=node \
  -u=root \
  alpine-node \
  bin/priest $@
