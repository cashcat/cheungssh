#!/usr/bin/env python
#coding:utf8
import sys,json,os,re
import cheungssh_settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
from  cheungssh_file_transfer import CheungSSHFileTransfer
from cheungssh_modul_controler import CheungSSHControler
class RemoteFileAdmin(object):
	def __init__(self):
		pass
	@staticmethod
	def add_remote_file(owner='',path='',description='',server='',id='',alias=''):
		cheungssh_info={"status":False,"content":""}
		try:
			data={"owner":owner,"path":path,"description":description,"server":server,"id":id,"alias":alias}
			data=json.dumps(data,encoding="utf8",ensure_ascii=False)
			REDIS.hset("CSSH-R00000000001",id,data)
			cheungssh_info["tid"]=id
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		
		return cheungssh_info
	@staticmethod
	def get_remote_file_list(super,username):
		#####super是否是超级管理，username是资源归属,如果不是超管，不能给
		cheungssh_info={"status":False,"content":""}
		try:
			data=REDIS.hgetall("CSSH-R00000000001")
			info={}#####存放最终处理结果
			for id in data.keys():#####所有的id
				tmp=json.loads(data[id])
				if tmp["owner"] == username or super:
					#####如果是当前归属，或者是超级管理
					info[id]=tmp
				else:
					pass
					#####不匹配的跳过
			cheungssh_info["content"]=info
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def delete_remote_file_list(super,username,id):
		
		cheungssh_info={"status":False,"content":""}
		try:
			data=REDIS.hdel("CSSH-R00000000001",id)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def remote_file_content(super,username,id,action,file_content=""):
		#####username是那个用户请求
		cheungssh_info={"status":False,"content":""}
		try:
			data=RemoteFileAdmin.get_remote_file_list(super,username)
			if not data["status"]:raise CheungSSHError(data["content"])
			content=data["content"]
			try:
				######检查权限
				if not content[id]["owner"] == username:CheungSSHError("您无权查看该资源！")
			except KeyError:
					raise CheungSSHError("您指定的资源不存在！")
			path=content[id]["path"]
			path=re.sub(" ","",path)#####空格问题
			sid=content[id]["server"]######sid
			host_info=CheungSSHControler.convert_id_to_ip(sid)
			if not host_info["status"]:raise CheungSSHError(host_info["content"])
			host=host_info["content"]
			sftp=CheungSSHFileTransfer()
			login=sftp.login(**host)
			if not login["status"]:raise CheungSSHError(login["content"])
			if action=="GET":
				cheungssh_info=sftp.get_filecontent(path)
			elif action=="WRITE":
				cheungssh_info=sftp.write_filecontent(path,file_content)
			else:
				raise CheungSSHError("CHB0000000024")
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
