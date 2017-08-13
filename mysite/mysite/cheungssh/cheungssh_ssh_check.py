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
		
		self.sid=sid
		pass
	def run(self):
		
		
		servers_config_list=REDIS.lrange("servers.config.list",0,-1)
		if servers_config_list is None:
			return False
		_servers_list=[]
		for _server in servers_config_list:
			server=json.loads(_server)
			if len(self.sid)>0:
				
				if str(self.sid)==str(server["id"]):
					_servers_list.append(server)
			else:
				
				_servers_list.append(server)
		servers_config_list=_servers_list

		pool=CheungSSHPool()
		for _server_line in servers_config_list: 
			pool.add_task(self.ssh_check,_server_line)
		pool.all_complete()
	def ssh_check(self,**kws):
		
		
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
			
