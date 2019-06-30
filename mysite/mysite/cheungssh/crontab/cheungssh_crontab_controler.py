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
		######拿到全部的服务器数据
		servers_list=REDIS.lrange("servers.config.list",0,-1)
		#####转换为json
		tmp=[]
		for line in servers_list:
			line=json.loads(line)
			tmp.append(line)
		#####[{"ip":"192;1...","username":""}]
		return tmp
	def run(self):#####应该是所有的应该被收集的服务器清单
		#####比如有100个服务器的计划任务需要扫描收集起来
		data=self.get_all_server_data()
		pool=CheungSSHPool()
		for server_conf in data:#####这里是一个多线程的线程池，所以这里的速度是很快的
			pool.add_task(self.start_collect,server_conf)
		pool.all_complete()
	def start_collect(self,**server_conf):
		self.all_crontab_data={}
		a=CheungSSHCrontab()
		data=a.get_crontab_list(server_conf)#####每一个服务器的计划任务的列表
		print data["content"],server_conf["alias"]
		if data["status"]:
			self.save_crontab_list(data["content"],server_conf["alias"])######保存到redis
		
	
	def save_crontab_list(self,crontab,alias):#####保存每一个服务器的计划任务列表
	
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
		#####因为sed -i 's/' 中的分隔符号，有的计划任务携带有同样的字符，所以需要判断，避开相同字符。
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
		#####action 为create/modify，data是一个dict格式
		#####创建计划任务
		#####data数据格式：{"sid":"","runtime":"","cmd":"","dest":""} ,如果是modify，应该有tid字段
		cheungssh_info={"status":False,"content":""}
		crontab_format="{runtime} {cmd} #{dest}".format(runtime=data["runtime"],cmd=data["cmd"],dest=data["dest"])
		now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		try:
			#####判断sed的分隔符
			_sed_t=CheungSSHCrontabControler.get_sed_separate(crontab_format)#####获取判断字符是否符合规格
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
					#####修改计划任务列表
					info=ssh.execute("sed -i '{id}s{char}.*{char}{crontab_format}{char}' {path}".format(char=char,id=data["tid"],path=path,crontab_format=crontab_format))######替换新的内容
					if not info["status"]:
						raise CheungSSHError(info["content"])
					old_data=REDIS.hget("CHB0833279333-1",data["alias"])
					if old_data is None:old_data={}
                                        else:old_data=json.loads(old_data)
					
					data_line={"time":data["runtime"],"dest":data["dest"],"cmd":data["cmd"],"sid":data["sid"],"alias":data["alias"],"collect_time":now_time}
					line_count=data["tid"]
				else:
					#####在文件末尾追加
					info=ssh.execute(""" echo  '{crontab_format}' >>{path} """.format(crontab_format=crontab_format,path=path))
					if not info["status"]:
						raise CheungSSHError(info["content"])
					info=ssh.execute(""" cat {path}|wc -l  """.format(path=path))#####统计最后一行的tid
					if not info["status"]:
						raise CheungSSHError(info["content"])
					
					line_count=info["content"].split("\r\n")[1]#####自己递增行号
					#####修改redis记录
					old_data=REDIS.hget("CHB0833279333-1",data["alias"])
					if old_data is None:old_data={}
                                        else:old_data=json.loads(old_data)
					data_line={"time":data["runtime"],"dest":data["dest"],"cmd":data["cmd"],"sid":data["sid"],"alias":data["alias"],"collect_time":now_time}
				#####统一的代码部分
				old_data[line_count]=data_line#####把新创建的计划任务行，集合起来
				_old_data=json.dumps(old_data,encoding="utf8",ensure_ascii=False)
				REDIS.hset("CHB0833279333-1",data["alias"],_old_data)
				cheungssh_info={"status":True,"content":old_data}#####返回原始数据给上层django，最后dumps到前端
			else:
				cheungssh_info["content"]=a["content"]
				old_data={}#####登录失败后的默认值
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
					info=ssh.execute("sed -i '{id}s/.*/#/' {path}".format(id=tid,path=path))#####删除远程服务器上的
					if not info["status"]:
						raise CheungSSHError(info["content"])
					else:
						#####删除redis的记录
						#REDIS.hdel("CHB0833279333-1",conf["content"]["alias"])
						data=REDIS.hget("CHB0833279333-1",conf["content"]["alias"])#####取出来以后重置
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
	A.run()######自动启动采集任务
