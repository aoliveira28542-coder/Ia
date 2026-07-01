#!/bin/bash

export NODE_HOME="$PWD/node-v18.19.0-linux-x64"
export PATH="$NODE_HOME/bin:$PATH"

echo "=== NODE ENV LOADED ==="
node -v
npm -v
