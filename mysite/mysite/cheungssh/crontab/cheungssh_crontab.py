#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko,re,socket,os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
import cheungssh_settings
from django.core.cache import cache
REDIS=cache.master_client
#from cheungssh_sshv2 import CheungSSH_SSH
import cheungssh_sshv2

class CheungSSHCrontab(object):
	def __init__(self):
		pass
	def get_crontab_list(self,server_info):######data应该是存放的ip的相关登录信息
		collect_time=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
		cheungssh_info={"content":"","status":False}
		cmd="/usr/bin/crontab -l"
		#crontab_data={server_info["alias"]:{}}
		crontab_data={}
		try:
			ssh=cheungssh_sshv2.CheungSSH_SSH()
			status=ssh.login(**server_info)
			if not status["status"]:
				######登录是失败的
				raise CheungSSHError(status["content"])
			else:
				########登录成功的
				data=ssh.execute(cmd,ignore=True)
				if not data["status"]:
					raise CheungSSHError(data["content"])
				else:
					######命令执行结果成功了
					#print "结果:",data["content"]
					crontab_list=data["content"]
					id=0
					#crontab_list="\n".join(crontab_list.split('\n')[1:][:-1])
					crontab_list="\n".join(crontab_list.split('\n')[1:][:-1])
					#print crontab_list,555555555555555555555555555555555555555
					#print crontab_list.split('abcded'),555555555555555555555555555555555555555
					for line in crontab_list.split('\n'):
						id+=1
						if re.search('^ *#',line):
							continue
						elif re.search('^ *$',line):
							continue
						try:
							crontab_time=" ".join(line.split()[:5])
							crontab_cmd=" ".join(line.split()[5:][:-1])
							if len(crontab_cmd)==0:
								if not len(line.split())==6:######考虑只有一个命令的情况，没有注释的情况或者参数的情况
									continue
								else:
									crontab_cmd=" ".join(line.split()[5:])
									
							crontab_dest=line.split("#")[-1]
							crontab_data[id]={"time":crontab_time,"cmd":crontab_cmd,"dest":crontab_dest,"collect_time":collect_time,"sid":server_info["id"],"alias":server_info["alias"]}
						except Exception,e:
							print "报错了",str(e)
							pass
			cheungssh_info["content"]=crontab_data
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
