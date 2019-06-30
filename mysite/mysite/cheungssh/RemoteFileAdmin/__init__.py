# coding:utf8
# Autor: 张其川


import sys
import re
import os
import random
import time
import json
from mysite.cheungssh.cheungssh_sshv2 import CheungSSH_SSH
from mysite.cheungssh.models import RemoteFile, RemoteFileHistoryVersion
from ServersInventory import ServersInventory

class RemoteFileAdmin(object):
	def __init__(self):
		pass
	def write_remote_file_content(self,request):
		cheungssh_info = {"status":False,"content":""}
		try:
			id = request.POST.get("id")
			content= request.POST.get("content")
			data = RemoteFile.objects.filter(id=id)
			info = ServersInventory().get_server(sid= data[0].sid)
			ssh = CheungSSH_SSH()
			tmp = ssh.login(**info["content"])
			if tmp["status"] is False:
				raise IOError(tmp["content"])
			tid = str(random.randint(1000000000,9999999999))
			back_path = os.path.join("/home/cheungssh/remote_files",tid)
			##### 备份一个版本
			if not os.path.isdir("/home/cheungssh/remote_files/"):
				os.mkdir("/home/cheungssh/remote_files")
			try:
				ssh.sftp.get(data[0].path, back_path)
				tmp = {
					"path":back_path,
					"create_time":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
					"username": request.user.username,
					"ip":request.META["REMOTE_ADDR"],
					"remote_file_id":data[0].id,
				}
				x=RemoteFileHistoryVersion(**tmp)
				x.save()
				data.update(tid=x.id)
			except Exception,e:
				back_path = data[0].path
				e = str(e)
				if re.search("No such file", e):
					pass
				else:
					if re.search("Permission denied",e):
						e = "该服务器账号无权操作该文件！"
					raise IOError(e)
			cheungssh_info = ssh.write_remote_file_content(data[0].path,content)
		except Exception,e:
			cheungssh_info = {"status":False,"content":str(e)}
		return cheungssh_info

	def get_remote_file_content(self,request):
		cheungssh_info = {"status":False,"content":""}
		try:
			id = request.GET.get("id")
			tmp = RemoteFile.objects.get(id=id)
			path = tmp.path
			sid = tmp.sid
			s = ServersInventory().get_server(sid= sid)
			ssh = CheungSSH_SSH()
			tmp = ssh.login(**s["content"])
			if tmp["status"] is False:
				raise IOError(tmp["content"])
			cheungssh_info = ssh.get_remote_file_content(path)
		except Exception,e:
			cheungssh_info = {"status":False,"content":str(e)}
		return cheungssh_info
	def create_path(self,request):
		cheungssh_info = {"status":False,"content":""}
		try:
			data = request.GET.get("data")
			data = json.loads(data)
			##### 查询是否有创建过的记录
			x= RemoteFile.objects.filter(path=data["path"],sid=data["sid"])
			if x.__len__() == 0:
				# 不存在则创建记录
				tmp = {
					"path":"",
					"create_time":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
					"username": request.user.username,
					"ip":request.META["REMOTE_ADDR"],
					"remote_file_id":0,
				}
				data["tid"] = 0
				a=RemoteFile(**data)
				a.save()
				tmp["remote_file_id"] = a.id
				b = RemoteFileHistoryVersion(**tmp)
				b.save()
				c = RemoteFile.objects.filter(id=a.id).update(tid=b.id)
				remote_file_id = a.id
			else:
				remote_file_id = x[0].id
			info = ServersInventory().get_server(sid=data["sid"])
			ssh = CheungSSH_SSH()
			SSH = ssh.login(**info["content"])
			if SSH["status"] is False:
				raise IOError(SSH["content"])
			##### 如果存在，直接返回内容供修改
			cheungssh_info = ssh.get_remote_file_content(data["path"])
			cheungssh_info["remote_file_id"] = remote_file_id
		except Exception,e:
			cheungssh_info["content" ] = str(e)
		return cheungssh_info
	def get_remote_file_list(self):
		cheungssh_info = {"status":True,"content":[]}
		info = RemoteFile.objects.all()
		for line in info:
			a_line = RemoteFileHistoryVersion.objects.get(id=line.tid)
			cheungssh_info["content"].insert(0,{
				"id":line.id,
				"username":a_line.username,
				"alias":line.alias,
				"sid":line.sid,
				"description":line.description,
				"create_time":a_line.create_time,
				"path":line.path,
				"ip":a_line.ip,
				"history_version":RemoteFileHistoryVersion.objects.filter(remote_file_id=line.id).__len__() - 1,
			})
		return cheungssh_info
	def get_remote_file_historic_list(self,request):
		cheungssh_info = {"status":True,"content":[]}
		remote_file_id = request.GET.get("id")
		data = RemoteFileHistoryVersion.objects.filter(remote_file_id=remote_file_id)
		tmp = RemoteFile.objects.get(id=remote_file_id)
		for line in data:
			if line.path == "":continue
			cheungssh_info["content"].insert(0,{
				"path":line.path,
				"username":line.username,
				"alias":tmp.alias,
				"sid":tmp.sid,
				"create_time":line.create_time,
				"ip":line.ip,
				"tid":line.id,
				"id":tmp.id,
			})
		return cheungssh_info
	def enable_remote_file_history_version(self, request):
		cheungssh_info = {"status":False,"content":""}
		try:
			id = request.GET.get("id")
			tid = request.GET.get("tid")
			tmp = RemoteFile.objects.filter(id=id)
			info = ServersInventory().get_server(sid=tmp[0].sid)
			ssh = CheungSSH_SSH()
			SSH = ssh.login(**info["content"])
			if SSH["status"] is False:
				raise IOError(SSH["content"])
			##### 恢复之前先备份
			back_path_b = os.path.join("/home/cheungssh/remote_files/",str(random.randint(1000000000,9999999999)))
			ssh.sftp.get(tmp[0].path,back_path_b)
			
			##### 恢复
			back_path_a = RemoteFileHistoryVersion.objects.get(id=tid).path
			ssh.sftp.put(back_path_a,tmp[0].path)
			##### 新增一个历史记录
			
			x=RemoteFileHistoryVersion(
				path=back_path_b,
				create_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
				username=request.user.username,
				ip=request.META["REMOTE_ADDR"],
				remote_file_id=id,
			)
			x.save()
			tmp.update(tid=tid) ###### 指向老的版本时间，而不是最新的
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info["content"] = str(e)
		return cheungssh_info
	def get_remote_file_historic_content(self,request):
		cheungssh_info = {"status":False,"content":""}
		try:
			tid = request.GET.get("tid")
			path = RemoteFileHistoryVersion.objects.get(id=tid).path
			with open(path,"rb") as f:
				cheungssh_info["content"] = f.read()
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info["content"] = str(e)
		return cheungssh_info
	def change_file_permission(self,request):
		cheungssh_info = {"status":False,"content":""}
		try:
			id = request.GET.get("id")
			permission=int(request.GET.get("permission"))
			s=RemoteFile.objects.get(id=id)
			path=s.path
			info = ServersInventory().get_server(sid= s.sid)
			ssh = CheungSSH_SSH()
			tmp = ssh.login(**info["content"])
			if tmp["status"] is False:
				raise IOError(tmp["content"])
			ssh.sftp.chmod(path,permission)
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			if re.search("No suce file",e):
				e ="该文件不存在，您需要先创建它才能修改其权限！"
			elif re.search("Permission denied",e):
				e = "您无权操作该文件的权限！"
			cheungssh_info["content"] = e
		return cheungssh_info
	def delete_remote_file_list(self, request):
		cheungssh_info = {"status":True,"content":""}
		id = request.GET.get("id")
		RemoteFile.objects.filter(id=id).delete()
		RemoteFileHistoryVersion.objects.filter(remote_file_id=id)
		return cheungssh_info
