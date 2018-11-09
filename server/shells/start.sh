#!/bin/bash
appDir=app
appEntry="$appDir/main.js"

setOptionFromConfig() {
  export "$1=$2"
}

currDir=`dirname $0`
source $currDir/common.sh setOptionFromConfig

export NODE_ENV=development
export NODE_DEBUG=true

npx nodemon -e .js,.pug,.json -q --exec "eslint $appDir && babel-node $appEntry"
