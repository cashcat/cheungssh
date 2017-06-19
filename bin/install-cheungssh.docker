#!/bin/bash
#张其川
setenforce 0 #关闭您的selinux，以免不能正确操作

trap "echo 'CheungSSH官方QQ群: 445342415'" EXIT
OS_VERSION=`echo  'import platform;print platform.dist()[0]'|python`
pwd=`dirname $0`
mkdir -p ${pwd}/../pid
mkdir -p ${pwd}/../logs
mkdir -p ${pwd}/../script
mkdir -p ${pwd}/../keyfile
mkdir -p ${pwd}/../download
mkdir -p ${pwd}/../upload

id=`id -u`
if [ $id -ne 0 ]
then
        echo  "请使用root账户安装"
        exit 1
fi


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
	echo "对不起,您的操作系统不是64bit机器，请您使用CentOS6.5 及以上的64bit版本，包括CentOS7安装本系统,如果需要支持，请联系CheungSSH作者"
	exit 1
fi










/bin/cp ${pwd}/../conf/CentOS* /etc/yum.repos.d/ #更新Yum源

yum clean all  && yum makecache
if [ $? -ne 0 ]
then
	clear
	echo "更新Yum源失败了，这可能影响安装CheungSSH."
	sleep 2
fi





create_swap(){
	#cheungssh使用了redis服务，所以为了保证正常运行，需要足够的swap
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





centos_docker(){
	#该函数使用于centos安装docker

	# 检查系统版本
	cat <<EOF|python
import platform,sys
if float(platform.dist()[1][:3]) < 6.5:
	sys.exit(100)
EOF
	if [ $? -ne 0 ]
	then
		echo  "抱歉，您当前的系统版本小于6.5，请您使用6.5版本以上的系统安装CheungSSH，如果有疑问，请您联系CheungSSH作者咨询."
		exit 1

	fi

	which docker 2>/dev/null


	if [ $? -ne 0 ]
	then


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









		#如果没有安装过docker，就地安装
		rpm -vih $pwd/epel-release-6-8.noarch.rpm #安装docker的源
		yum install -y  bzip2 device-mapper-event-libs  docker-io #联网安装docker服务，如果您的主机没有联网，就需要您手工下载docker进行源码编译安装,如果编译安装则需要GCC环境,所以建议您联网安装
		if [ $? -ne 0 ]
		then
			echo  "安装docker服务失败了，请联系CheungSSH作者解决"
			exit 1
		fi
	else
		rpm  -qa|grep  device-mapper-event-libs
		if  [ $? -ne 0 ]
		then
			yum install -y  bzip2 device-mapper-event-libs
			if  [ $? -ne 0 ]
			then
				echo  "您的系统虽然安装过docker服务，但是因为缺少device-mapper-event-libs 包，会导致不能正常使用。请确保您的服务器能正确联网，然后继续运行本安装脚本.如果需要支持，请联系CheungSSH作者。"
				exit 1
			fi
		fi
	fi
	echo  "正在重启docker..."
	service docker restart #如果您是centos7，那么请修改这里的命令为systemctl
	if [ $? -ne 0 ]
	then
		echo "启动docker失败了，请您检查原因，或者联系CheungSSH作者"
		exit 1
	else
		echo  "已启动docker服务."
		service docker status
	fi
	#下面开始下载镜像

	#docker_image_dir=${pwd}/../docker-image
	echo  "正在从阿里云下载docker镜像文件，这可能需要数十分钟，根据您的网速决定，请耐心等候..."
	#cat ${docker_image_dir}/official-zhangqichuan-cheungssh-web3.0-docker-centos*|tar jx
	docker pull registry.cn-hangzhou.aliyuncs.com/cheungssh/official-zhangqichuan-cheungssh-web3.0-docker-centos-20170404
	if  [ $? -ne 0 ]
	then
		echo  "下载docker镜像文件失败了，请您重新尝试下载，或者联系CheungSSH作者！"
		exit 1
	fi
	#echo  "正在导入docker镜像，这可能需要3分钟，请您耐心等候..."
	#docker load  < ${pwd}/official-zhangqichuan-cheungssh-web3.0-docker-centos-20170327.docker
	#if [ $? -ne 0 ]
	#then
	#	echo "导入docker镜像失败了，请您联系CheungSSH作者"
	#else
	#	echo  "导入docker镜像完成."
	#fi
	while [ 1 ]
	do
		read -p  "系统将启动HTTP服务，请您指定一个访问端口号 (默认80) " port
		if [ -t $port ]
		then
			port=80
			break
		else
			#检查输入的是否是数字
			expr $port +  0 2>/dev/null
			if  [ $? -ne 0 ]
			then
				echo "请您输入一个数字!"
			else
				break
			fi
		fi
			
	done

	cd $pwd/../soft/;tar xvf redis-3.2.8.tar.gz
	if [ $? -ne 0 ]
	then
		echo  "解压redis失败"
		exit 1
	else
		echo  "解压redis完成"
	fi
	echo  `pwd`
	tar xvf mod_python-3.4.1.tar.gz
	if [ $? -ne 0 ]
	then
		echo  "解压mod_python失败"
		exit 1
	else
		echo  "解压mod_python完成"
	fi


	create_swap

	echo "正在启动容器(端口$port,$pwd)，请稍后..."
	start_docker=`docker run  -tid -p $port:80   -v $(pwd)/../:/home/cheungssh registry.cn-hangzhou.aliyuncs.com/cheungssh/official-zhangqichuan-cheungssh-web3.0-docker-centos-20170404   /bin/bash`
	if [ $? -ne 0 ]
	then
		echo  "启动容器失败，请您联系CheungSSH作者！"
		exit 1
	else
		echo  "启动容器成功."
	fi
	
	cheungssh_docker="docker exec -ti ${start_docker} sh /home/cheungssh/bin/cheungssh \$@"
	cat > /etc/init.d/cheungssh <<EOF
#!/bin/bash
# chkconfig: 2345 90 60
service docker restart
docker  start  ${start_docker} 
case \"\$1\" in
	start)
		setenforce 0  2&>/dev/null
		docker exec -ti ${start_docker} sh /home/cheungssh/bin/cheungssh start
		;;
	*)
		$cheungssh_docker
		;;
esac
EOF
	chmod u+x /etc/init.d/cheungssh
	chkconfig  --add cheungssh
	clear
	docker exec -ti ${start_docker} sh /home/cheungssh/bin/cheungssh start
	echo  -e "1.\t请使用 service cheungssh start/stop/status 管理服务\n2.\t请使用您本机IP访问系统！并指定端口号($port)"


	
}
if [ $OS_VERSION == "centos" ]
then
	centos_docker
else
	echo  "您当前系统不是centos，暂不支持安装CheungSSH！请使用CentOS系统安装CheungSSH,并且版本在6.5以上！"	
fi
trap - EXIT

