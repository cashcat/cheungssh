#!/usr/bin/env python
#coding:utf8
#author:张其川

import sys,json,os,re,cheungssh_settings,cheungssh_modul_controler,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
from cheungssh_sshv2 import CheungSSH_SSH
class CheungSSHAppAdmin(object):
	def  __init__(self):
		pass
	@staticmethod
	def execute_app(appid,username,is_super):
		cheungssh_info={"content":[],"status":False}
		app_conf=False
		try:
			data=CheungSSHAppAdmin.get_app_list(username,is_super)
			if not data["status"]:
				raise CheungSSHError("读取应用配置出错！[%s]" %data["content"] )
			else:
				content=data["content"]
				app_conf=CheungSSHAppAdmin.check_appid_conf(content,appid)
				if not app_conf["status"]:
					raise CheungSSHError("该APP不存在! [%s]" % app_conf["content"])
				
				sid=app_conf["content"]["sid"]
				server_conf=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)
				if not server_conf["status"]:
					raise CheungSSHError("应用数据处理失败！%s"%server_conf["content"])
				
				CheungSSHAppAdmin.set_app_status("执行中","",appid)
				
				ssh=CheungSSH_SSH()
				tmp=ssh.login(**server_conf["content"])
				
				if not tmp["status"]:
					raise CheungSSHError(tmp["content"])
				
				command=app_conf["content"]["app_command"]
				check_command=app_conf["content"]["app_check_command"]

				command_result=ssh.execute(command,ignore=True)
				if re.search("echo *\$\? *$|^ *$",check_command):
					print "执行系统定义的检查命令"
					
					cheungssh_info=command_result
					print cheungssh_info,55555555555555555555
				else:
					check_command_result=ssh.execute(check_command)
					cheungssh_info["content"]= "%s </br> %s"  %(command_result["content"],check_command_result["content"])
					cheungssh_info["status"]=check_command_result["status"]
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		
		cheungssh_info["time"]=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		if cheungssh_info["status"]:
			cheungssh_info["status"]="成功"
			CheungSSHAppAdmin.set_app_status("成功",cheungssh_info["content"],appid)
		else:
			cheungssh_info["status"]="失败"
			CheungSSHAppAdmin.set_app_status("失败",cheungssh_info["content"],appid)
		return cheungssh_info
	@staticmethod
	def set_app_status(status,content,appid):
		
		try:
			modify_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data=REDIS.hgetall("CHB-R000000000210")
			for id in data.keys():
				tmp=json.loads(data[id])
				if str(tmp["id"])==str(appid):
					
					tmp["status"]=status
					tmp["time"]=modify_time
					
					tmp["content"]=content
					
					_tmp=json.dumps(tmp,encoding="utf8",ensure_ascii=False)
					REDIS.hset("CHB-R000000000210",appid,_tmp)
					break
		except Exception,e:
			print "更新app应用数据出错",str(e)
			pass
	@staticmethod
	def get_app_list(username,is_super):
		
		cheungssh_info={"content":[],"status":False}
		try:
			data=REDIS.hgetall("CHB-R000000000210")
			for id in data.keys():
				tmp=json.loads(data[id])
				if tmp["owner"]==username or  is_super:
					cheungssh_info["content"].append(tmp)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	@staticmethod
	def check_appid_conf(data,appid):
		
		cheungssh_info={"content":"","status":False}
		for line in data:
			if str(appid)==str(line["id"]):
				cheungssh_info["content"]=line
				cheungssh_info["status"]=True
				break
		return cheungssh_info
	@staticmethod
	def delete_app(appid,username,is_super):
		
		cheungssh_info={"content":[],"status":False}
		try:
			REDIS.hdel("CHB-R000000000210",appid)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
