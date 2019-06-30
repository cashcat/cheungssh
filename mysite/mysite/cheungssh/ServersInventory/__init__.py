# encoding:utf8
import sys
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh/")
from cheungssh_system_version.cheungssh_os import CheungSSHOSVersion
import random
import json
from models import ServersList
from cheungssh_error import CheungSSHError
from django.db.models import Q
from models import ScriptsList


class ServersInventory(object):
	def __init__(self):
		self.cheungssh_info = {"status":False,"content":""}
		pass

	def add_server(self, **kws):
		try:
			
			if self.query_server(alias=kws["alias"])["status"]:
				raise CheungSSHError("别名【{alias}】早已存在，请更换。".format(alias=kws["alias"]))
			
			configuration = ServersList(**kws)
			configuration.save()
			self.cheungssh_info= {"content":configuration.id,"status":True}
		except Exception,e:
			self.cheungssh_info= {"status":False,"content":str(e)}
		return self.cheungssh_info

	def modify_server(self, **kws):
		
		if len(ServersList.objects.filter(~Q(id  = int(kws["id"]) )  ,alias=kws["alias"]))>0:
			
			self.cheungssh_info={"content":("别名【{alias}】早已存在，请更换。".format(alias=kws["alias"])),"status":False}
			return self.cheungssh_info
		configuration = ServersList.objects.filter(id=kws["id"])
		if kws["su_password"] is None:
			del kws["su_password"]
		if kws["sudo_password"] is None:
			del kws["sudo_password"]
		if kws["password"] is None:
			del kws["password"]
		del kws["id"]
		configuration.update(**kws)
		return {"status":True,"content":""}
		
	def get_server(self, owner=None,sid=None):
		cheungssh_info={"status":True,"content":[]}
		if owner is not None:
			tmp = ServersList.objects.filter(owner=owner)
		else:
			tmp = ServersList.objects.all()
		for line in tmp:
			cheungssh_info["content"].append({
				"id":line.id,
				"ip":line.ip,
				"username":line.username,
				"port":line.port,
				"group":line.group,
				"owner":line.owner,
				"sudo":line.sudo,
				"su":line.su,
				"status":line.status,
				"os_type":line.os_type,
				"alias":line.alias,
				"description":line.description,
				"password":line.password,
				"sudo_password":line.sudo_password,
				"su_password":line.su_password,
			})
		for line in cheungssh_info["content"]:
			
			if sid is not None and str(sid) == str(line["id"]):
				cheungssh_info["content"]=line
				break
		if (sid is not None) and isinstance(cheungssh_info["content"],list):raise IOError("服务器不存在.")
		cheungssh_info["status"] = True
		return cheungssh_info

	def delete_server(self, hosts=[], owner=None, is_super=False):
		if is_super is True:
			ServersList.objects.filter(id__in=hosts).delete()
		else:
			ServersList.objects.filter(id__in=hosts,owner=owner).delete()
		return {"status":True,"content":""}
			
	def query_server(self,**kws):
		if len(ServersList.objects.filter(**kws))>0:
			self.cheungssh_info["status"] = True
		else:
			self.cheungssh_info["status"] = False
		return self.cheungssh_info
	def get_server_groups(self,script_id=None,all_os=None):
		cheungssh_info={"status":True,"content":[{
					"id":0,
					"pid":999999999,
					"name":"CheungSSH",
					"jingle":"",
					"sort":1,
					"href":"javascript:;",
					"level":1,
					"icon":"icon-lock",
					"status":1,
					"create_time":0,
					"update_time":0,
					"children":[],
		}]}
		data = ServersList.objects.all()
		groups ={}
		for line in data:
			
			if groups.has_key(line.group):
				continue
			else:
				groups[line.group]={
					"id":random.randint(111111,999999),
					"pid":0,
					"name":line.group,
					"jingle":"",
					"href":"",
					"level":2,
					"sort":groups.keys().__len__()+1,
					"icon":"",
					"status":1,
					"create_time":0,
					"update_time":0,
					"children":[],

				}
		if script_id is not None:
			os_type = ScriptsList.objects.get(id=script_id).os_type
		else:
			if all_os is None:
				os_type = CheungSSHOSVersion.os_type
			else:
				os_type = json.loads(all_os)
			os_type = [x.lower() for x in os_type]
		for line in data:
			
			if not line.os_type.lower() in os_type:
				continue
			groups[line.group]["children"].append({
					"id":line.id,
					"pid":groups[line.group]["id"],
					"name":line.alias,
					"jingle":"",
					"href":"",
					"sort":groups[line.group]["children"].__len__()+1,
					"level":3,
					"icon":"",
					"status":0,
					"create_time":0,
					"update_time":0,
					"children":[],
			})
		cheungssh_info["content"][0]["children"] = groups.values()
		return cheungssh_info
	def get_server_alias(self, servers):
		cheungssh_info={"status":False,"content":[]}
		if not isinstance(servers,list):servers = json.loads(servers)
		try:
			for sid in servers:
				sid = sid.split(".")[-1]
				data = ServersList.objects.get(id=sid)
				cheungssh_info["content"].append({
						"sid":sid,
						"username":data.username,
						"alias":data.alias,
					})
			cheungssh_info["status"] = True	
		except Exception,e:
			cheungssh_info={"status":False,"content":"部分服务器不存在！"}
		return cheungssh_info
		
