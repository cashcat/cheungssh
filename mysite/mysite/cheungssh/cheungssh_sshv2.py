#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko
import functools
import socket
import re
import os
import sys
import json
import time
import cheungssh_settings
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
# sys.path.append('/home/cheungssh/mysite')
# sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
from django.core.cache import cache
REDIS=cache.master_client
reload(sys)  
sys.setdefaultencoding('utf8')

def set_progres(REDIS,tid, sid, transferred, toBeTransferred):
	progress = float(transferred)/float(toBeTransferred) * 100
	info={"status":True,"content":progress}
	info = json.dumps(info,encoding="utf8",ensure_ascii=False)
	REDIS.hset(tid,"progress.{sid}".format(sid=sid),info)
class CheungSSH_SSH(object):
	def __init__(self):
                self.base_prompt = '(^(\[|\)|<)[^#].+(>|#|\]|\$|\))|([yY]/[nN](\]|\))[:：\?\？]+)|^mysql>|密码：|[pP]assword:) *$'
		
		self.prompt=""
		self.more_flag = '(< *)?(\-)+( |\()?[Mm]ore.*(\)| )?(\-)+( *>)?|\(Q to quit\)'
	def login(self,**kws):
		cheungssh_info={"status":False,"content":""}
		self.kws=kws
		try:
			self.owner=kws["owner"]
			self.su=kws["su"]
			self.sudo=kws["sudo"]
			self.username=kws["username"]
			self.password=kws["password"]
			self.port=kws["port"]
			self.ip=kws["ip"]
			self.sudo=kws["sudo"]
			self.sudo_password=kws["sudo_password"]
			self.su=kws["su"]
			self.su_password=kws["su_password"]
			self.port = int(self.port)
			self.os_type=kws["os_type"]
			self.sid=kws["id"]
			ssh = paramiko.SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
			ssh.connect(self.ip,self.port,self.username,self.password)
			self.channel=ssh
			self.sftp = self.channel.open_sftp()
			self.shell = ssh.invoke_shell(width=1000,height=1000)
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
                        else:cheungssh_info["content"]="认证类型应该是秘钥"
		except Exception,e:
			e=str(e)
			if re.search(re.escape("Error reading SSH protocol banner[Errno 104] Connection reset by peer"),e):
				cheungssh_info['content'] = "该服务器设置了SSH阻止连接，请查看/etc/hosts.deny配置文件。"
			elif re.search(re.escape("Incompatible ssh peer (no acceptable kex algorithm)"),e):
				cheungssh_info['content'] = "该服务器的SSH加密算法不支持SSH连接，请联系CheungSSH获得配置。"
			else:
				if re.search("^ *$",e):
					e = "登陆失败，原因未知"
				cheungssh_info['content'] = e
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
		while (not re.search(self.base_prompt,re.sub("\\x1b\[m","",buff.split('\n')[-1]))) :
			time.sleep(0.1)
			_buff=self.shell.recv(20480)
			buff+=_buff
			if re.search(self.more_flag, buff.split("\r\n")[-1]):
				self.shell.send(" ")
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
			#self.shell.send('\n')
			#time.sleep(0.5)
			buff=""
			while not re.search(self.base_prompt, buff.split("\r\n")[-1]) :
				buff+=self.shell.recv(512)
			cheungssh_info["status"]=True
		except Exception,e:
			
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def execute(self,cmd='',sid="",tid="",ignore=False):
		cheungssh_info={"status":False,"content":""}
		log_content={ 	
			"content":"",
			"stage":"done",      
			"status":True,          
		}
		log_name=  "log.%s.%s"  %(tid,sid)   
		result = ""
		
		try:
			#data=self.clean_buffer()
			#if not data["status"]:raise CheungSSHError(data["content"]) 
			
			
			#self.set_prompt()
			# 删除开头的空格
			cmd = re.sub("^ *","",cmd)
			CMD=cmd.split()
			_top = os.path.basename(CMD[0])
			if _top == "top":
				
				CMD[0] = CMD[0] + " -b"
				cmd = " ".join(CMD)
			if cmd == "BREAK-COMMAND":
				self.shell.send(chr(3))
				
			else:
				try:
					cmd_list = json.loads(cmd)
					if isinstance(cmd_list,list) is False:
						raise IOError("none")
				except Exception,e:
					cmd_list = [cmd]
				for cmd in cmd_list:
					print  "cmd is",cmd
					self.shell.send("%s\n"%cmd)
					result = self.recv(sid=sid,tid=tid)
			#self.shell.send("echo $?\n")
			#_status=self.recv(sid=sid,tid=tid,ignore=True)
			#status=re.findall('echo \$\?\\r\\n(\d+)',_status)
			#status=int(status[0])
			#if status==0:
			#	cheungssh_info["status"]=True
			#	log_content["status"]=True 
			#else:
			#	cheungssh_info["status"]=False
			#REDIS.rpush("command.logs",cheungssh_info)
			cheungssh_info = {"status":True,"content":result}
		except Exception,e:
			print "执行命令发生错误",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"] =  str(e)
		_log_content=json.dumps(log_content,encoding="utf-8",ensure_ascii=False)
		
		REDIS.rpush(log_name,_log_content)
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
				if re.search('(\[sudo\] password for {username})|(\[sudo\] {username}.*((assw(or)?d)|密码))'.format(username=self.username),buff.split('\n')[-1]):
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
						if re.search("^su",_buff.split("\n")[-2]) or re.search("Authentication",_buff.split("\n")[-2]):
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
			time.sleep(2)
			if self.shell.recv_ready():
				_buff=self.shell.recv(1024)
				buff+=_buff
			else:
				break
		self.prompt=re.escape(buff.split('\n')[-1])
		return buff
	def sftp_download(self,tid,sid,source,destination):
		#destination ="/home/cheungssh/download/test/远程.96457938362457704513.aa"
		callback_info = functools.partial(set_progres,REDIS,tid,sid)
		cheungssh_info={"status":False,"content":""}
		try:
			self.sftp.get(source,destination,callback=callback_info)
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
			cheungssh_info = json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False)
			REDIS.hset(tid,"progress.{sid}".format(sid=sid),cheungssh_info)
		return cheungssh_info

	def sftp_upload(self,tid,sid,source,destination):
		callback_info = functools.partial(set_progres,REDIS,tid,sid)
		cheungssh_info={"status":False,"content":""}
		try:
			self.sftp.put(source,destination,callback=callback_info)
			self.sftp.chmod(destination,7)
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
			cheungssh_info = json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False)
			REDIS.hset(tid,"progress.{sid}".format(sid=sid),cheungssh_info)
		return cheungssh_info

	def get_remote_file_content(self, path):
		cheungssh_info={"status":False,"content":""}
		try:
			self.sftp.chdir(os.path.dirname(path))
		except Exception,e:
			cheungssh_info["content"] = "该文件夹不存在，请确认！"
			return cheungssh_info
		try:
			with self.sftp.open(path) as f:
				content = f.read()
			cheungssh_info = {"content":content, "status":True,"existing":True}
		except Exception,e:
			ask = False
			status = False
			e = str(e)
			if re.search("Permission denied",e):
				content = "权限拒绝，您无权操作该文件!"
			elif re.search("No such file",e):
				content= "该文件不存在，您确定要创建它吗？"
				ask = True
				status = True
			else:
				content = e
			cheungssh_info={"status":status,"content": content,"ask":ask}
		return cheungssh_info
	def write_remote_file_content(self, path,content):
		cheungssh_info={"status":False,"content":""}
		try:
			with self.sftp.open(path,"wb") as f:
				f.write(content)
			cheungssh_info["status"] = True
		except Exception,e:
			content = str(e)
			if re.search("Permission denied",content):
				content = "权限拒绝，您无权操作该文件!"
			cheungssh_info["content"] = content
		return cheungssh_info
			
	def logout(self):
		try:
			self.channel.close()
		except Exception,e:
			pass
		print "已经注销"
	def __del__(self):
		self.logout()
