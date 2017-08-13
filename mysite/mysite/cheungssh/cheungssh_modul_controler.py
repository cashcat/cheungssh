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
		#####可以一次性初始化
		#######需要传递redis连接
		self.REDIS=REDIS
		self.SSH=CheungSSH_SSH() #####继承sshv2
		#####调用command_contorler执行命令
		#####connect开启连接
	def controler_center(self,parameter={}):
		cmd=parameter.get("cmd",False)
		tid=parameter["tid"]
		pass
	def connect(self,sid=""): #####tid 是生成的id
		cheungssh_info={"content":"","status":False}
		try:
			server_config=self.convert_id_to_ip(sid) ######解析ID对应的IP配置 
			if not server_config["status"]:raise CheungSSHError(server_config["content"]) #####解析失败
			#ip=server_config["content"]["ip"]
			#alias=server_config["content"]["alias"]
			if server_config["status"]:
				cheungssh_info=self.SSH.login(**server_config["content"]) ######返回整个实例
				#####如果成功连接服务器，则存储连接
			else:
				#####配置解析失败
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
				"stage":"done",      #######running/done
				"status":False,          #####这里的status不是API的status。是用来显示命令执行状态的
		}
		cheungssh_info={"content":"","status":False}
		try:
			current="current.%s" %tid
			data=self.connect(sid=sid)
			if data["status"]:
				#####登录成功
				ssh=data["content"] #####获取shell
				#####开始成功的操作
				self.SSH.execute(cmd=cmd,sid=sid,tid=tid)
				######执行结束后，记录进度
				cheungssh_info["status"]=True
			else:
				raise CheungSSHError(data["content"])#####登录失败了，直接下去
		except Exception,e:
			print "程序错误",e
			log_content["content"]=str(e)
			#####程序错误，需要在这里写入命令的日志
			log_content=json.dumps(log_content,encoding="utf8",ensure_ascii=False)
			self.REDIS.rpush(log_name,log_content) #######写入当前服务器的日志，如果执行正确则在execute写入
			#######如果执行过程是正确的，那么在execute处写入日志
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		######计数
		self.REDIS.incr(current)
		return cheungssh_info
			
	@staticmethod
	def convert_id_to_ip(sid=""):
		#######返回一个服务器的配置行 {"ip","port"...}
		cheungssh_info={"status":False,"content":"指定的ID不存在"}
		try:
			servers_list=REDIS.lrange("servers.config.list",0,-1) ######[{},{id...}]
			if servers_list is None:pass #######默认就是错误的空的
			else:
				for _line in servers_list:
					line=json.loads(_line)
					if str(sid)==line["id"]:
						cheungssh_info["content"]=line ######返回服务器的整个配置
						cheungssh_info["status"]=True
						break
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
		
		
