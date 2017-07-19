#!/bin/bash
#张其川
setenforce 0 #关闭您的selinux，以免不能正确操作
os_name=`echo  "import platform;print platform.dist()[0]"|python`
os_version=`echo  "import platform;print platform.dist()[1][0]"|python`
CHOME="/home/cheungssh"
trap "echo  'CheungSSH官方QQ群: 517241115'" EXIT
useradd cheungssh 2>/dev/null
pwd=`dirname $0`
mkdir -p $CHOME/pid
mkdir -p $CHOME/logs
mkdir -p $CHOME/script
mkdir -p $CHOME/keyfile
mkdir -p $CHOME/download
mkdir -p $CHOME/upload
mkdir -p $CHOME/analysis_logfile


id=`id -u`
if [ $id -ne 0 ]
then
        echo  "请使用root账户安装!"
        exit 1
fi

/bin/cp -r ${pwd}/../ /home/cheungssh
chown cheungssh.cheungssh -R /home/cheungssh

#删除osa，因为会导致安装失败
rpm -e osa --nodeps 2>/dev/null

#不支持Python3

cat  <<EOF|python
import sys
if int(sys.version[:1])==3:
	sys.exit(1)
else:
	sys.exit(0)
EOF
if [ $? -ne 0 ]
then
	echo  "您的Python版本是3，本系统不支持，请您使用Python2的系统，另外，如果升级了Python版本的服务器也不支持。"
	exit 1
fi



software_list=" net-tools bzip2 unzip python-devel gcc*  mysql-server mysql mysql-devel mariadb*    httpd httpd-devel  MySQL-python libffi* apache2 apache2-dev"

#python_software_list="Django==1.4.2'    'django-redis==4.3.0' 'django-redis-cache==1.6.3' 'django-cors-headers==1.0.0"



#centos7可能需要安装的
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7 2>/dev/null



#必须是64位机器
cat <<EOF|python
import platform,sys
if platform.architecture()[0][:2] == '64':
	sys.exit(0)
else:
	sys.exit(1)
EOF
if  [ $? -ne 0 ]
then
	echo "对不起,您的操作系统不是64bit机器，请您使用64 Bit 的服务器安装本系统，有疑问请联系CheungSSH作者"
	exit 1
fi

update_yum(){
	if [ ! -f /tmp/cheungssh.yum.update ]
	then
		# 备份原有的yum源文件
		ls /etc/yum.repos.d/*repo |xargs -i  mv {} {}.bak
		#增加Yum源
		/bin/cp $(echo  "$CHOME/conf/CentOS`echo  "import platform;print platform.dist()[1][0]"|python`*") /etc/yum.repos.d/
		yum clean all  && yum makecache
		if [ $? -ne 0 ]
		then
			clear
			echo "更新Yum源失败了，这可能影响安装CheungSSH。如果真的失败了，请您更新您的Yum源来解决这个问题,或者联系CheungSSH作者."
			sleep 3
		fi
		touch /tmp/cheungssh.yum.update
	fi
}

install_setuptools(){
	echo  "import setuptools"|python 2>/dev/null
	if [ $? -ne 0 ]
	then
		#如果没有setuptools需要安装
		cd $CHOME/soft
		tar xvf setuptools-0.6c11.tar.gz
		cd setuptools-0.6c11
		python setup.py install
		if [ $? -ne 0 ]
		then
			echo  "安装setuptools失败，请联系CheungSSH作者解决."
			exit 1
		fi
	fi
	
}



#cheungssh使用了redis服务，所以为了保证正常运行，需要足够的内存
create_swap(){
	echo  "正在创建swap分区，可能需要2分钟左右..."
	dd if=/dev/zero of=/home/cheungsshswap bs=1024 count=1024000
	if  [ $? -ne 0 ]
	then
		echo "创建swap文件失败，这可能会影响cheungssh的正常运行!"
		sleep 5
	fi
	mkswap -f  /home/cheungsshswap 
	if  [ $? -ne 0 ]
	then
		echo "格式化swap文件失败，这可能会影响cheungssh的正常运行!"
		sleep 5
	fi
	
	swapon  /home/cheungsshswap
	if  [ $? -ne 0 ]
	then
		echo "开启swap文件失败，这可能会影响cheungssh的正常运行!"
		sleep 5
	else
		grep  '/home/cheungsshswap' /etc/fstab 2>/dev/null
		if  [ $? -ne 0 ]
		then
			echo  '/home/swap              swap                    swap    defaults        0 0' >> /etc/fstab
		fi
		echo  "已加载swap"
	fi

}


check_internet(){
	cat <<EOF|python  #检查是否联网
import socket,sys
s=socket.socket()
try:
        s.connect(('www.baidu.com',80))
        sys.exit(0)
except Exception,e:
        sys.exit(1)
EOF
	if [ $? -ne 0 ]
	then
		echo  "您的机器现在不能联网，所以不能安装，请联网安装！如果需要支持，请联系CheungSSH作者"
		exit 1
	fi
}

create_service(){
	/bin/cp /home/cheungssh/bin/cheungssh /etc/init.d/cheungssh
	chmod a+x /etc/init.d/cheungssh
	chkconfig  --add cheungssh
	clear
	echo  -e "1.\t请使用 service cheungssh start|stop 管理服务\n2.\t请使用您本机IP访问系统！并指定端口号($port)"
}



import_sql(){
	mysql -uroot  -p$mysql_password  < /home/cheungssh/conf/cheungssh.sql
	if [ $? -ne 0 ]
	then
		echo  "导入Mysql失败，请联系CheungSSH解决"
		exit 1
	fi
}

make_install_software(){
	#安装redis
	cd $CHOME/soft;tar xvf redis-2.10.3.tar.gz
	if [ $? -ne 0 ]
	then
		echo  "解压redis-2.10.3.tar.gz失败"
		exit 1
	else
		cd redis-2.10.3
		python setup.py install
		if  [ $? -ne 0 ]
		then
			echo "安装redis客户端失败"
			exit 1
		fi
	fi
	#安装redis服务
	cd $CHOME/soft/;tar xvf redis-3.2.8.tar.gz
	if [ $? -ne 0 ]
	then
		echo  "解压redis失败"
		exit 1
	else
		echo  "解压redis完成"
		cd redis-3.2.8
		make
		if [ $? -ne 0 ]
		then
			echo  "安装Redis失败，请根联系CheungSSH作者解决"
			exit 1
		fi
	fi
	#安装mod_python
	cd $CHOME/soft
	tar xvf mod_python-3.5.0.tgz
	if [ $? -ne 0 ]
	then
		echo  "解压mod_python失败"
		exit 1
	else
		echo  "解压mod_python完成"
		cd   mod_python-3.5.0
		apxs=`which apxs 2>/dev/null` ||apxs=/usr/sbin/apxs
		./configure --with-apxs=$apxs && make && make install
		if [ $? -ne 0 ]
		then
			echo  "安装mod_python失败，可能是您升级过Python导致的问题，如果确实升级过，请告知CheungSSH作者，并使用报错信息咨询CheungSSH作者解决."
			exit 1
		else
			version_file=`find  /usr/lib*/python*/site-packages/mod_python -type f -name version.py `
			if [ ! -f $version_file ]
			then
				echo  "找不到mod_python文件"
				exit 1
			else
				sed -in '/version/,/"/{s/.*//;p}' $version_file #删除编译出错的行
				echo  'version = "3.5.0"' >> $version_file
			fi
			
		fi
	fi
	# 安装IP包
	cd $CHOME/soft
	tar xvf IP.tar.gz
	cd IP
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装IP包失败，请联系CheungSSH作者解决."
		exit 1
	fi


	# 安装msgpack
	cd $CHOME/soft
	tar xvf msgpack-python-0.4.8.tar.gz
	cd  msgpack-python-0.4.8
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装msgpack包失败，请联系CheungSSH作者解决."
		exit 1
	fi
	# 安装django-redis
	cd $CHOME/soft
	tar xvf  django-redis-4.3.0.tar.gz 
	cd   django-redis-4.3.0
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装django-redis包失败，请联系CheungSSH作者解决."
		exit 1
	fi
	# 安装django-0redis-cache
	cd $CHOME/soft
	tar xvf django-redis-cache-1.6.3.tar.gz
	cd  django-redis-cache-1.6.3
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装django-redis-cache包失败，请联系CheungSSH作者解决."
		exit 1
	fi
	# 安装Django
	cd $CHOME/soft
	tar xvf Django-1.4.22.tar.gz
	cd Django-1.4.22
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装django包失败，请联系CheungSSH作者解决."
		exit 1
	fi
	# 安装core-headers
	cd $CHOME/soft
	tar xvf  django-cors-headers-1.0.0.tar.gz
	cd  django-cors-headers-1.0.0
	python setup.py install
	if [ $? -ne 0 ]
	then
		echo  "安装core-headers包失败，请联系CheungSSH作者解决."
		exit 1
	fi
	echo  "import paramiko"|python
	if [ $? -ne 0 ]
	then
		#安装pycrypto
		cd  $CHOME/soft
		tar xvf pycrypto-2.6.1.tar.gz
		cd  pycrypto-2.6.1
		python setup.py install
		if [ $? -ne 0 ]
		then
			echo  "安装pycrypto包失败，请联系CheungSSH作者解决."
			exit 1
		fi
		#安装paramiko
		cd $CHOME/soft
		unzip paramiko-1.7.7.1.zip
		cd paramiko-1.7.7.1
		python setup.py install
		if [ $? -ne 0 ]
		then
			echo  "安装paramiko包失败，请联系CheungSSH作者解决."
			exit 1
		fi
	fi
	
	
}

install_apache(){
	if [ $os_name == "ubuntu" ]
	then
		config_file="/etc/apache2/apache2.conf"
	else
		config_file="/etc/httpd/conf/httpd.conf"
	fi
	#修改Apache2.4的配置变化
	sed -i  "s/Require all denied/Require all granted/g" $config_file
	#修改运行用户
	sed -i  "s/^User.*/User cheungssh/g" $config_file
	while [ 1 ]
	do
		read -p  "请输入Apache运行端口号(默认80) " httpd_port
		if [ -z $httpd_port ]
		then
			httpd_port="80"
			netstat -anplut|grep  -v $$|grep -E ":::$httpd_port +"
			if [ $? -eq 0 ]
			then
				echo  "该端口($httpd_port)已经被占用，请您重新输入运行的端口"
				sleep 3
				continue
			else
				break
			fi
		else
			expr $httpd_port  + 0 2>/dev/null
			if [ $? -ne 0 ]
			then
				echo  "端口号应该是一个数字(您输入的是:$httpd_port)"
				continue
			else
				netstat -anplut|grep  -v $$|grep -E ":::$httpd_port +"
				if [ $? -eq 0 ]
				then
					echo  "该端口($httpd_port)已经被占用，请您重新输入运行的端口"
					sleep 3
					continue
				else
					break
				fi
			fi
		fi
	done

sed -i  '/^Listen/d' $config_file
	cat >>$config_file<<EOF
Listen $httpd_port
LoadModule python_module /home/cheungssh/soft/mod_python-3.5.0/src/.libs/mod_python.so
<Location "/">
        SetHandler python-program
        PythonPath "['/home/cheungssh/mysite/'] + sys.path"
        PythonHandler django.core.handlers.modpython
        SetEnv DJANGO_SETTINGS_MODULE mysite.settings
        PythonDebug On
</Location>
Alias /cheungssh/static /home/cheungssh/web/cheungssh/static/
<Location "/cheungssh/static">
        SetHandler None
</Location>
Alias /cheungssh/download/file  "/home/cheungssh/download/"
<Location "/cheungssh/download/file">
        SetHandler None
</Location>
Alias /static  "/home/cheungssh/web/cheungssh/static/admin/"
<Location "/static">
        SetHandler None
</Location>
EOF




	
}

init_mysql_server(){
	export mysql_password="zhang"
	if [ $os_version == "7" ]
	then
		mysql_name="mariadb"
	else
		if [ -f /etc/init.d/mysqld ]
		then
			mysql_name="mysqld"
		else
			mysql_name="mysql"
		fi
	fi
	export mysql_name
	sed -i  "s/mysqld/$mysql_name/g" /home/cheungssh/bin/cheungssh
	ps -fel|grep -v $$ |grep  mysqld_safe
	if [ $? -eq 0 ]
	then
		while [ 1 ]
		do
			read -p "请输入您正在运行的mysql密码(如果是空，请直接回车) " mysql_password
			if [ -z $mysql_password ]
			then
				new_mysql_password="zhang"
				# 空密码,设置密码为zhang
				mysqladmin  -uroot password  $new_mysql_password
				if [ $? -ne 0 ]
				then
					echo  "您输入的mysql密码不正确(您输入的是空密码)"
					continue
				else
					mysql_password=$new_mysql_password
					export mysql_password
					break
				fi
			else
				mysql -uroot -p$mysql_password -e 'show processlist'
				if [ $? -ne 0 ]
				then
					echo  "您输入的mysql密码不正确(您输入的是[$mysql_password])"
					continue
				else
					export mysql_password
					break
				fi
			fi
		done
		#echo  "CheungSSH检测到您已经安装并且运行了mysql程序，请您手工关闭正在运行的mysql服务"
		#read -p "按Enter键继续..."
		#continue
	else
		while [ 1 ]
		do
			if  [ $os_version == "7" ]
			then
				service $mysql_name restart
			else
				/etc/init.d/$mysql_name restart
			fi
			if  [ $? -ne 0 ]
			then
				read -p  "启动 $mysql_name 服务失败，请您重新打开另一个终端查看日志检查，然后Enter继续..."
				continue
			fi
			mysqladmin  -uroot password $mysql_password
			if [ $? -ne 0 ]
			then
				read -p "密码错误，请输入您mysql密码 " new_mysql_password
				if [ -z $new_mysql_password ]
				then
					continue
				else
					mysql -uroot -p$new_mysql_password -e 'show processlist'
					if [ $? -ne 0 ]
					then
						continue
					else
						export mysql_password=$new_mysql_password
						break
					fi
				fi
			else
				break
			fi
				
		done
	fi



	sed  -i  "s/PASSWORD':.*/PASSWORD':'$mysql_password',/g"    /home/cheungssh/mysite/mysite/settings.py
}


reset_redhat_yum(){
	# 处理GPG秘钥问题
	#rpm --import /home/cheungssh/conf/RPM-GPG-KEY-CentOS-6
	if [ ! -f /tmp/cheungssh.yum.update ]
	then
		ls /etc/yum.repos.d/*repo |xargs -i  mv {} {}.bak
		/bin/cp $(echo  "$CHOME/conf/CentOS`echo  "import platform;print platform.dist()[1][0]"|python`*") /etc/yum.repos.d/
		# 把redhat的yum源设置为公网源
		rpm -qa |grep yum |xargs rpm -e --nodeps
		if  [ $os_version == "6" ]
		then
			# 处理GPG秘钥问题
			rpm --import /home/cheungssh/conf/RPM-GPG-KEY-CentOS-6
			rpm  -vih /home/cheungssh/soft/6-python-iniparse-0.3.1-2.1.el6.noarch.rpm    --nodeps
			rpm  -vih /home/cheungssh/soft/6-yum-metadata-parser-1.1.2-16.el6.x86_64.rpm --nodeps
			rpm  -vih /home/cheungssh/soft/6-python-urlgrabber-3.9.1-11.el6.noarch.rpm   --nodeps
			rpm  -vih /home/cheungssh/soft/6-yum-3.2.29-81.el6.centos.noarch.rpm /home/cheungssh/soft/6-yum-plugin-fastestmirror-1.1.30-40.el6.noarch.rpm  --nodeps
			sed -i  's/$releasever/6/g' /etc/yum.repos.d/CentOS6-Base-163.repo
		elif [ $os_version == "7" ]
		then
			# 处理GPG秘钥问题
			rpm --import /home/cheungssh/conf/RPM-GPG-KEY-CentOS-7
			rpm -vih /home/cheungssh/soft/7-python-iniparse-0.4-9.el7.noarch.rpm        --nodeps
			rpm -vih /home/cheungssh/soft/7-yum-metadata-parser-1.1.4-10.el7.x86_64.rpm --nodeps
			rpm -vih /home/cheungssh/soft/7-python-urlgrabber-3.10-8.el7.noarch.rpm     --nodeps
			rpm -vih /home/cheungssh/soft/7-yum-3.4.3-150.el7.centos.noarch.rpm  /home/cheungssh/soft/7-yum-plugin-fastestmirror-1.1.31-40.el7.noarch.rpm  --nodeps
			sed -i  's/$releasever/7/g' /etc/yum.repos.d/CentOS7-Base-163.repo
		elif [ $os_version == "5" ]
		then
			echo  "操作系统版本过低，不支持的redhat 5"
			exit 1
		else
			echo  "操作系统版本未知，不支持，请使用redhat6,redhat7 64 bit的操作系统"
			exit 1
		fi
		yum clean all
		yum makecache
		touch /tmp/cheungssh.yum.update
	fi
	
	
}


check_internet

if [ $os_name == "centos" ]
then
	update_yum
	yum install  -y $software_list --skip-broken --setopt=protected_multilib=false
elif [ $os_name == "Ubuntu" ]
then
	apt-get install  -y  $software_list
elif [ $os_name == "redhat" ]
then
	reset_redhat_yum
	yum install  -y $software_list --skip-broken --setopt=protected_multilib=false
else
	echo  "不支持的操作系统，当前只支持安装在Redhat/CentOS/Ubuntu上。"
	exit 1
fi

create_swap
install_setuptools
make_install_software
init_mysql_server
import_sql
install_apache
create_service
service cheungssh start
