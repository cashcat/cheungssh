#!/usr/bin/env python
#coding:utf-8
import os,sys,json,time,paramiko,random,functools,socket,re
import cheungssh_settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
class CheungSSHFileTransfer(object):
	def __init__(self):
		pass
	def login(self,ip='',username='',password='',port=22,login_method='',keyfile='',keyfile_password="",**kws):
		self.username=username
		self.owner=kws['owner']
		self.password=password
		self.port=port
		self.login_method=login_method
		self.ip=ip
		self.keyfile=os.path.join(cheungssh_settings.keyfile_dir,self.owner,keyfile)
		self.port=port
		
		self.keyfile_password=keyfile_password
		cheungssh_info={"status":False,"content":""}
		try:
			ssh=paramiko.Transport((self.ip,int(self.port)))
			if login_method=="PASSWORD":
				ssh.connect(username=self.username,password=self.password)
			else:

				if  len(self.keyfile_password)>0 and not self.keyfile_password=="******":
					key=paramiko.RSAKey.from_private_key_file(self.keyfile,password=self.keyfile_password)

				else:
					key=paramiko.RSAKey.from_private_key_file(self.keyfile)
				ssh.connect(username = username,pkey=key)
			sftp = paramiko.SFTPClient.from_transport(ssh)
			self.ssh=ssh
			self.sftp=sftp
			self.get_username_to_uid() 
			self.get_groupname_to_gid() 
			cheungssh_info["status"]=True
		except socket.error:
			cheungssh_info["content"]="连接错误"
		except socket.timeout:
			cheungssh_info["content"]="连接端口超时"
		except socket.gaierror:
			cheungssh_info["content"]="无法联系上这个主机"
		except paramiko.ssh_exception.AuthenticationException:
			cheungssh_info["content"]="账号或者密码错误"
		except paramiko.ssh_exception.BadAuthenticationType:
			if loginmethod=='KEY':
				cheungssh_info["content"]="认证类型应该是密码"
			else:
				cheungssh_info["content"]="认证类型应该是秘钥"
		except Exception,e:
			print "报错信息",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def upload(self,local_file='',remote_file='',tid=""):
		local_file=local_file.encode('utf-8')
		
		transfer_type="upload"
		self.transfer_type="upload"
		cheungssh_info={"status":False,"content":""}
		try:
			if os.path.isdir(local_file):
				
				raise CheungSSHError("CHB0000000018")
			else:
				
				if remote_file.endswith('/'):
					
					self.sftp.listdir(remote_file)
					
					remote_file=os.path.join(remote_file,os.path.basename(local_file))
				else:
					try:
						self.sftp.listdir(remote_file)  
	
						
						remote_file=os.path.join(remote_file,os.path.basename(local_file))
					except Exception,e:
						e=str(e)
						if re.search('Permission',e):
							
							raise CheungSSHError(e)
						else:
							
							pass
				data={"tid":tid,"content":"","status":True}
				callback= functools.partial(self.set_progress,data)
				print "本地文件路径:",local_file,"远程路径:",remote_file
				self.sftp.put(local_file,remote_file,callback=callback)
				self.sftp.chmod(remote_file,0755)
				
				cheungssh_info["remote_file"]=remote_file 
				cheungssh_info["local_file"]=local_file
				cheungssh_info["transfer_type"]=transfer_type
				cheungssh_info["tid"]=tid
				cheungssh_info["progress"]=0   
				cheungssh_info["status"]=True
				
		except Exception,e:
			e=str(e)
			if re.search('No such file',e):
				cheungssh_info["content"]="您指定的源文件路径或者服务器目标路径不存在，请检查"
			elif re.search('Permission',e):
				cheungssh_info["content"]="您当前Linux账号无权上传到目录[{remote_file}]下".format(remote_file=remote_file)
			else:
				cheungssh_info["content"]="未知错误:{e},请联系CheungSSH作者".format(e=e)
			cheungssh_info["status"]=False
			cheungssh_info["tid"]=tid
			REDIS.set("progress.%s"%tid,json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False))
		return cheungssh_info
		
	def download(self,remote_file='',local_file='',tid=""):
		transfer_type="download"
		self.transfer_type="download"
		cheungssh_info={"status":False,"content":""}
		try:
			_local_file=os.path.basename(local_file) 
			local_file=os.path.join(cheungssh_settings.download_dir,_local_file)
			
			if os.path.isfile(local_file):local_file="%s_%s"%(local_file,self.ip)
			try:
				self.sftp.listdir(remote_file)
				
			except Exception,e:
				
				try: 
					data={"tid":tid,"content":"","status":True}
					callback= functools.partial(self.set_progress,data)
					self.sftp.get(remote_file,local_file,callback=callback)
					cheungssh_info["remote_file"]=remote_file 
					cheungssh_info["local_file"]=local_file
					cheungssh_info["transfer_type"]=transfer_type
					cheungssh_info["tid"]=tid
					cheungssh_info["progress"]=0   
					cheungssh_info["status"]=True
				except Exception,e:
					if e==2:raise CheungSSHError("源文件[%s]不存在"%remote_file)
					else:raise IOError(str(e))
				
		except Exception,e:
			if hasattr(e,"errno"):
				if e.errno is None:
					cheungssh_info["content"]="指定的源文件路径不存在"
			else:
				cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
			cheungssh_info["tid"]=tid
			REDIS.set("progress.%s"%tid,json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False))
	
		return cheungssh_info
	def get_username_to_uid(self):
		
		passwd_file=self.sftp.open("/etc/passwd") 
		user_info=passwd_file.readlines()
		passwd_file.close()
		self.username_to_uid={} 
		for _line in user_info:
			line=_line.strip().split(":")
			username=line[0] 
			uid=line[2]      
			self.username_to_uid[username]=uid
	def get_groupname_to_gid(self):
		group_file=self.sftp.open("/etc/group")
		group_info=group_file.readlines()
		group_file.close()
		self.groupname_to_gid={} 
		for _line in group_info:
			line=_line.strip().split(":")
			groupname=line[0]
			gid=line[2]
			self.groupname_to_gid[groupname]=gid
			
		
	def chmod(self,file,permission_code):
		
		cheungssh_info={"status":False,"content":""}
		try:
			self.sftp.chmod(file,permission_code) 
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def chown(self,file,owner='',group=''):
		cheungssh_info={"status":False,"content":""}
		uid=self.username_to_uid[owner]
		if len(group)==0:group=owner 
		gid=self.groupname_to_gid[group]
		try:
			self.sftp.chown(file,uid,gid)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			if e.errno==13:
				cheungssh_info["content"]="权限拒绝"
			else:
				cheungssh_info["content"]=str(e)
		return cheungssh_info
	def set_progress(self,data,current_size,all_size):
		
		tid=data["tid"]
		progress="%0.2f" % ( float(current_size) / float(all_size)    *100    )
		data["progress"]=progress
		self.write_progress(data) 
		print '当前进度',progress,tid
	def write_progress(self,data):
		tid=data["tid"]
		data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		REDIS.set("progress.%s"%tid,data) 
	@staticmethod
	def get_progress(tid):
		cheungssh_info=REDIS.get("progress.%s" % tid) 
		if cheungssh_info is None:
			cheungssh_info={}
			cheungssh_info["status"]=False
			cheungssh_info["content"]="CHB0000000015"
		else:
			cheungssh_info=json.loads(cheungssh_info)
		return cheungssh_info
	def logout(self):
		try:
			self.ssh.close()
			print "已经注销"
		except:
			pass
	def get_filecontent(self,filename):
		cheungssh_info={"content":"","status":False}
		try:
			a=self.sftp.open(filename)
			content="".join(a.readlines())
			cheungssh_info["content"]=content
			a.close()
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def write_filecontent(self,filename,content):
		cheungssh_info={"content":"","status":False}
		try:
			print 111111,filename,content
			a=self.sftp.open(filename,"w")
			print 22222222222
			a.write(content)
			print 3333333333
			a.close()
			print 4444444444
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def __del__(self):
		self.logout()
