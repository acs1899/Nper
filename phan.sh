#!/bin/sh
DIR=`pwd`
NODE=`which node`
#get action
ACTION=$1

#help
usage(){
  echo "Usage: ./phan.sh {start|stop|restart}"
  exit 1;
}

get_pid(){
  if [ ! -d $DIR/run ]; then
    mkdir $DIR/run
  fi
  if [ ! -d $DIR/logs ]; then
    mkdir $DIR/logs
  fi
  if [ -f $DIR/run/app.pid ]; then
    echo `cat ./run/app.pid`
  fi
}

#start app
start(){
  pid=`get_pid`
  if [ ! -z $pid ]; then
    echo 'server is already running'
  else
    $NODE $DIR/index.js >$DIR/logs/phan.log 2>&1 &
    echo 'server is running'
  fi
}

#stop app
stop(){
  pid=`get_pid`
  if [ -z $pid ]; then
    echo 'server not running'
  else
    echo 'server is stopping...'
    kill -15 $pid
    echo 'server stopped'
  fi
}

restart(){
  stop
  sleep 0.5
  echo =====
  start
}

case "$ACTION" in
  start)
    start
  ;;
  stop)
    stop
  ;;
  restart)
    restart
  ;;
  *)
    usage
  ;;
esac
