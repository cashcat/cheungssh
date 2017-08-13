#!/usr/bin/env python
#coding:utf-8
#Author:张其川
import os,sys,json,re
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
sys.path.append("/home/cheungssh/mysite")
from django.core.cache import cache
import cheungssh_deployment_admin
REDIS=cache.master_client
from cheungssh_error import CheungSSHError
from cheungssh_deployment_sshv2 import  CheungSSHDeploymentSSH
class CheungSSHGit(CheungSSHDeploymentSSH):
	def __init__(self):
		self.REDIS=REDIS
		CheungSSHDeploymentSSH.__init__(self)
	def login_ssh(self,conf):#####服务器的配置信息dict
		#####在clone之前，先执行这
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
		######必须返回状态，否则admin不知道上一个调用是否成功
		#####tid是进度id
		self.taskid=taskid
		self.stepid=stepid
		self.alias=alias
		self.dest_dir=dest_dir
		cmd="git clone {url} {dir}".format(url=url,dir=dest_dir)
		cheungssh_info={"content":"","status":False}
		try:
			cheungssh_info=self.execute(cmd=cmd,ignore=True)#####专递本身，作为进度过滤潘盾
			#####tool用于访问本实例的数据处理方法,tid alias stepid 用来recv处理消息
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
		#if not cheungssh_info["status"]:#####如果又失败的，才重写日志记录
		#	cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,cheungssh_info)
		#在admin调用处才执行
		return cheungssh_info
	def recv(self,sid="",tid="",ignore=False):
		#####重载ssh的recv
		buff=''
		while not re.search(self.prompt,buff.split('\n')[-1]):
			_buff=self.shell.recv(1024)
			buff+=_buff
			if re.search('\(yes/no\)\?',buff.split('\n')[-1]):
				self.shell.send('yes\n')
				######发送yes后，就继续收取信息
				continue
			self.resolve_progress(buff,self.taskid)#####新增进度过滤判断
                return buff
	def resolve_progress(self,all_buff,taskid):
		cheungssh_info={"content":"","status":True}
		_progress=re.findall('Receiving objects: *([0-9]+)%',all_buff)
		if _progress:
			#####搜索到了进度
			progress=_progress[-1]
			print "Git下载进度:",progress
			cheungssh_info["progress"]=progress
			cheungssh_info["content"]=all_buff
			cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.taskid,self.stepid,cheungssh_info)
