#!/bin/bash
appDir='app'
bundleDir='bundle'

clean() {
  rm -r -f $bundleDir
}

clean
export NODE_ENV=production

npx webpack --mode production --progress --display minimal || exit 1;

while [ -n "$1" ]
do
  case "$1" in
    -m)
      cp -R $bundleDir/* $2
      clean
    ;;
  esac
  shift
done

exit 0
