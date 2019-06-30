#!/usr/bin/evn python
#coding:utf8
#张其川
import paramiko,socket
from  key_resolv import  key_resolv
from django.core.cache import cache
def ssh_check(conf):
	info={"status":False,"content":""}
	try:
		username=conf['username']
		password=conf['password']
		port=conf['port']
		ip=conf['ip']
		loginmethod=conf['loginmethod']
		SSH=cache.get('%s.SSH'%(ip))
		if SSH is None:
			try:
				ssh=paramiko.SSHClient()
				if loginmethod=='KEY':
					keyfile=conf['keyfile']
					KeyPath= key_resolv(keyfile)
					key=paramiko.RSAKey.from_private_key_file(KeyPath)
					ssh.load_system_host_keys()
					ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
					ssh.connect(ip,port,username,pkey=key)  
       	        		else:
					ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
					ssh.connect(ip,int(port),username,password)
				info['status']=True
			except paramiko.ssh_exception.NoValidConnectionsError:
				info["content"]="不能正常连接该主机"
			except socket.timeout:
				info["content"]="连接端口超时"
			except socket.gaierror:
				info["content"]="无法联系上这个主机"
			except paramiko.ssh_exception.AuthenticationException:
				info["content"]="账号或者密码错误"
			except paramiko.ssh_exception.BadAuthenticationType:
				if loginmethod=='KEY':
					info["content"]="认证类型应该是密码"
				else:
					info["content"]="认证类型应该是秘钥"
			except Exception,e:
				info['content']="未知错误类型"
			finally:
				ssh.close()
			cache.set("%s.SSH"%(ip),info,600)###########10分钟检查一次链接状态
		else:########如果存在链接
			info=SSH
	except Exception,e:
		info["content"]=str(e)
	return info
