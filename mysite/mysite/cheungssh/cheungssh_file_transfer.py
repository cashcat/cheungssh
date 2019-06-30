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

				if  len(self.keyfile_password)>0 and not self.keyfile_password=="******":#######如果有密码
					key=paramiko.RSAKey.from_private_key_file(self.keyfile,password=self.keyfile_password)

				else:
					key=paramiko.RSAKey.from_private_key_file(self.keyfile)
				ssh.connect(username = username,pkey=key)
			sftp = paramiko.SFTPClient.from_transport(ssh)
			self.ssh=ssh
			self.sftp=sftp
			self.get_username_to_uid() ###########获取用户名——uid字典
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
		local_file=local_file.encode('utf-8')#####前端传递过来的时候是unicode
		#######默认全显示644
		transfer_type="upload"
		self.transfer_type="upload"
		cheungssh_info={"status":False,"content":""}
		try:
			if os.path.isdir(local_file):
				############目录传输
				raise CheungSSHError("CHB0000000018")
			else:
				#######普通文件上传
				if remote_file.endswith('/'):
					#########如果指定的就是一个正确的目录，有/结尾，则进行判断
					self.sftp.listdir(remote_file)
					#########当用户制定了/结尾的时候往往没有输入文件名，所以这里需要组装目录+文件名,如果没有修改，那么传输的时候回出现从错误:Failure
					remote_file=os.path.join(remote_file,os.path.basename(local_file))
				else:
					try:
						self.sftp.listdir(remote_file)  #########如果是目录，但是没有/结尾
	
						#########用户输入的是一个目录，但是没有/结尾，所以这里需要组装目录+文件名,如果没有修改，那么传输的时候回出现从错误:Failure
						remote_file=os.path.join(remote_file,os.path.basename(local_file))
					except Exception,e:
						e=str(e)
						if re.search('Permission',e):
							#####权限拒绝，直接 报错
							raise CheungSSHError(e)
						else:
							##########忽略，用户输入的可能是一个文件路径，不是文件夹
							pass
				data={"tid":tid,"content":"","status":True}
				callback= functools.partial(self.set_progress,data)
				print "本地文件路径:",local_file,"远程路径:",remote_file
				self.sftp.put(local_file,remote_file,callback=callback)
				self.sftp.chmod(remote_file,0755)#####赋予执行权限
				#########归属和数组可能修改失败
				cheungssh_info["remote_file"]=remote_file ######为了方便部署，把源文件和目标文件都传递
				cheungssh_info["local_file"]=local_file
				cheungssh_info["transfer_type"]=transfer_type
				cheungssh_info["tid"]=tid
				cheungssh_info["progress"]=0   #######初始化进度
				cheungssh_info["status"]=True
				###########可以考虑返回修改了归属和权限
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
			_local_file=os.path.basename(local_file) ########处理用户输入的路径，只能上传downlod目录下的文件
			local_file=os.path.join(cheungssh_settings.download_dir,_local_file)
			###########本地已经存在文件了,需要重命名,重命名为IP后缀
			if os.path.isfile(local_file):local_file="%s_%s"%(local_file,self.ip)
			try:
				self.sftp.listdir(remote_file)
				#######下载目录模块
			except Exception,e:
				######单个文件下载
				try: #########开始下载文件
					data={"tid":tid,"content":"","status":True}
					callback= functools.partial(self.set_progress,data)
					self.sftp.get(remote_file,local_file,callback=callback)
					cheungssh_info["remote_file"]=remote_file ######为了方便部署，把源文件和目标文件都传递
					cheungssh_info["local_file"]=local_file
					cheungssh_info["transfer_type"]=transfer_type
					cheungssh_info["tid"]=tid
					cheungssh_info["progress"]=0   #######初始化进度
					cheungssh_info["status"]=True
				except Exception,e:
					if e==2:raise CheungSSHError("源文件[%s]不存在"%remote_file)######源文件不存在
					else:raise IOError(str(e))
				
		except Exception,e:
			if hasattr(e,"errno"):
				if e.errno is None:#####这里是None，不是2
					cheungssh_info["content"]="指定的源文件路径不存在"
			else:
				cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
			cheungssh_info["tid"]=tid
			REDIS.set("progress.%s"%tid,json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False))
	
		return cheungssh_info
	def get_username_to_uid(self):
		#########把用户名转化为uid
		passwd_file=self.sftp.open("/etc/passwd") ##########读取密码文件内容
		user_info=passwd_file.readlines()
		passwd_file.close()
		self.username_to_uid={} #######{"tomcat":0,}
		for _line in user_info:
			line=_line.strip().split(":")
			username=line[0] ######第一列是用户名
			uid=line[2]      ######用户id
			self.username_to_uid[username]=uid
	def get_groupname_to_gid(self):
		group_file=self.sftp.open("/etc/group")
		group_info=group_file.readlines()
		group_file.close()
		self.groupname_to_gid={} #########{"tomcat":0,}
		for _line in group_info:
			line=_line.strip().split(":")
			groupname=line[0]
			gid=line[2]
			self.groupname_to_gid[groupname]=gid
			
		
	def chmod(self,file,permission_code):
		##########下载函数，没必要用,跟linux的chmod权限模式一样
		cheungssh_info={"status":False,"content":""}
		try:
			self.sftp.chmod(file,permission_code) #######修改权限
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def chown(self,file,owner='',group=''):
		cheungssh_info={"status":False,"content":""}
		uid=self.username_to_uid[owner]
		if len(group)==0:group=owner #######如果没有指定组，那么则默认是当前的用户所在组
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
		######data={"id":"","progress":"","status":True,"content":""}
		tid=data["tid"]
		progress="%0.2f" % ( float(current_size) / float(all_size)    *100    )
		data["progress"]=progress
		self.write_progress(data) #########把进度写入REDIS
		print '当前进度',progress,tid
	def write_progress(self,data):
		tid=data["tid"]
		data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		REDIS.set("progress.%s"%tid,data) ########写入进度
	@staticmethod
	def get_progress(tid):
		cheungssh_info=REDIS.get("progress.%s" % tid) ########读取出进度
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
	"""
	def get_path(self,path):
		cheungssh_info={"content":"","status":False}
		try:
			all_path={}
			for son_path in self.sftp.listdir(path):
				full_path=os.path.join(path,son.filename)
				info={full_path:{
					"type":"",
					"attr":"",
					"perm":"",
					"info":"",}
					}
				##### check permission
				try:
					self.sftp.listdir(full_path)
					info["perm"]=True
				except Exception,e:
					e=str(e)
					if re.search('Permission',e):
						info["info"]="您的账号无权访问该路径资源"
					else:
						info["info"]=e
					info["perm"]=False
				##### check permission
				
				##### chekc type
				if re.search("\.pdf$",full_path,flags=re.IGNORECASE):
					info["type"]="pdf"
				elif re.search('\.(rar|war|zip|tgz|gz|jar|egg|iso|tar|bz2|7-zip|)$',full_path,flags=re.IGNORECASE):
					info["type"]="rar"
				elif re.search('\.(xls|xlsx|csv)$',full_path)
					info['type']="xls"
				elif re.search('\.txt',full_path):
					info['type']='txt'
				else:
					info['type']="unknow"
		except Exception,e:
			e=str(e)
			if re.search('Permission',e):
				cheungssh_info["content"]="您的账号无权访问该路径资源"
			else:
				cheungssh_info["content"]=e
			cheungssh_info["status"]=False
		return cheungssh_info
		"""
