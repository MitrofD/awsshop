#!/bin/bash
appDir=app
bundleDir=bundle
packageFile=package.json

clean() {
  rm -r -f $bundleDir
}

clean
export NODE_ENV=production
export NODE_DEBUG=false

npx babel $appDir --out-dir $bundleDir --copy-files || exit 1

sed -e '/"scripts"/,/}/d; /"devDependencies"/,/}/d' $packageFile > $bundleDir/$packageFile

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
