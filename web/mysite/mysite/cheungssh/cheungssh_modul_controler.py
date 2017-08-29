#!/usr/bin/env python
#coding:utf-8
import os,sys,json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
from cheungssh_sshv2 import CheungSSH_SSH
import threading
REDIS=cache.master_client
class CheungSSHControler(object):	
	def __init__(self):
		
		
		self.REDIS=REDIS
		self.SSH=CheungSSH_SSH() 
		
		
	def controler_center(self,parameter={}):
		cmd=parameter.get("cmd",False)
		tid=parameter["tid"]
		pass
	def connect(self,sid=""): 
		cheungssh_info={"content":"","status":False}
		try:
			server_config=self.convert_id_to_ip(sid) 
			if not server_config["status"]:raise CheungSSHError(server_config["content"]) 
			#ip=server_config["content"]["ip"]
			#alias=server_config["content"]["alias"]
			if server_config["status"]:
				cheungssh_info=self.SSH.login(**server_config["content"]) 
				
			else:
				
				cheungssh_info["content"]=server_config["content"]
		except Exception,e:
			print "connect错误",str(e)
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def command_controler(self,tid='',cmd='',sid=""):
		log_name="log.%s.%s"  %(tid,sid)
		log_content={
				"content":"",
				"stage":"done",      
				"status":False,          
		}
		cheungssh_info={"content":"","status":False}
		try:
			current="current.%s" %tid
			data=self.connect(sid=sid)
			if data["status"]:
				
				ssh=data["content"] 
				
				self.SSH.execute(cmd=cmd,sid=sid,tid=tid)
				
				cheungssh_info["status"]=True
			else:
				raise CheungSSHError(data["content"])
		except Exception,e:
			print "程序错误",e
			log_content["content"]=str(e)
			
			log_content=json.dumps(log_content,encoding="utf8",ensure_ascii=False)
			self.REDIS.rpush(log_name,log_content) 
			
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		
		self.REDIS.incr(current)
		return cheungssh_info
			
	@staticmethod
	def convert_id_to_ip(sid=""):
		
		cheungssh_info={"status":False,"content":"指定的ID不存在"}
		try:
			servers_list=REDIS.lrange("servers.config.list",0,-1) 
			if servers_list is None:pass 
			else:
				for _line in servers_list:
					line=json.loads(_line)
					if str(sid)==line["id"]:
						cheungssh_info["content"]=line 
						cheungssh_info["status"]=True
						break
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
		
		
