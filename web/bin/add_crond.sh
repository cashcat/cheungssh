#!/bin/bash
cat  <<EOF > /var/spool/cron/root
*/30 * * * * sh /home/cheungssh/mysite/mysite/cheungssh/cheungssh_demo.sh 2>>/home/cheungssh/logs/demo.log  >> /home/cheungssh/logs/demo.log
EOF
