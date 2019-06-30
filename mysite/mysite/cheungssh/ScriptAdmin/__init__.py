#coding:utf8
#Author 张其川

import random
from jinja2 import Template
import json
import hashlib
import shutil
import time
import sys
import threading
import Queue
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh/")
from models import ScriptsList
from models import ScriptsHistoricVersion
from cheungssh_settings import *
from django.db.models import Q
from cheungssh_system_version.cheungssh_os import CheungSSHOSVersion
from ServersInventory import ServersInventory
from cheungssh_sshv2 import CheungSSH_SSH
from django.contrib.auth.models import User
from BlackListAdmin import MatchBlackList
from cheungssh_sshv2 import set_progres


class ScriptThreading(threading.Thread):
	def __init__(self,queue,tid,REDIS,source,destination):
		threading.Thread.__init__(self)
		self.REDIS=REDIS
		self.tid=tid
		self.source=source
		self.destination=destination
		self.queue = queue
	def run(self):
		while True:
			if self.queue.empty():
				break
			kws = self.queue.get()
			self.sid = kws["id"]
			ssh = CheungSSH_SSH()
			info = ssh.login(**kws)
			if info["status"] is False:
				info = json.dumps(info,encoding="utf8",ensure_ascii=False)
				self.REDIS.hset(self.tid,"progress.{sid}".format(sid=self.sid),info)
				continue
			try:
				ssh.sftp_upload(self.tid,self.sid,self.source,self.destination)
			except Exception,e:
				info = {"content":str(e),"status":False}
				info = json.dumps(info,encoding="utf8",ensure_ascii=False)
				self.REDIS.hset(self.tid,"progress.{sid}".format(sid=self.sid),info)
			self.queue.task_done()

class ScriptAdmin(object):

	def __init__(self,r,REDIS):
		self.cheungssh_info = {"status":False,"content":""}
		self.r = r
		self.REDIS = REDIS
	def rewrite_script_content(self):
		cheungssh_info={"content":"","status":False}
		##### 修改脚本
		parameter = self.r.POST.get("parameters")
		try:
			parameter = json.loads(parameter)
			version = time.strftime("%Y.%m.%d.%H:%M:%S_{version}".format(version=random.randint(1000000,9999999)),time.localtime())
			new_path = os.path.join(script_dir,version)
			create_time = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			if parameter.has_key("id"):
				a = ScriptsList.objects.filter(id=parameter["id"])
			else:
				a = ScriptsList.objects.filter(script_name=parameter["script_name"])
			b = ScriptsHistoricVersion.objects.get(id=a[0].active_version)
			is_changed = False
			if not parameter.has_key("parameters"):
				##### 只修改内容
				##### 判断内容是否有变化
				with open(b.path) as f:
					old_content = f.read()
				if not self.md5sum(parameter["content"]) == self.md5sum(old_content):
					with open(new_path,"w") as f:
						f.write(parameter["content"])
					is_changed = True
					comment = "脚本内容变动"
				path = new_path
				p = b.parameters
			else:
				##### 检查脚本名是否已存在
				if ScriptsList.objects.filter(~Q(id=a[0].id),script_name=parameter["script_name"]).__len__()>0:
					raise IOError("脚本名已经存在，请重新指定。")
				parameter["os_type"] = json.dumps(parameter["os_type"])
				p= json.dumps(parameter["parameters"])
				##### 判断脚本参数是否发生变化
				if not b.parameters == p:
					is_changed = True
					comment = "参数变动"
				path = b.path
			if parameter.has_key("content"):del parameter["content"]
			if parameter.has_key("parameters"):del parameter["parameters"]
			if is_changed == True:
				##### 创建新版本
				c = ScriptsHistoricVersion(sid=a[0].id,path=path,create_time=create_time,owner=self.r.user.username,active=True,version=version,parameters=p,comment=comment)
				c.save()
				##### 把其他版本标记为不活跃
				ScriptsHistoricVersion.objects.filter(~Q(id=c.id),sid=a[0].id   ).update(active=False)
				#####更新版本指向
				parameter["active_version"] = c.id
			if parameter.has_key("id"):del parameter["id"]
			a.update(**parameter)
			self.cheungssh_info["status"] = True
		except Exception,e:
			print e,"错误"
			self.cheungssh_info["content"] = str(e)
		return self.cheungssh_info
	def update_script_content(self):
		cheungssh_info={"status":False,"content":""}
		try:
			data = self.r.POST.get("data")
			data = json.loads(data)
			version = time.strftime("%Y.%m.%d.%H:%M:%S_{version}".format(version=random.randint(1000000,9999999)),time.localtime())
			new_path= os.path.join(script_dir,version).encode('utf8')
			tmp = ScriptsList.objects.filter(script_name=data["script_name"])
			active_version = tmp[0].active_version
			old_path = ScriptsHistoricVersion.objects.get(id=active_version).path
			with open(old_path) as f:
				old_content = f.read()
			if not self.md5sum(data["content"]) == self.md5sum(old_content):
				##### 内容不一致，需要更新版本
				with open(path,"w") as f:
					f.write(data["content"])
				##### 创建一条记录
				create_time = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
				ScriptsHistoricVersion(sid=tmp[0].sid,path=new_path,create_time=create_time,owner=self.r.user.username,active=True,)
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info

	def md5sum(self,content):
		m = hashlib.md5()
		m.update(content.encode('utf8'))
		return m.hexdigest()
		
	def create_script(self):
		parameter = self.r.POST.get("parameters")
		try:
			version = time.strftime("%Y.%m.%d.%H:%M:%S_{version}".format(version=random.randint(1000000,9999999)),time.localtime())
			parameter = json.loads(parameter)
			if self.script_exist(parameter["script_name"]):
				raise IOError("该脚本名已经存在，请更换。")
			if not os.path.isdir(script_dir):
				os.mkdir(script_dir)
			path= os.path.join(script_dir,version)
			parameter["os_type"] =    json.dumps(parameter["os_type"])
			p = json.dumps(parameter["parameters"])
			del parameter["parameters"]
			###### 这里的active表示引用版本表的第几条,下述还需修改
			parameter["active_version"] = 0
			with open(path.encode('utf8'),"wb") as f:
				f.write(parameter["content"])
			del parameter["content"]
			a=ScriptsList(**parameter)
			a.save()
			parameter["id"] = a.id
			parameter["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			parameter["path"] = path
			parameter["owner"] = self.r.user.username
			##### 这里的active表示是否活动
			parameter["active"] = True
			parameter["sid"] = a.id
			parameter["version"] = version
			parameter["parameters"] = p
			del parameter["script_name"]
			del parameter["active_version"]
			del parameter["os_type"]
			del parameter["description"]
			del parameter["script_group"]
			del parameter["type"]
			b = ScriptsHistoricVersion(**parameter)
			b.save()
			##### 更新关联版本记录
			ScriptsList.objects.filter(id=a.id).update(active_version=b.id)
			self.cheungssh_info["content"]=self.get_all_scripts(sid=a.id)["content"][0]
			self.cheungssh_info["status"] = True
		except Exception,e:
			print e,"错误"
			self.cheungssh_info["content"] = str(e)
		return self.cheungssh_info
	def get_all_scripts(self,sid=None):
		self.cheungssh_info["content"] = []
		if sid is None:
			t=ScriptsList.objects.all()
		else:
			t=ScriptsList.objects.filter(id=sid)
		for line in t:
			x= ScriptsHistoricVersion.objects.get(id=line.active_version)
			self.cheungssh_info["content"].insert(0,{
				"id":line.id,
				"script_name":line.script_name,
				"script_group":line.script_group,
				"type":line.type,
				"parameters":x.parameters,
				"owner":x.owner,
				"os_type":line.os_type,
				"create_time":x.create_time,
				"description":line.description,
				"historic_version": ScriptsHistoricVersion.objects.filter(sid=line.id).__len__(),
				"version":x.version,
				"executable":line.executable,
			})
		self.cheungssh_info["status"] = True
		return self.cheungssh_info
	def get_script_content(self,script_name):
		active_version = ScriptsList.objects.get(script_name=script_name).active_version
		path = ScriptsHistoricVersion.objects.get(id=active_version).path
		try:
			with open(path,"r") as f:
				self.cheungssh_info["content"] = f.read()
			self.cheungssh_info["status"] = True
		except Exception,e:
			self.cheungssh_info["content"]= str(e)
		return self.cheungssh_info
	def script_exist(self,script_name):
		if ScriptsList.objects.filter(script_name=script_name).__len__() >1:
			return True
		else:
			return False
		
	def delete_script(self,script_name):
		a=ScriptsList.objects.filter(script_name=script_name)
		sid = a[0].id
		a.delete()
		b=ScriptsHistoricVersion.objects.filter(sid=sid)
		for line in b:
			if os.path.isfile(line.path):
				os.remove(line.path)
		b.delete()
		self.cheungssh_info={"status":True,"content":""}
		return self.cheungssh_info
	def get_scripts_historic_list(self):
		cheungssh_info={"status":True,"content":[]}
		data = ScriptsHistoricVersion.objects.filter(sid=self.r.GET.get("sid"))
		x = ScriptsList.objects.get(id=self.r.GET.get("sid"))
		for line in data:
			cheungssh_info["content"].insert(0,{
				"id":line.id,
				"script_name":x.script_name,
				"create_time":line.create_time,
				"owner":line.owner,
				"active":line.active,
				"version":line.version,
				"parameters":line.parameters,
				"os_type":x.os_type,
				"script_group":x.script_group,
				"comment":line.comment,
				"type":x.type,
			})
		
		return cheungssh_info
	def set_script_active_version(self):
		cheungssh_info={"status":True,"content":""}
		a=ScriptsHistoricVersion.objects.filter(id=int(self.r.GET.get("id")))
		a.update(active=True)
		####### 更改其他记录为不活跃
		ScriptsHistoricVersion.objects.filter(~Q(id=a[0].id),sid=a[0].sid).update(active=False)
		##### 更新关联记录
		ScriptsList.objects.filter(id=a[0].sid).update(active_version=a[0].id)
		return cheungssh_info
	def get_script_historic_content(self):
		cheungssh_info={"status":False,"content":""}
		try:
			path=ScriptsHistoricVersion.objects.get(id=self.r.GET.get("id")).path
			with open(path) as f:
				cheungssh_info["content"] = f.read()
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info

	def get_script_historic_parameters(self):
		cheungssh_info={"status":False,"content":{}}
		try:
			tmp_a=ScriptsHistoricVersion.objects.get(id=self.r.GET.get("id"))
			tmp_b=ScriptsList.objects.get(id=tmp_a.sid)
			cheungssh_info["content"]={
				"parameters":tmp_a.parameters,
				"script_name":tmp_b.script_name,
				"script_group":tmp_b.script_group,
				"description":tmp_b.description,
				"fixed_os_type":CheungSSHOSVersion.os_type,
				"os_type":json.loads(tmp_b.os_type),
				"type":tmp_b.type,
			}
			
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	def change_executable_status(self):
		cheungssh_info={"status":False,"content":{}}
		try:
			id = self.r.GET.get("id")
			a=ScriptsList.objects.filter(id=id)
			if a[0].executable is True:
				status = False
			else:
				status = True
			a.update(executable=status)
			cheungssh_info={"status":True,"content":status}
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	def get_script_parameter(self):
		cheungssh_info={"status":False,"content":""}
		try:
			script_id = self.r.GET.get("script_id")
			data = ScriptsHistoricVersion.objects.get(sid=script_id,active=True)
			if ScriptsList.objects.get(id=script_id).executable is False:
				raise IOError("脚本状态不可用")
			cheungssh_info["content"] = json.loads(data.parameters)
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	def init_script_for_service_operation(self):
		cheungssh_info={"status":False,"content":""}
		try:
			queue = Queue.Queue()
			servers = self.r.POST.get("servers")
			servers = json.loads(servers)
			scripts = self.r.POST.get("scripts")
			scripts = json.loads(scripts)
			parameter = self.r.POST.get("parameter")
			parameter = json.loads(parameter) ##### [{},{}]
			db= ServersInventory()
			QQ = db.get_server_alias(servers)
			if QQ["status"]  is False:raise IOError(QQ["content"])
			tid = str(random.randint(100000000000000,999999999999999))
			destination = "/tmp/." + tid
			##### 存放每一个服务器对应的命令
			ALL_CMD = {}
			for s in servers:
				conf = db.get_server(sid=s)
				if not conf["status"]:raise IOError(conf["content"])
				##### 为单个服务器寻找合适的脚本/批量命令
				for script_id in scripts:
					path = ScriptsHistoricVersion.objects.get(sid=script_id,active=True).path
					info = ScriptsList.objects.get(id=script_id)
					if not conf["content"]["os_type"] in json.loads(info.os_type):continue
					source = path
					##### 打开文件用来检查是否有黑名单规则
					f = open(source)
					uid = User.objects.get(username=self.r.user.username).id
					for cmd in f:
						cmd = cmd.strip()
						black_list = MatchBlackList().match(cmd,uid)
						if black_list["status"] is False:raise IOError(black_list["content"])
					f.close()
					##### 打开文件用来检查是否有黑名单规则
					_type = ScriptsList.objects.get(id=script_id).type
					if _type == u"批量命令":
						tmp = self.parse_shell_as_cmd(source,parameter,self.r.user.username)
						#cheungssh_info["servers"] = QQ["content"]
						#return cheungssh_info
						# 此处设置进度
						if tmp["status"]  is False:
							raise IOError(tmp["content"])
						else:
							ALL_CMD[s] = tmp["cmd"]
							set_progres(self.REDIS,tid,s,100,100)
					else:
						cmd = destination + " "
						for k_v in parameter:
							###### 为什么呢？因为当是脚本的时候，这里的参数可能是位置变量，所以不能直接用dict
							value = k_v["value"]
							cmd += str(value) + " "
						ALL_CMD[s] = cmd
						##### 上传脚本队列
						queue.put(conf["content"])
			for i in range(10):
				a=ScriptThreading(queue,tid,self.REDIS,source,destination)
				a.start()
			self.REDIS.hset(tid,"all_server_num",len(servers))
			self.REDIS.hset(tid,"servers",json.dumps(servers))
			cheungssh_info={"status":True,"content":tid,"cmd":ALL_CMD,"servers":QQ["content"]}
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	def init_script(self):
		cheungssh_info={"status":False,"content":""}
		try:
			queue = Queue.Queue()
			servers = self.r.POST.get("servers")
			servers = json.loads(servers)
			script_id = self.r.POST.get("script_id")
			parameter = self.r.POST.get("parameter")
			parameter = json.loads(parameter) ##### [{},{}]
			db= ServersInventory()
			QQ = db.get_server_alias(servers)
			for s in servers:
				tmp = db.get_server(sid=s)
				if not tmp["status"]:raise IOError(tmp["content"])
				queue.put(tmp["content"])
			tid = str(random.randint(100000000000000,999999999999999))
			source = ScriptsHistoricVersion.objects.get(sid=script_id,active=True).path
			f = open(source)
			uid = User.objects.get(username=self.r.user.username).id
			for cmd in f:
				cmd = cmd.strip()
				tmp = MatchBlackList().match(cmd,uid)
				if tmp["status"] is False:
					raise IOError(tmp["content"])
			f.close()
			_type = ScriptsList.objects.get(id=script_id).type
			if _type == u"批量命令":
				cheungssh_info = self.parse_shell_as_cmd(source,parameter,self.r.user.username)
				cheungssh_info["type"] = _type
				if QQ["status"]  is False:raise IOError(QQ["content"])
				cheungssh_info["servers"] = QQ["content"]
				return cheungssh_info
			destination = "/tmp/." + tid
			for i in range(5):
				a=ScriptThreading(queue,tid,self.REDIS,source,destination)
				a.start()
			self.REDIS.hset(tid,"all_server_num",len(servers))
			self.REDIS.hset(tid,"servers",json.dumps(servers))
			cmd = destination + " "
			for k_v in parameter:
				###### 为什么呢？因为当是脚本的时候，这里的参数可能是位置变量，所以不能直接用dict
				value = k_v["value"]
				cmd += str(value) + " "
			cheungssh_info={"status":True,"content":tid,"cmd":cmd,"type":_type,"servers":QQ["content"]}
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	def parse_shell_as_cmd(self,path,parameter,username):
		cheungssh_info={"status":False,"cmd":[],"content":""}
		with open(path) as f:
			data = f.read()
		parameters = {}
		for k_v in parameter:
			###### 为什么呢？因为当是脚本的时候，这里的参数可能是位置变量，所以不能直接用dict
			key = k_v["key"]
			value = k_v["value"]
			parameters[key] = value
		try:
			for line in data.split("\n"):
				cheungssh_info["cmd"].append( Template(line).render(parameters) )
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info={"status":False,"content":"模板中的变量写法不正确，不能完成本次初始化，请确认批量命令中的变量格式是否正确: %s" % str(e)}
		return cheungssh_info
			
		
		
	def get_script_init_progress(self,tid):
		cheungssh_info={"status":True,"content":"","whole_progress":0,"progress":{}}
		data = self.REDIS.hgetall(tid)
		if data is None:
			return {"status":false,"content":"您要访问的资源不存在。"}
		all_server_num = int(data["all_server_num"])
		progress = 0
		servers = json.loads(data["servers"])
		for sid in servers:
			key = "progress.%s" % sid
			if not data.has_key(key):continue
			info = data[key]
			print info,1111111111111
			info = json.loads(info)
			if info["status"] is False:
				progress += 100
			else:
				progress += int(info["content"])
			cheungssh_info["progress"][key] = json.loads(data[key])
		whole_progress = float(progress) / float(all_server_num)
		if whole_progress == 100:
			self.REDIS.delete(tid)
		cheungssh_info["whole_progress"] = whole_progress
		return cheungssh_info
