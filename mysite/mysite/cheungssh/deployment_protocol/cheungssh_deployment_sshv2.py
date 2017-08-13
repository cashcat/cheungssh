#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko,re,socket,os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_deployment_admin
from cheungssh_sshv2 import CheungSSH_SSH
from cheungssh_error import CheungSSHError
import cheungssh_settings
from django.core.cache import cache
REDIS=cache.master_client
class CheungSSHDeploymentSSH(CheungSSH_SSH):
	#####部署任务专用
	def __init__(self,taskid="",stepid=""):
		self.taskid=taskid
		self.stepid=stepid
		CheungSSH_SSH.__init__(self)

	def recv(self,sid="",tid="",ignore=False):
		buff=''
		cheungssh={"content":buff,"status":True}
		while not re.search(self.prompt,buff.split('\n')[-1]):
			_buff=self.shell.recv(10240)
			buff+=_buff
			#####把实时的执行信息写入redis数据库
			cheungssh["content"]=buff
			cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.taskid,stepid,buff)
		return buff
