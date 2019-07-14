#!/bin/bash
#导出数据库最新表
echo 'DROP database IF EXISTS cheungssh;' > /home/cheungssh/conf/cheungssh.sql
echo 'create database cheungssh default charset="utf8";' >> /home/cheungssh/conf/cheungssh.sql
echo 'use cheungssh;' >> /home/cheungssh/conf/cheungssh.sql
mysqldump -uroot -pzhang -d cheungssh >> /home/cheungssh/conf/cheungssh.sql
echo  "INSERT INTO auth_user VALUES (1,'cheungssh','','','cheun@q.com','pbkdf2_sha256\$10000\$DrpqKF21yQiL\$pF2hEsrlI1YI0tHMRZveOzjqMaXN3JfJ+tuPbuRhaCc=',1,1,1,'2019-07-05 07:30:33','2019-07-05 07:29:58');" >> /home/cheungssh/conf/cheungssh.sql
/bin/rm -r /issue/cheungssh* 2>/dev/null
/bin/cp  -r /home/cheungssh /issue/
/bin/rm -r /issue/cheungssh/cheungssh/.ssh 2>/dev/null
/bin/rm -r /issue/cheungssh/packages 2>/dev/null
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
/bin/rm -r get-pip.py IP  mod_python-3.4.1   msgpack-python-0.4.8  redis-3.2.8    tcl8.6.6 mod_python-3.5.0 Django-1.4.22   django-cors-headers-1.0.0    redis-2.10.3 django-redis-4.3.0 redis-2.10.3 django-redis-cache-1.6.3 setuptools-27.0.0
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
