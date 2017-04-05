#!/bin/bash




while [ 1 ]
do
	sleep 600
	python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_docker_admin.py  
done &
pid="$!"
echo  $pid > /home/cheungssh/pid/docker_admin.pid


while [ 1 ]
do
	sleep 600
	python /home/cheungssh/mysite/mysite/cheungssh/assets/assets_controler.py   
done &
pid="$!"
echo  $pid > /home/cheungssh/pid/asset_admin.pid

while [ 1 ]
do
	sleep 600
	python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_ssh_check.py  
done &
pid="$!"
echo  $pid > /home/cheungssh/pid/server_status.pid

while [ 1 ]
do
	sleep 600
	python /home/cheungssh/mysite/mysite/cheungssh/crontab/cheungssh_crontab_controler.py 
done  &
 
pid="$!"
echo  $pid > /home/cheungssh/pid/crontab.pid
