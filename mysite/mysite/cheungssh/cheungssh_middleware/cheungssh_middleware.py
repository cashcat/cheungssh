#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko,re,os,sys,json,time,msgpack
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
from cheungssh_sshv2 import CheungSSH_SSH
import cheungssh_settings
from django.core.cache import cache
from  cheungssh_modul_controler import CheungSSHControler
REDIS=cache.master_client
from cheungssh_thread_queue import *


class CheungSSHMiddleware(object):
	def __init__(self):
		self.collect_oracle_cmd="find / -type f -name  tnslsnr"
		pass

	def login(self,**kws):
		ssh=CheungSSH_SSH()
		t=ssh.login(**kws)
		if not t["status"]:raise CheungSSHError(t["content"])
		return ssh
	def process_middleware_info(self,**_s):
		cheungssh_info={"content":"","status":False}
		month="(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) *\d+"
		data_info={"oracle":[],"mysql":[]}
		collect_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		try:
			ssh=self.login(**_s)
			data=ssh.execute(cmd=self.collect_oracle_cmd)
			if not data["status"]:
				raise CheungSSHError(data["content"])
			content=data["content"].split("\r\n")[:-1]
			for line in content:
				ora=re.search("^/.*oracle/.*tnslsnr$",line)
				#####处理oracle信息
				if ora:
					line=ora.group()
					try:
						version=re.search("oracle/.*([0-9]{2}(\.\d+)?)",line).group(1)
					except IndexError:
						continue
					parrent_dir=os.path.dirname(line)
					user="oracle"
					data=ssh.execute(cmd="ps -fel|grep -v  $$")
					#if not data["status"]:
					#	raise CheungSSHError(data["content"])
					#####不能对这个进行判断，因为有执行失败的情况存在
					content=data["content"]
					run_time="未运行"
					for ps in content.split("\r\n"):
						#####查找符合进程的行
						if re.search(parrent_dir,ps):
							run_time=re.search(month,ps)
							if run_time:
								#####如果找到了
								run_time=run_time.group()
								break
							else:
								#####如果没有找到，则可能是当天启动的
								run_time=ps.split()[11]
								break
					info={"path":parrent_dir,
						"username":user,
						"version":version,
						"run_time":run_time,
						"alias":_s["alias"],
						"sid":_s["id"],
						"ip":_s["ip"],
						"collect_time":collect_time,
						}
					data_info["oracle"].append(info)
					
					
			#####不符合就跳过
			#data=ssh.execute(cmd=self.collect_oracle_cmd)
			#if not data["status"]:
			#	raise CheungSSHError(data["content"])
			
				
			cheungssh_info={"content":data_info,"status":True}
		except Exception,e:
			print "Oracel Error",str(e),type(e)
			cheungssh_info={"content":str(e),"status":False}
		_data=msgpack.packb(cheungssh_info)
		REDIS.hset("CHB-5984849XSLW3O",_s["id"],_data)
	def run(self):
		cheungssh_info={"content":"","status":False}
		try:
			data=REDIS.lrange("servers.config.list",0,-1)
			pool=CheungSSHPool()
			for s in data:
				_s=json.loads(s)
				try:
					pool.add_task(self.process_middleware_info,_s)
					
				except Exception,e:
					print "中间件采集报错",e
					pass
			pool.all_complete()
		except Exception,e:
			print "运行中间件采集报错",str(e)
			cheungssh_info={"content":str(e),"status":False}
		print "采集完成"
	@staticmethod
	def get_to_web_middleware_info():
		
		cheungssh_info={"content":"","status":False}
		_data={}
		try:
			data=REDIS.hgetall("CHB-5984849XSLW3O")
			for sid in data.keys():
				line=msgpack.unpackb(data[sid])
				_data[sid]=line
			cheungssh_info={"content":_data,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
			
				
			
if __name__=='__main__':
	CheungSSHMiddleware().run()
