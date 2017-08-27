#!/usr/bin/env python
#coding:utf-8
#Author:张其川
import os,sys,json,re
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
sys.path.append("/home/cheungssh/mysite")
from django.core.cache import cache
import deployment_protocol
REDIS=cache.master_client
from cheungssh_error import CheungSSHError
from cheungssh_deployment_sshv2 import  CheungSSHDeploymentSSH
class CheungSSHGit(CheungSSHDeploymentSSH):
	def __init__(self):
		self.REDIS=REDIS
		CheungSSHDeploymentSSH.__init__(self)
	def login_ssh(self,conf):
		
		cheungssh_info={"content":"","status":False}
		try:
			data=self.login(**conf)
			if not data["status"]:raise CheungSSHError(data["content"])
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def clone(self,url="",dest_dir="",taskid="",stepid="",alias=""):
		
		
		self.taskid=taskid
		self.stepid=stepid
		self.alias=alias
		self.dest_dir=dest_dir
		cmd="git clone {url} {dir}".format(url=url,dir=dest_dir)
		cheungssh_info={"content":"","status":False}
		try:
			cheungssh_info=self.execute(cmd=cmd,ignore=True)
			
			if not cheungssh_info["status"]:
				if re.search("""already exists and is not an empty directory""",cheungssh_info["content"]):
					cheungssh_info["summary"]="您指定的目录[{dir}]非空,请重新指定 !".format(dir=self.dest_dir)
				elif re.search('Permission denied',cheungssh_info["content"]):
					cheungssh_info["summary"]="拒绝登录,SSH-Key错误!"
				elif re.search('Name or service not known',cheungssh_info['content']):
					cheungssh_info["summary"]="无法连接您指定的URL地址!"
			else:
				self.logout()
				cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		
		
		
		return cheungssh_info
	def recv(self,sid="",tid="",ignore=False):
		
		buff=''
		while not re.search(self.base_prompt,buff.split('\n')[-1]):
			_buff=self.shell.recv(1024)
			buff+=_buff
			if re.search('\(yes/no\)\?',buff.split('\n')[-1]):
				self.shell.send('yes\n')
				
				continue
			self.resolve_progress(buff,self.taskid)
                return buff
	def resolve_progress(self,all_buff,taskid):
		cheungssh_info={"content":"","status":True}
		_progress=re.findall('Receiving objects: *([0-9]+)%',all_buff)
		if _progress:
			
			progress=_progress[-1]
			print "Git下载进度:",progress
			cheungssh_info["progress"]=progress
			cheungssh_info["content"]=all_buff
			deployment_protocol.cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.taskid,self.stepid,cheungssh_info)
