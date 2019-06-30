#coding:utf8

import sys
import json
import time
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
from models import ServiceOperationList, ScriptsList, ScriptsHistoricVersion
from django.db.models import Q

class ServiceOperation(object):
	def __init__(self,request):
		self.r = request
	def save_service_operation(self):
		cheungssh_info={"status":False,"content":""}
		try:
			data = self.r.POST.get("data")
			data = json.loads(data)
			data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			action = self.r.POST.get("action")
			id = data["id"]
			del data["id"]
			if action == "create":
				self.query_service_operation(data["name"])
				ServiceOperationList(**data).save()
			else:
				if ServiceOperationList.objects.filter(~Q(id=id),name = data["name"]).__len__() > 0:
					raise IOError("名称早已使用，请更换！")
				ServiceOperationList.objects.filter(id=id).update(**data)
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info["content"] = str(e)
		return cheungssh_info
	def query_service_operation(self,name):
		if ServiceOperationList.objects.filter(name=name).__len__() > 0: raise IOError("名称已经被适用，请更换一个！")
	def get_service_operation(self):
		cheungssh_info={"status":False,"content":[]}
		try:
			data = ServiceOperationList.objects.all()
			for line in data:
				_list = []
				x = json.loads(line.list)
				os = [] ##### 单独存放os
				for script_id in x:
					m = ScriptsList.objects.filter(id=script_id)
					if len(m) == 0:continue
					parameter = ScriptsHistoricVersion.objects.get(id=m[0].active_version).parameters
					_list.append({
						"script_id":script_id,
						"name":m[0].script_name,
						"os":m[0].os_type,
						"type":m[0].type,
						"parameter":json.loads(parameter)
					})
					os.extend(json.loads(m[0].os_type)),
				cheungssh_info["content"].append({
					"id":line.id,
					"name":line.name,
					"create_time":line.create_time,
					"description":line.description,
					"list":_list,
					"os":list(set(os)), ##### 前端只显示一个并集
				})
			cheungssh_info["status"] = True
		except Exception,e:
			cheungssh_info["content"] = str(e)
		return cheungssh_info
	def del_service_operation(self):
		cheungssh_info={"status":False,"content":""}
		try:
			id  =self.r.GET.get("id")
			ServiceOperationList.objects.filter(id=id).delete()
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
