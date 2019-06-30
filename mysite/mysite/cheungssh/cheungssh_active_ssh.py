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
                self.base_prompt = r'[^\[#]([^#+])(>|#|\]|\$|\)|(\[y/N\]:|\?|(assword:?)|(？))) *$'#####yum安装的进度条和[y/N]:预测
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
			#####登录成功
			#####开始接受命令
			cheungssh_info["tid"]=tid
			cheungssh_info["log_key"]=log_key
			cheungssh_info["cmd_key"]=cmd_key
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def execute_command(self):
		log_name=  "log.%s.%s"  %(self.tid,self.sid)   ####### "log_tid_sid" 日志记录格式
		log_content={
			"content":"已注销",
			"status":False,
                }#####前端注销以后，需要终止信号
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
		#####临时日志由log_tid_sid组成
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
			cheungssh_info["content"]=re.sub("""\x1B\[[0-9;]*[mK]""","",cheungssh_info["content"])#####删除因为终端彩色的特殊字符编码
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def add_command(cmd,cmd_key):
		cheungssh_info={"status":False,"content":""}
		try:
			REDIS.rpush(cmd_key,cmd)######每一个独立的命令队列
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	#####重写sshv_v2的该方法,主要是去除命令状态检查
	def execute(self,cmd='',sid="",tid="",ignore=False):
		cheungssh_info={"status":False,"content":""}
		log_content={
			"content":"",
			"stage":"done",
			"status":False,
		}
		log_name=  "log.%s.%s"  %(tid,sid)
		try:
			#data=self.clean_buffer()
			#if not data["status"]:raise CheungSSHError(data["content"]) 
			#self.set_prompt()
			self.shell.send("%s\n"%cmd)
			cheungssh_info['content']=self.recv(sid=sid,tid=tid)
			cheungssh_info["status"]=True
			log_content["status"]=True
			cheungssh_info["status"]=False
			#REDIS.rpush("command.logs",cheungssh_info)
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"] =  str(e)
		_log_content=json.dumps(log_content,encoding="utf-8",ensure_ascii=False)
		REDIS.lpush(log_name,_log_content)
