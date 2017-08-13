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
		app_conf=False#####设置默认的值，下面要对这个进行判断
		try:
			data=CheungSSHAppAdmin.get_app_list(username,is_super)#####获取全部app数据，
			if not data["status"]:
				raise CheungSSHError("读取应用配置出错！[%s]" %data["content"] )
			else:
				content=data["content"]
				app_conf=CheungSSHAppAdmin.check_appid_conf(content,appid)#####查询app对应的配置信息
				if not app_conf["status"]:
					raise CheungSSHError("该APP不存在! [%s]" % app_conf["content"])
				#####得到了数据,获取sid
				sid=app_conf["content"]["sid"]#####数据格式为alias，sid，command等
				server_conf=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)#####获取服务器的配置
				if not server_conf["status"]:
					raise CheungSSHError("应用数据处理失败！%s"%server_conf["content"])
				#####在开始之前，修改app状态
				CheungSSHAppAdmin.set_app_status("执行中","",appid)
				#####成功获取服务器配置信息，开始登录
				ssh=CheungSSH_SSH()
				tmp=ssh.login(**server_conf["content"])
				#####检查是否登录成功
				if not tmp["status"]:
					raise CheungSSHError(tmp["content"])
				#####ssh登录成功了
				command=app_conf["content"]["app_command"]#####app的命令
				check_command=app_conf["content"]["app_check_command"]#####检查命令

				command_result=ssh.execute(command,ignore=True)#####APP的执行结果
				if re.search("echo *\$\? *$|^ *$",check_command):
					print "执行系统定义的检查命令"
					#####如果前端设定的检查命令是echo $?或者为空,则默认使用命令执行的结果;
					cheungssh_info=command_result
					print cheungssh_info,55555555555555555555
				else:
					check_command_result=ssh.execute(check_command)#####app执行后检查命令的结果
					cheungssh_info["content"]= "%s </br> %s"  %(command_result["content"],check_command_result["content"])#####把执行命令和命令检查的结果叠加在一起
					cheungssh_info["status"]=check_command_result["status"]#####把命令检查的状态设定为命令最终执行的状态
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		#####修改app应用的数据内容
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
		#####修改应用的状态：成功/失败/运行中，执行时间，app消息
		try:
			modify_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data=REDIS.hgetall("CHB-R000000000210")
			for id in data.keys():#####转换为dict
				tmp=json.loads(data[id])
				if str(tmp["id"])==str(appid):
					#####找到对等的id
					tmp["status"]=status#####值是：成功/失败/运行中
					tmp["time"]=modify_time#####修改时间
					#####更新内容
					tmp["content"]=content
					#####重写数据
					_tmp=json.dumps(tmp,encoding="utf8",ensure_ascii=False)
					REDIS.hset("CHB-R000000000210",appid,_tmp)
					break
		except Exception,e:
			print "更新app应用数据出错",str(e)
			pass#####这里发生的错误，忽略
	@staticmethod
	def get_app_list(username,is_super):
		######获取全部应用列表
		cheungssh_info={"content":[],"status":False}
		try:
			data=REDIS.hgetall("CHB-R000000000210")
			for id in data.keys():#####转换为dict
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
		#####在应用列表中提取对应的appid的配置信息
		cheungssh_info={"content":"","status":False}
		for line in data:
			if str(appid)==str(line["id"]):
				cheungssh_info["content"]=line
				cheungssh_info["status"]=True
				break
		return cheungssh_info
	@staticmethod
	def delete_app(appid,username,is_super):
		######删除app
		cheungssh_info={"content":[],"status":False}
		try:
			REDIS.hdel("CHB-R000000000210",appid)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
