#!/bin/bash
currPath=$PWD
bundleDirName=bundle-aws
bundlePath=$PWD/$bundleDirName
publicPath=$bundlePath/public
scriptsPath=shells/build.sh

clean() {
  rm -r -f $bundlePath
}

# clear
clean
mkdir -p $publicPath

# client
cd $currPath/client
clientOk="sh $scriptsPath -m $publicPath"

if $clientOk
then
  # server
  cd $currPath/server
  sh $scriptsPath -m $bundlePath

  # if tar exists
  if hash tar 2>/dev/null
  then
    cd $currPath
    tar -czf $bundleDirName.tar.gz $bundleDirName/ && clean
  fi

  exit 0
fi

exit 1
