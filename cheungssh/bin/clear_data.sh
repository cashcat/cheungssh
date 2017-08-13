#!/bin/bash
#导出数据库最新表
mysql  -uroot  -pzhang cheungssh -e " delete  from auth_permission where id in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,78,79,80,81,82,83);"
echo  "DROP database IF EXISTS cheungssh;" >  /home/cheungssh/conf/cheungssh.sql
echo  "create database cheungssh default charset='utf8';" >>  /home/cheungssh/conf/cheungssh.sql
echo  "use cheungssh;" >> /home/cheungssh/conf/cheungssh.sql
mysqldump  -uroot -pzhang cheungssh >> /home/cheungssh/conf/cheungssh.sql
/bin/rm -r /issue/cheungssh/cheungssh/ 2>/dev/null
/bin/cp  -r /home/cheungssh /issue/cheungssh/
/bin/rm -r /issue/cheungssh/cheungssh/.ssh
find  /issue/cheungssh/cheungssh  -name "*bak*" -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh         -name "*tar.gz" -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh         -name "*tgz" -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh -type d -name "*2016*" -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh -type f -name '*pyc'  -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh -type f -name '*zip' -exec  /bin/rm -r {} \;
find  /issue/cheungssh/cheungssh -type f -name '*py'  -exec  sed -i  's/
find  /issue/cheungssh/cheungssh -type f -name '*sh'  -exec  sed -i  's/
/bin/rm  -r /issue/cheungssh/cheungssh/logs/*
/bin/rm -r /issue/cheungssh/cheungssh/data/*
/bin/rm  -r /issue/cheungssh/cheungssh/pid/*
/bin/rm  -r /issue/cheungssh/cheungssh/download/*
/bin/rm  -r /issue/cheungssh/cheungssh/keyfile/*
/bin/rm  -r /issue/cheungssh/cheungssh/script/*
/bin/rm  -r /issue/cheungssh/cheungssh/upload/*
/bin/rm  -r /issue/cheungssh/cheungssh/conf/*rdb
/bin/rm  -r /issue/cheungssh/cheungssh/conf/*aof
/bin/cp  -r /home/cheungssh/soft/* /issue/cheungssh//cheungssh/soft/
cd /issue/cheungssh//cheungssh/soft/
/bin/rm -r get-pip.py IP  mod_python-3.4.1   msgpack-python-0.4.8  redis-3.2.8    tcl8.6.6 mod_python-3.5.0
cd -
/bin/rm  -r /issue/cheungssh/cheungssh/.sshd
/bin/rm  -r /issue/cheungssh/cheungssh/.bash_history
/bin/rm  -r /issue/cheungssh/cheungssh/.bash_logout
/bin/rm  -r /issue/cheungssh/cheungssh/.bash_profile
/bin/rm  -r /issue/cheungssh/cheungssh/.bashrc
/bin/rm  -r /issue/cheungssh/cheungssh/.mysql_history
/bin/rm  -r /issue/cheungssh/cheungssh/.viminfo
/bin/rm  -r /issue/cheungssh/cheungssh/httpd.conf
/bin/rm  -r /issue/cheungssh/cheungssh/.bash_history
/bin/rm  -r /issue/cheungssh/cheungssh/.bashrc
/bin/rm  -r /issue/cheungssh/cheungssh/.viminfo
/bin/rm  -r /issue/cheungssh/cheungssh/.vim
/bin/rm  -r /issue/cheungssh/cheungssh/.mysql_history
/bin/rm  -r /issue/cheungssh/cheungssh/bin/2
/bin/rm  -r /issue/cheungssh/cheungssh/bin/auth.sql
cd /issue/cheungssh
filename=cheungssh_web3.0_source_`date +%F`.tar.gz
tar zcvf $filename cheungssh
echo "sz $filename"
