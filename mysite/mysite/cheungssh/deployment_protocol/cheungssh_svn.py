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
from cheungssh_sshv2 import CheungSSH_SSH
class CheungSSHSVN(CheungSSH_SSH):
	def __init__(self):
		CheungSSH_SSH.__init__(self)
	def checkout(self,url="",username="",password="",dest_dir="",tid="",stepid=""):
		######必须返回状态，否则admin不知道上一个调用是否成功
		#####tid是进度id
		self.tid=tid
		self.stepid=stepid
		self.dest_dir=dest_dir
		if len(username)>0 or len(password)>0:
			cmd="svn checkout {url} {dir} --username {username} --password {password}".format(url=url,dir=dest_dir,username=username,password=password)
		else:
			cmd="svn checkout {url} {dir}".format(url=url,dir=dest_dir)
		cheungssh_info={"content":"","status":False}
		try:
			cheungssh_info=self.execute(cmd=cmd,ignore=True)#####专递本身，作为进度过滤潘盾
			#####tool用于访问本实例的数据处理方法,tid alias stepid 用来recv处理消息
			if not cheungssh_info["status"]:
				if re.search("用户名|sername|assword|密码",cheungssh_info["content"]):
					cheungssh_info["summary"]="账号或密码错误!"
			else:
				self.logout()
				cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
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
			elif re.search(": $",buff.split("\n")[-1]):
				self.shell.send("\n")
                return buff
		
		
