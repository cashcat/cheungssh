#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import os,sys,json,time,threading,random,re
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
import cheungssh_settings
from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_sshv2 import CheungSSH_SSH
from cheungssh_modul_controler import CheungSSHControler
class CheungSSHActiveSSH(CheungSSH_SSH):
	def __init__(self):
		CheungSSH_SSH.__init__(self)
	def run(self,sid):
		tid=str(random.randint(999999999999,9999999999999))
		cheungssh_info={"content":"","status":False}
		log_key="log.{tid}.{sid}".format(tid=tid,sid=sid)
		cmd_key="cmd.{tid}.{sid}".format(tid=tid,sid=sid)
		self.sid,self.tid,self.cmd_key=sid,tid,cmd_key
		try:
			conf=CheungSSHControler.convert_id_to_ip(sid)
			if not conf["status"]:
				raise CheungSSHError(conf["content"])
			a=self.login(**conf["content"])
			if not a["status"]:
				raise CheungSSHError(a["content"])
			else:
				cheungssh_info["content"]=a["content"]
			a=threading.Thread(target=self.execute_command)
			a.start()
			
			
			cheungssh_info["tid"]=tid
			cheungssh_info["log_key"]=log_key
			cheungssh_info["cmd_key"]=cmd_key
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def execute_command(self):
		log_name=  "log.%s.%s"  %(self.tid,self.sid)   
		log_content={
			"content":"已注销",
			"status":False,
                }
                log_content=json.dumps(log_content,encoding="utf-8",ensure_ascii=False)
		while True:
			time.sleep(0.1)
			cmd=REDIS.lpop(self.cmd_key)
			if cmd is None:
				continue
			cmd=re.sub("^ *",'',cmd)
			cmd=re.sub(" *$",'',cmd)
			if cmd=="exit" or cmd=="logout":
				self.logout()
               			REDIS.rpush(log_name,log_content)
				break
			self.execute(cmd,tid=self.tid,sid=self.sid,ignore=True)
	@staticmethod
	def get_result(key):
		
		cheungssh_info={"status":False,"content":""}
		try:
			l=REDIS.llen(key)
			for i in range(l):
				data=REDIS.lpop(key)
				data=json.loads(data)
				cheungssh_info["content"]="%s%s" %(cheungssh_info["content"],data["content"])
				if data["content"]=="已注销":
					raise CheungSSHError(data["content"])
			cheungssh_info["status"]=True
			cheungssh_info["content"]=re.sub("""\x1B\[[0-9;]*[mK]""","",cheungssh_info["content"])
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def add_command(cmd,cmd_key):
		cheungssh_info={"status":False,"content":""}
		try:
			REDIS.rpush(cmd_key,cmd)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
