#!/bin/bash
configFile=.conf
callbackFunc=$1

# create config if needed
[[ ! -f $configFile ]] && touch $configFile

if [[ `type -t $callbackFunc` != function ]]
then
  tput setaf 1
  echo "First attribute hase to be \"function\" type"
  tput sgr0
  exit 1
fi

# read config file
oldIFS=$IFS
IFS="= $oldIFS"

while read -r key value
do
  [[ -n "$key" && -n $value ]] && $callbackFunc $key "$value"
done < $configFile

IFS=$oldIFS
return
