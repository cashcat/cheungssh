#!/usr/bin/env python
#coding:utf8
#Author: 张其川总设计师
import ftplib,sys,os,json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
sys.path.append("/home/cheungssh/mysite")
from django.core.cache import cache
REDIS=cache.master_client
import socket,cheungssh_settings
class CheungSSHFtp(object):
	def __init__(self,ip="",username="",password=""):
		self.ip=ip
		self.username=username
		self.password=password
	def login(self):
		cheungssh_info={"content":"","status":False}
		try:
			ftp=ftplib.FTP()
			ftp.set_debuglevel(2)
			ftp.connect(self.ip,21)
			ftp.login(self.username,self.password)
			self.ftp=ftp
			cheungssh_info["status"]=True
		except ftplib.error_perm:
			cheungssh_info["content"]="账号或密码错误"
		except socket.error:
			cheungssh_info["content"]="不能连接到服务器"
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def download(self,filename):
		
		cheungssh_info={"content":"","status":False}
		try:
			bufsize=1024
			local_path=os.path.join(cheungssh_settings.ftp_download_dir,os.path.basename(filename))
			f=open(local_path,"wb")
			total=self.ftp.size(filename)
			callback=Callback(total,f)
			#self.ftp.retrbinary('RETR %s' % filename,f.write,bufsize)
			#self.ftp.retrbinary('RETR %s' % filename,f.write,bufsize)
			self.ftp.retrbinary('RETR %s' % filename, callback, bufsize) 
			f.close()
			cheungssh_info["local_path"]=local_path
			cheungssh_info["status"]=True
		except Exception,e:
			if str(e)==str(550):
				cheungssh_info["content"]="指定的文件不存在"
			else:
				cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def logout(self):
		try:
			self.ftp.close()
		except Exception:
			pass
		print "已注销"
	def __del__(self):
		self.logout()
class Callback(object): 
	def __init__(self, totalsize, fp):
		self.totalsize = totalsize 
		self.fp = fp 
		self.received = 0 
	def __call__(self, data): 
		
		self.fp.write(data) 
		self.received += len(data) 
		progress="%0.2f" % (100.0*self.received/self.totalsize)
		#print '\r下载进度: %.3f%%' % (100.0*self.received/self.totalsize), 
		print "\r下载进度: %s" %progress
	
