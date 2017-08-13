#!/usr/bin/env python
#coding:utf8

#Author:张其川
import os,sys,json,re,random
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
sys.path.append("/home/cheungssh/mysite")
from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_thread_queue  import CheungSSHPool
import threading
class DeploymentAdmin(object):
	def __init__(self,taskid):
		
		self.taskid=taskid
	@staticmethod
	def get_task_conf(taskid):
		pass
	def demo(self):
		tid=random.randint(90000000000000000000,99999999999999999999)
		cheungssh_info={"content":"0","status":False}
		try:
			a=threading.Thread(target=self.run)
			a.start()
			cheungssh_info["content"]=tid
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
		
	def run(self):
		for server in servers:
			
			
			for step in steps:
				if not cheungssh_info["status"]:
					cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.taskid,cheungssh_info)
	@staticmethod
	def create_task_conf(data):
		cheungssh_info={}
		REDIS.set(data,encoding="utf8",ascii_ensure=False)
	@staticmethod
	def set_progress(taskid,stepid,data):
		data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=taskid),stepid,data)
	@staticmethod
	def get_progress(taskid):
		REDIS.hgetall("CHB-R000000000050.{taskid}".format(taskid=taskid),stepid)
		data=json.loads(data)
		return data
		
if __name__=='__main__':
	
	taskid=sys.argv[1]
	a=DeploymentAdmin(taskid)
	b=a.demo()
	print b
