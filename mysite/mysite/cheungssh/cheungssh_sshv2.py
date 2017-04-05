#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko,re,socket,os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
import cheungssh_settings
from django.core.cache import cache
REDIS=cache.master_client
class CheungSSH_SSH(object):
	def __init__(self):
		self.base_prompt = r'(>|#|\]|\$|\)) *$'
		self.active=False
		self.prompt=""
		self.cheungssh_prompt=re.escape("[CheungSSH-Virtual-Acount@CheungSSH-Automatic-System]#")
	def login(self,**kws):
		cheungssh_info={"status":False,"content":""}
		try:
			self.owner=kws["owner"]
			self.su=kws["su"]
			self.sudo=kws["sudo"]
			self.username=kws["username"]
			self.password=kws["password"]
			self.port=kws["port"]
			self.login_method=kws["login_method"]
			self.ip=kws["ip"]
			self.keyfile=os.path.join(cheungssh_settings.keyfile_dir,self.owner,kws["keyfile"])
			self.keyfile_password=kws["keyfile_password"]
			self.sudo=kws["sudo"]
			self.sudo_password=kws["sudo_password"]
			self.su=kws["su"]
			self.su_password=kws["su_password"]
			self.port = int(self.port)
			ssh = paramiko.SSHClient()
			if self.login_method=='PASSWORD':
				ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
				ssh.connect(self.ip,self.port,self.username,self.password)
				
			else:
				if  len(self.keyfile_password)>0 and not self.keyfile_password=="******":
					key=paramiko.RSAKey.from_private_key_file(self.keyfile,password=self.keyfile_password)
				else:
					
					key=paramiko.RSAKey.from_private_key_file(self.keyfile)
				ssh.load_system_host_keys()
				ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
				ssh.connect(self.ip,self.port,self.username,pkey=key)
			self.channel=ssh
			self.shell = ssh.invoke_shell(width=1000,height=1000)
			self.active=True
			data=self.clean_buffer()
			if not data["status"]:raise CheungSSHError(data["content"])
			if self.sudo=="Y":
				_sudo=self.sudo_login()
				if _sudo["status"]:
					pass
				else:
					raise CheungSSHError(_sudo["content"])
			elif self.su=="Y":
				_su=self.su_login()
				if _su["status"]:
					#self.get_prompt()
					pass
				else:
					raise CheungSSHError(_su["content"])
			"""data=self.get_prompt()#换成设置统一prompt
			if not data["status"]:
				raise CheungSSHError(data["content"])
			else:
				cheungssh_info["content"]=data["content"]"""
			cheungssh_info["status"]=True
		except KeyError,e:
			cheungssh_info["content"]="缺少字段 %s" %str(e)
		except socket.error:
			cheungssh_info["content"]="无法连接端口"
		except socket.gaierror:
			cheungssh_info["content"]="无法联系上这个主机"
		except paramiko.ssh_exception.AuthenticationException:
			cheungssh_info["content"]="账号或者密码错误"
		except paramiko.ssh_exception.BadAuthenticationType:
			if login_method=='KEY':cheungssh_info["content"]="认证类型应该是密码"
                        else:   cheungssh_info["content"]="认证类型应该是秘钥"
		except Exception,e:
			cheungssh_info['status'] = False
			cheungssh_info['content'] = str(e)
		if re.search("Not a valid RSA private key file \(bad ber encoding\)",cheungssh_info["content"]):
			cheungssh_info["content"]="秘钥的密码不正确"
		return cheungssh_info
	def get_prompt(self):
		buff=''
		cheungssh_info={"status":False,"content":""}
		try:
			self.shell.send('\n')
			while not re.search(self.base_prompt,buff.split('\n')[-1]):
				buff+=self.shell.recv(1024)
			cheungssh_info["content"]=buff
			self.prompt=re.escape(buff.split('\n')[-1])
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]="获取主机提示符错误:[%s]" %str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def recv(self,sid="",tid="",ignore=False):
		buff=''
		
		while (not re.search(self.cheungssh_prompt,buff.split('\n')[-1])) :
			_buff=self.shell.recv(10240)
			buff+=_buff
			if not ignore:self.log(sid=sid,tid=tid,content_segment=_buff)
		return buff
	def disk_log(self,sid,content=""): 
		pass
	def log(self,sid='',tid='',content_segment=""): 
		
		log_name=  "log.%s.%s"  %(tid,sid)   
		log_content={
				"content":content_segment,
				"stage":"running",	
				"status":None,		
		}
		log_content=json.dumps(log_content,encoding="utf-8",ensure_ascii=False)
		REDIS.rpush(log_name,log_content)
			
		
	def clean_buffer(self):
		cheungssh_info={"status":False,"content":""}
		try:
			if  not self.active: raise CheungSSHError("已经与主机断开连接")
			#self.shell.send('\n')
			
			buff=""
			#while (not re.search(self.base_prompt.split('\r\n')[-1],buff)):
			while (not re.search(self.cheungssh_prompt.split('\r\n')[-1],buff)):
				buff+=self.shell.recv(512)
			cheungssh_info["status"]=True
		except Exception,e:
			print "清除缓存失败",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def execute(self,cmd='',sid="",tid="",ignore=False):
		cheungssh_info={"status":False,"content":""}
		log_content={ 	
			"content":"",
			"stage":"done",      
			"status":False,          
		}
		try:
			if not self.active:raise CheungSSHError("未能与主机建立连接")
			#data=self.clean_buffer()
			#if not data["status"]:raise CheungSSHError(data["content"]) 
			
			
			#self.set_prompt()
			log_name=  "log.%s.%s"  %(tid,sid)   
			self.shell.send("%s\n"%cmd)
			cheungssh_info['content']=self.recv(sid=sid,tid=tid)
			self.shell.send("echo $?\n")
			_status=self.recv(sid=sid,tid=tid,ignore=True)
			status=re.search('echo \$\?\\r\\n(.*)\\r\\n%s'%self.prompt,_status).group(1)
			status=int(status)
			if status==0:
				cheungssh_info["status"]=True
				log_content["status"]=True 
			else:
				cheungssh_info["status"]=False
			#REDIS.rpush("command.logs",cheungssh_info)
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"] =  str(e)
		
		_log_content=json.dumps(log_content,encoding="utf-8",ensure_ascii=False)
		REDIS.lpush(log_name,_log_content)
		
		if not ignore:
			
			log_content["content"]=cheungssh_info["content"]
			self.write_command_log(tid,log_content)
		return cheungssh_info
	def write_command_log(self,tid,log_content):
		
		try:
			history=REDIS.lrange("command.history",-5,-1)
			for _line in history:
				line=json.loads(_line)
				if str(line["tid"])==tid:
					
					content="""%s</br>%s<hr style="border-bottom:1px solid #b0b0b0"/>""" %(line["content"],log_content["content"])
					log_content["content"]=content
					line=dict(line,**log_content)
					REDIS.lrem("command.history",_line,0)
					_line=json.dumps(line,encoding="utf8",ensure_ascii=False)
					REDIS.lpush("command.history",_line)
					break
		except Exception,e:
			print "写入日志报错",str(e)
			pass
		

	def sudo_login(self):
		cheungssh_info={"status":False,"content":""}
		try:
			if self.username=="root":raise CheungSSHError("root不能sudo")
			self.shell.send('sudo su - root\n')
			buff=''
			_buff=""
			while True:
				buff+=self.shell.recv(1024)
				if re.search('\[sudo\] password for %s'%self.username,buff.split('\n')[-1]):
					self.shell.send('%s\n' %self.sudo_password) 
					while True:
						_buff+=self.shell.recv(1024)
						if re.search('Sorry, try again',_buff):
							raise CheungSSHError("sudo密码错误")
						elif re.search('%s.*sudoers' %self.username,_buff):
							raise CheungSSHError("您的账户没有配置sudo权限")
						elif re.search(self.base_prompt,_buff.split('\n')[-1]):
							
							cheungssh_info["status"]=True
							cheungssh_info["content"]=""	
							return cheungssh_info
				elif re.search(self.base_prompt,buff.split('\n')[-1]): 
					
					cheungssh_info["status"]=True
					return cheungssh_info
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	
	def su_login(self):
		cheungssh_info={"status":False,"content":""}
		try:
			if self.username=="root":raise CheungSSHError("您当前已经是超级管理员!")
			self.shell.send("su  - root\n")
			buff=''
			_buff=""
			while True:
				buff+=self.shell.recv(1024)
				if re.search("assword|密码",buff.split("\n")[-1]):
					self.shell.send("%s\n" %self.su_password)
					while True:
						_buff+=self.shell.recv(1024)
						if re.search("^su",_buff.split("\n")[-2]):
							raise CheungSSHError("su密码错误")
						elif re.search(self.base_prompt,_buff.split("\n")[-1]):
							cheungssh_info["status"]=True
							return  cheungssh_info 
							
				
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def set_prompt(self):
		
		self.shell.send("export PS1='[\u@\h]\$'\n")
		buff=''
		"""while not re.search(self.base_prompt,buff.split('\n')[-1]):
			_buff=self.shell.recv(1024)
			buff+=_buff"""
		
		while True:
			
			if self.shell.recv_ready():
				_buff=self.shell.recv(1024)
				buff+=_buff
			else:
				break
		self.prompt=re.escape(buff.split('\n')[-1])
		return buff
	def logout(self):
		try:
			self.channel.close()
			self.active=False
		except Exception,e:
			pass
		print "已经注销"
	def __del__(self):
		self.logout()
