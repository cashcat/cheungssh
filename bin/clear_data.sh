#!/bin/bash
#导出数据库最新表
python /home/cheungssh/mysite/manage.py createsuperuser cheungssh
python /home/cheungssh/mysite/manage.py changepassword cheungssh
mysql  -uroot  -pzhang cheungssh -e " delete  from auth_permission where id in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,78,79,80,81,82,83);"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_serverslist;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_batchshelllist;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_blacklistgroup;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_blacklistlist;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_remotefile;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_remotefilehistoryversion;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_scriptshistoricversion;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_scriptslist;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_serviceoperationlist;"
mysql  -uroot  -pzhang cheungssh -e " delete  from cheungssh_userwithblacklistgroup ;"
echo  "DROP database IF EXISTS cheungssh;" >  /home/cheungssh/conf/cheungssh.sql
echo  "create database cheungssh default charset='utf8';" >>  /home/cheungssh/conf/cheungssh.sql
echo  "use cheungssh;" >> /home/cheungssh/conf/cheungssh.sql
mysqldump  -uroot -pzhang cheungssh >> /home/cheungssh/conf/cheungssh.sql
/bin/rm -r /issue/cheungssh* 2>/dev/null
/bin/cp  -r /home/cheungssh /issue/
/bin/rm -r /issue/cheungssh/cheungssh/.ssh 2>/dev/null
/bin/rm -r /issue/cheungssh/cheungssh/script 2>/dev/null
/bin/rm -r /issue/cheungssh/cheungssh/logs 2>/dev/null
/bin/rm -r /issue/cheungssh/cheungssh/remote_files 2>/dev/null
/bin/rm -r /issue/cheungssh/cheungssh/upload 2>/dev/null
find  /issue/cheungssh/  -name "*bak*" -exec  /bin/rm -r {} \;
find  /issue/cheungssh/ -type f -name '*pyc'  -exec  /bin/rm -r {} \;
#find  /issue/cheungssh/ -type f -name '*py'  -exec  sed -i  's/#####.*//g' {} \;
#find  /issue/cheungssh/ -type f -name '*sh'  -exec  sed -i  's/#####.*//g' {} \;
/bin/rm  -r /issue/cheungssh/logs/*
/bin/rm -r /issue/cheungssh/data/*
/bin/rm  -r /issue/cheungssh/pid/*
/bin/rm  -r /issue/cheungssh/download/*
/bin/rm  -r /issue/cheungssh/keyfile/*
/bin/rm  -r /issue/cheungssh/script*
/bin/rm  -r /issue/cheungssh/upload/*
#/bin/rm -r /issue/cheungssh/.git
/bin/rm -r /issue/cheungssh/.mozilla
/bin/rm  -r /issue/cheungssh/conf/*rdb
/bin/rm  -r /issue/cheungssh/conf/*aof
cd /issue//cheungssh/soft/
/bin/rm -r get-pip.py IP  mod_python-3.4.1   msgpack-python-0.4.8  redis-3.2.8    tcl8.6.6 mod_python-3.5.0 Django-1.4.22   django-cors-headers-1.0.0    redis-2.10.3 django-redis-4.3.0 redis-2.10.3 django-redis-cache-1.6.3
cd -
/bin/rm  -r /issue/cheungssh/.sshd
/bin/rm  -r /issue/cheungssh/.bash_history
/bin/rm  -r /issue/cheungssh/cheungssh/.bash_logout
/bin/rm  -r /issue/cheungssh/.bash_profile
/bin/rm  -r /issue//cheungssh/.bashrc
/bin/rm  -r /issue//cheungssh/.mysql_history
/bin/rm  -r /issue//cheungssh/.viminfo
/bin/rm  -r /issue//cheungssh/httpd.conf
/bin/rm  -r /issue//cheungssh/.bash_history
/bin/rm  -r /issue//cheungssh/.bashrc
/bin/rm  -r /issue/cheungssh/.viminfo
/bin/rm  -r /issue/cheungssh/.vim
/bin/rm  -r /issue/cheungssh/.mysql_history
/bin/rm  -r /issue/cheungssh/bin/2
/bin/rm  -r /issue/cheungssh/bin/auth.sql
cd /issue/
filename=cheungssh_web4.0_source_`date +%F`.tar.gz
tar zcvf $filename cheungssh
echo "sz $filename"
