#!/usr/bin/env python
#coding:utf8
#Author:张其川
import sys
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh/deployment_protocol")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh/")
from cheungssh_error import CheungSSHError
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_git import CheungSSHGit
from cheungssh_command import CheungSSHCommand
from cheungssh_script import CheungSSHScript
import cheungssh_deployment_admin
from cheungssh_localupload import CheungSSHLocalUpload
from cheungssh_svn import CheungSSHSVN
import cheungssh_modul_controler
class CheungSSHDeploymentControler(CheungSSHCommand):
	def __init__(self,tid):
		self.tid=tid
	def init_server_conf(self,sid):
		#####sid是服务器ID
		cheungssh_info={"status":False,"content":""}
		try:
			self.sid=sid
			conf=CheungSSHControler.convert_id_to_ip(sid)
			if not conf["status"] :raise CheungSSHError(conf["content"])
			self.conf=conf["content"]
			self.alias=self.conf["alias"]
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]="获取服务器配置错误 %s" % str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def svn(self,url="",username="",password="",dest_dir="",stepid=""):
		cheungssh_info={"status":False,"content":""}
		try:
			svn_admin=CheungSSHSVN()
			data=svn_admin.login(**self.conf)
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			cheungssh_info=svn_admin.checkout(url=url,username=username,password=password,dest_dir=dest_dir,tid=self.tid,stepid=stepid)
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def git(self,url,dest_dir,stepid):
		#####写入消息，需要tid，alias和stepid,tid是进度id
		cheungssh_info={"status":False,"content":""}
		try:
			git_admin=CheungSSHGit()
			data=git_admin.login_ssh(self.conf)#####判断SSH登录是否成功
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			cheungssh_info=git_admin.clone(url=url,dest_dir=dest_dir,taskid=self.tid,alias=self.alias,stepid=stepid)#####开始执行克隆
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def command(self,cmd,stepid):
		cheungssh_info={"status":False,"content":""}
		try:
			command_admin=CheungSSHCommand()#####实例化类
			data=command_admin.login(**self.conf)#####访问sshv2的方法
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			cheungssh_info=command_admin.execute(cmd,ignore=True)######执行远程命令
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
			command_admin.logout()
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def command_backup(self,source_command,dest_command,stepid):
		cmd="/bin/cp -r "
		cheungssh_info={"status":False,"content":""}
		try:
			command_admin=CheungSSHCommand()#####实例化类
			data=command_admin.login(**self.conf)#####访问sshv2的方法
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			cheungssh_info=command_admin.execute("{cmd} {source_command} {dest_command}".format(cmd=cmd,source_command=source_command,dest_command=dest_command),ignore=True)######执行远程命令
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
			command_admin.logout()
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def command_chown(self,path="",recursion=False,owner="",stepid=""):
		cheungssh_info={"status":False,"content":""}
		try:
			command_admin=CheungSSHCommand()#####实例化类
			data=command_admin.login(**self.conf)#####访问sshv2的方法
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			if recursion:
				cmd="chown -R {owner} {path}".format(owner=owner,path=path)
			else:
				cmd="chown    {owner} {path}".format(owner=owner,path=path)
			cheungssh_info=command_admin.execute(cmd,ignore=True)######执行远程命令
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
			command_admin.logout()
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def command_permission(self,path="",recursion=False,code=0700,stepid=""):
		cheungssh_info={"status":False,"content":""}
		try:
			command_admin=CheungSSHCommand()#####实例化类
			data=command_admin.login(**self.conf)#####访问sshv2的方法
			if not data["status"]:raise CheungSSHError(data["content"])#####登录失败，中断
			if recursion:
				cmd="chmod -R {code} {path}".format(code=code,path=path)
			else:
				cmd="chmod    {code} {path}".format(code=code,path=path)
			cheungssh_info=command_admin.execute(cmd,ignore=True)######执行远程命令
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
			command_admin.logout()
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info








	def script(self,sid="",sfile="",parameter="",owner="",stepid=""):
		cheungssh_info={"status":False,"content":""}
		try:
			script_admin=CheungSSHScript()
			cheungssh_info=script_admin.deployment_script_init_and_execute(sid,sfile,owner)
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def local_upload(self,sid="",sfile="",dfile="",owner="",stepid=""):
		cheungssh_info={"status":False,"content":""}
		try:
			host=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)
			if not host["status"]:raise CheungSSHError(host['content'])
			_host_info=host['content']
			sftp=CheungSSHLocalUpload(stepid)
			login=sftp.login(**_host_info)
			if not login["status"]:raise CheungSSHError(login["content"])
			cheungssh_info=sftp.upload(local_file=sfile,remote_file=dfile,tid=self.tid)
			if cheungssh_info["status"]:
				cheungssh_info["progress"]=100#####如果成功，则设定为100
				cheungssh_deployment_admin.DeploymentAdmin.set_progress(self.tid,stepid,cheungssh_info)
			
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
