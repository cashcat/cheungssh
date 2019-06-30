#coding:utf8
import sys
import json
import time
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
from models import BatchShellList


class BatchShellAdmin(object):
	def __init__(self):
		pass
	def save_batch_shell_configuration(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			data = request.POST.get("data")
			data = json.loads(data)
			action = request.POST.get("action",None)
			data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data["username"] = request.user.username
			data["os_type"] = json.dumps(data["os_type"])
			if action == "update":
				id = request.POST.get("id")
				BatchShellList.objects.filter(id=id).update(**data)
			else:
				BatchShellList(**data).save()
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def get_batch_shell_list(self,request):
		cheungssh_info={"status":False,"content":[]}
		try:
			data = BatchShellList.objects.all()
			for line in data:
				cheungssh_info["content"].insert(0,{
					"id":line.id,
					"name":line.name,
					"username":line.username,
					"group":line.group,
					"create_time":line.create_time,
					"description":line.description,
					"parameters":line.parameters,
					"command":line.command,
					"os_type":line.os_type,
				})
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def del_batch_shell(self, request):
		cheungssh_info={"status":True,"content":""}
		id = request.GET.get("id")
		BatchShellList.objects.filter(id=id).delete()
		return cheungssh_info
