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
from cheungssh_thread_queue import CheungSSHPool
from cheungssh_sshv2 import CheungSSH_SSH
from cheungssh_crontab import 	CheungSSHCrontab
from cheungssh_modul_controler import CheungSSHControler
class CheungSSHCrontabControler(object):
	def __init__(self):
		pass
	def get_all_server_data(self):
		#server_config.objects.all()
		
		servers_list=REDIS.lrange("servers.config.list",0,-1)
		
		tmp=[]
		for line in servers_list:
			line=json.loads(line)
			tmp.append(line)
		
		return tmp
	def run(self):
		
		data=self.get_all_server_data()
		pool=CheungSSHPool()
		for server_conf in data:
			pool.add_task(self.start_collect,server_conf)
		pool.all_complete()
	def start_collect(self,**server_conf):
		self.all_crontab_data={}
		a=CheungSSHCrontab()
		data=a.get_crontab_list(server_conf)
		print data["content"],server_conf["alias"]
		if data["status"]:
			self.save_crontab_list(data["content"],server_conf["alias"])
		
	
	def save_crontab_list(self,crontab,alias):
	
		crontab=json.dumps(crontab,encoding="utf8",ensure_ascii=False)
		REDIS.hset('CHB0833279333-1',alias,crontab)
	@staticmethod
	def get_crontab_list_to_web():
		cheungssh_info={"content":{},"status":True}
		data=REDIS.hgetall("CHB0833279333-1")
		for key in data.keys():
			cheungssh_info["content"][key]=json.loads(data[key])
		return cheungssh_info

	
	
	@staticmethod
	def get_sed_separate(crontab_format):
		
		try:
			if not  re.search('\+',crontab_format):
				char= '+'
			elif not re.search('=',crontab_format):
				char= '='
			elif not re.search('%',crontab_format):
				char='%'
			elif not re.search('\?',crontab_format):
				char='?'
			elif not re.search(':',crontab_format):
				char=':'
			elif not re.search('\^',crontab_format):
				char='^'
			else:
				raise CheungSSHError("您的命令比较特殊，请您联系CheungSSH作者协助解决这个问题")
			cheungssh_info={"content":char,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
		
			
	@staticmethod
	def save_crontab_to_server(action="create/modify",data={}):
		
		
		
		cheungssh_info={"status":False,"content":""}
		crontab_format="{runtime} {cmd} #{dest}".format(runtime=data["runtime"],cmd=data["cmd"],dest=data["dest"])
		now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		try:
			
			_sed_t=CheungSSHCrontabControler.get_sed_separate(crontab_format)
			if not _sed_t["status"]:
				raise CheungSSHError(_sed_t["content"])
			else:
				char=_sed_t["content"]
			ssh=CheungSSH_SSH()
			conf=CheungSSHControler.convert_id_to_ip(data["sid"])
			if not conf["status"]:
				raise CheungSSHError(conf["content"])
			a=ssh.login(**conf["content"])
			if a["status"]:
				username=conf["content"]["username"]
				path=os.path.join("/var/spool/cron/",username)
				if action=="modify":
					
					info=ssh.execute("sed -i '{id}s{char}.*{char}{crontab_format}{char}' {path}".format(char=char,id=data["tid"],path=path,crontab_format=crontab_format))
					if not info["status"]:
						raise CheungSSHError(info["content"])
					old_data=REDIS.hget("CHB0833279333-1",data["alias"])
					if old_data is None:old_data={}
                                        else:old_data=json.loads(old_data)
					
					data_line={"time":data["runtime"],"dest":data["dest"],"cmd":data["cmd"],"sid":data["sid"],"alias":data["alias"],"collect_time":now_time}
					line_count=data["tid"]
				else:
					
					info=ssh.execute(""" echo  '{crontab_format}' >>{path} """.format(crontab_format=crontab_format,path=path))
					if not info["status"]:
						raise CheungSSHError(info["content"])
					info=ssh.execute(""" cat {path}|wc -l  """.format(path=path))
					if not info["status"]:
						raise CheungSSHError(info["content"])
					
					line_count=info["content"].split("\r\n")[1]
					
					old_data=REDIS.hget("CHB0833279333-1",data["alias"])
					if old_data is None:old_data={}
                                        else:old_data=json.loads(old_data)
					data_line={"time":data["runtime"],"dest":data["dest"],"cmd":data["cmd"],"sid":data["sid"],"alias":data["alias"],"collect_time":now_time}
				
				old_data[line_count]=data_line
				_old_data=json.dumps(old_data,encoding="utf8",ensure_ascii=False)
				REDIS.hset("CHB0833279333-1",data["alias"],_old_data)
				cheungssh_info={"status":True,"content":old_data}
			else:
				cheungssh_info["content"]=a["content"]
				old_data={}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
	@staticmethod
	def delete_crontab(sid,tid):
		cheungssh_info={"content":"","status":False}
		ssh=CheungSSH_SSH()
		conf=CheungSSHControler.convert_id_to_ip(sid)
		try:
			if not conf["status"]:
				raise CheungSSHError(conf["content"])
			a=ssh.login(**conf["content"])
			if a["status"]:
				info=ssh.execute("whoami")
				if info["status"]:
					user=info["content"].split("\n")[1:][:-1][0]
					path=os.path.join("/var/spool/cron/",user)
					info=ssh.execute("sed -i '{id}s/.*/#/' {path}".format(id=tid,path=path))
					if not info["status"]:
						raise CheungSSHError(info["content"])
					else:
						
						#REDIS.hdel("CHB0833279333-1",conf["content"]["alias"])
						data=REDIS.hget("CHB0833279333-1",conf["content"]["alias"])
						data=json.loads(data)
						del data[tid]
						data=json.dumps(data,encoding="utf8",ensure_ascii=False)
						REDIS.hset("CHB0833279333-1",conf["content"]["alias"],data)
						cheungssh_info["status"]=True
			else:
				cheungssh_info["content"]=a["content"]
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
			
		return cheungssh_info
		
	
		
		
		
		
if __name__=='__main__':
	A=CheungSSHCrontabControler()
	A.run()
