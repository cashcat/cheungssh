#!/usr/bin/env python
#coding:utf8
#Author: 张其川总设计师
import os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
from cheungssh_thread_queue import CheungSSHPool
from cheungssh_sshv2 import CheungSSH_SSH
class CheungSSHCheck(object):
	def __init__(self,sid=""):
		#####传入当个sid，检查指定的sid服务器
		self.sid=sid
		pass
	def run(self):
		#####判断传入的sid是否为空，如果是空，那么就去数据库提取全部服务器配置，然后去检查，如果不是空的，就根据sid去提取服务器配置去检查
		######这里不返回状态
		servers_config_list=REDIS.lrange("servers.config.list",0,-1)#####服务器全部清单
		if servers_config_list is None:
			return False
		_servers_list=[]
		for _server in servers_config_list:
			server=json.loads(_server)
			if len(self.sid)>0:
				#####如果有指定sid，那么就检查指定的sid
				if str(self.sid)==str(server["id"]):
					_servers_list.append(server)
			else:
				#####检查全部
				_servers_list.append(server)
		servers_config_list=_servers_list

		pool=CheungSSHPool()
		for _server_line in servers_config_list: #####server_line是每一个服务器的配置
			pool.add_task(self.ssh_check,_server_line)
		pool.all_complete()
	def ssh_check(self,**kws):
		#####这里不可以做类的实例化，任何类都不行，只能用这种方式
		#####不返回状态
		ssh=CheungSSH_SSH()
		data=ssh.login(**kws)
		data["time"]=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		if data["status"]:
			data["status"]="success"
		else:
			data["status"]="failed"
		self.save(kws["id"],data)
		
	def save(self,sid,data):
		try:
			data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		except Exception,e:
			print sid
		REDIS.set("server.status.{sid}".format(sid=sid),data)
		print "已经存储"





if __name__=='__main__':
	g=CheungSSHCheck()
	g.run()
	#CheungSSH_SSH()
			
