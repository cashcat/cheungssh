# coding:utf8
# 作者： 张其川


import re
import json
import sys
import time
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
from models import BlackListList, BlackListGroup,UserWithBlackListGroup
from django.db.models import Q
from django.contrib.auth.models import User

class MatchBlackList(object):
	def match(self,cmd,uid):
		cheungssh_info={"status":True,"content":""}
		try:
			data = UserWithBlackListGroup.objects.filter( uid=uid   )
			if data.__len__() == 0:
				bid = []
			else:
				bid = json.loads(data[0].black_list_group_id)
			data = [] ##### 所有的名单ID
			tmp = BlackListGroup.objects.filter( Q(id__in = bid) | Q(default = "是") )
			group_info={}
			for line in tmp:
				_list = json.loads(line.list)
				group_info[line.name] = _list
				data.extend(_list)
			data = list(set(data))
			x = BlackListList.objects.filter(id__in = data)
			for line in x:
				if re.search(line.expression,cmd):
					##### 取得组的名字
					for k,v in group_info.items():
						if str(line.id) in v or line.id in v:
							group = k
					raise IOError("命中黑名单组【{group}】中的黑名单 【{name}】。".format(group = group,name=line.name) )
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info= {"status":False,"content":e}
		return cheungssh_info

class UserAndBlackList(object):
	def __init__(self):
		pass
	def save_user_with_black_list_group(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			data = request.POST.get("data")
			data = json.loads(data)
			data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			action = request.POST.get("action")
			#data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			id = data["id"]
			del data["id"]
			if action == "create":
				if UserWithBlackListGroup.objects.filter(uid=data["uid"]).__len__()  > 0:raise IOError("该用户已有一个名单，请不要重复添加！")
				UserWithBlackListGroup(**data).save()
			else:
				UserWithBlackListGroup.objects.filter(id=id).update(**data)
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def del_user_with_black_list_group(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			id  =request.GET.get("id")
			UserWithBlackListGroup.objects.filter(id=id).delete()
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def get_user_with_black_list_group(self,request):
		##### 取得绑定关系的列表
		cheungssh_info={"status":False,"content":[]}
		try:
			data = UserWithBlackListGroup.objects.all()
			for line in data:
				_list = []
				t = line.black_list_group_id
				t = json.loads(t)
				for group_id in t:
					_f = BlackListGroup.objects.filter(id=int(group_id))
					if len(_f) == 0:continue
					_list.append({
						"gid":group_id,
						"name":_f[0].name,
					})
				##### 转换用户名
				username = User.objects.filter(id=line.uid)
				if username.__len__() == 0:continue
				cheungssh_info["content"].append({
					"uid":line.uid,
					"list":_list,
					"id":line.id,
					"create_time":line.create_time,
					"username":username[0].username,
					
				})
			cheungssh_info["user_list"] = self.get_user_and_black_list_group()["content"]["user"]
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info

	def get_user_and_black_list_group(self):
		cheungssh_info={"status":False,"content":{"user":[],"black_list_group":[]}}
		try:
			data = User.objects.all()
			for line in data:
				cheungssh_info["content"]["user"].append({
					"id":line.id,
					"username":line.username,
				})
			data = BlackListGroup.objects.all()
			for line in data:
				_list = []
				x = json.loads(line.list)
				##### 取得每一条黑名单
				for t in x:
					k = BlackListList.objects.filter(id=int(t))
					if len(k) == 0:continue
					_list.append({
						"name":k[0].name,
						"expression":k[0].expression,
						"description":k[0].description,
					})
				cheungssh_info["content"]["black_list_group"].append({
					"id":line.id,
					"name":line.name,
					"list":_list,
					"create_time":line.create_time,
					"owner":line.owner,
					"description":line.description,
					"default":line.default,
				})
				
					
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
		

class BlackListGroupAdmin(object):
	def __init__(self):
		pass
	def save_black_list_group(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			data = request.POST.get("data")
			data = json.loads(data)
			action = request.POST.get("action")
			data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data["owner"] = request.user.username
			id = data["id"]
			del data["id"]
			if action == "create":
				self.query_black_list(data["name"])
				BlackListGroup(**data).save()
			else:
				if BlackListGroup.objects.filter(~Q(id=id),name = data["name"]).__len__() > 0:
					raise IOError("名称早已使用，请更换！")
				BlackListGroup.objects.filter(id=id).update(**data)
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def query_black_list(self,name):
		if BlackListGroup.objects.filter(name=name).__len__() > 0:
			raise IOError("名称早已使用，请更换！")
	def del_black_list_group(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			id  =request.GET.get("id")
			BlackListGroup.objects.filter(id=id).delete()
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def get_black_list_group(self):
		cheungssh_info={"status":False,"content":[]}
		try:
			data = BlackListGroup.objects.all()
			for line in data:
				_list = line.list
				_list = json.loads(_list)
				x = []
				for i in _list:
					t = BlackListList.objects.filter(id=i)
					if len(t) == 0 :continue
					x.append({
						"name":t[0].name,
						"expression":t[0].expression,
						"id":t[0].id,
					})
					
				
				cheungssh_info["content"].append({	
					"id":line.id,
					"create_time":line.create_time,
					"owner":line.owner,
					"list":json.dumps(x,encoding='utf8',ensure_ascii=False),
					"name":line.name,
					"default":line.default,
					"description":line.description,
				})
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
		

class BlackListAdmin(object):
	def __init__(self):
		pass
	def save_black_list(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			data = request.POST.get("data")
			data = json.loads(data)
			try:
				re.search(data["expression"],"")
			except Exception,e:
				raise IOError("正则表达式有误，请检查！")
			action = request.POST.get("action")
			data["create_time"] = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data["owner"] = request.user.username
			id = data["id"]
			del data["id"]
			if action == "create":
				self.query_black_list(data["name"])
				BlackListList(**data).save()
			else:
				if BlackListList.objects.filter(~Q(id=id),name = data["name"]).__len__() > 0:
					raise IOError("名称早已使用，请更换！")
				BlackListList.objects.filter(id=id).update(**data)
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def query_black_list(self,name):
		if BlackListList.objects.filter(name=name).__len__() > 0:
			raise IOError("名称早已使用，请更换！")
	def get_black_list(self):
		cheungssh_info={"status":False,"content":[]}
		try:
			data = BlackListList.objects.all()
			for line in data:
				cheungssh_info["content"].append({	
					"id":line.id,
					"create_time":line.create_time,
					"owner":line.owner,
					"expression":line.expression,
					"name":line.name,
					"description":line.description,
				})
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
	def del_black_list(self,request):
		cheungssh_info={"status":False,"content":""}
		try:
			id  =request.GET.get("id")
			BlackListList.objects.filter(id=id).delete()
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			cheungssh_info["content"] = e
		return cheungssh_info
