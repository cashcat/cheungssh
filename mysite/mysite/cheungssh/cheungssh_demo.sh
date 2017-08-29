#!/bin/bash

python /home/cheungssh/mysite/mysite/cheungssh/assets/assets_controler.py 2&> /home/cheungssh/logs/assets.log
python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_docker_admin.py 2&>  /home/cheungssh/logs/docker.log
python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_ssh_check.py    2&>  /home/cheungssh/logs/ssh.log
python /home/cheungssh/mysite/mysite/cheungssh/crontab/cheungssh_crontab_controler.py 2&>/home/cheungssh/logs/crontab.log
python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_middleware/cheungssh_middleware.py 2&>/home/cheungssh/logs/middleware.log
