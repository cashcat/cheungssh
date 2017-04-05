#!/bin/bash
cat  <<EOF > /var/spool/cron/root
*/20 * * * * python /home/cheungssh/mysite/mysite/cheungssh/assets/assets_controler.py
*/20 * * * *  python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_docker_admin.py
*/20 * * * * python /home/cheungssh/mysite/mysite/cheungssh/cheungssh_ssh_check.py
*/20 * * * *  python /home/cheungssh/mysite/mysite/cheungssh/crontab/cheungssh_crontab_controler.py
EOF
