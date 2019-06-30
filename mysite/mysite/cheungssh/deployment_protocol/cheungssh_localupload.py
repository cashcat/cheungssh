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
from cheungssh_file_transfer import CheungSSHFileTransfer
class CheungSSHLocalUpload(CheungSSHFileTransfer):
	def __init__(self,stepid):
		self.stepid=stepid#####需要新增stepid
		CheungSSHFileTransfer.__init__(self)
	def write_progress(self,data):
		tid=data["tid"]
		cheungssh_deployment_admin.DeploymentAdmin.set_progress(tid,self.stepid,data)
		print "已经写入传输进度"

	def set_progress(self,data,current_size,all_size):
		tid=data["tid"]
		progress="%0.2f" % ( float(current_size) / float(all_size)    *100    )
		data["progress"]=progress
		self.write_progress(data)
		print '当前进度',progress,tid
