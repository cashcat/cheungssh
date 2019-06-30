#!/usr/bin/env python
#coding:utf8
#Author: 张其川总设计师
import os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
class CheungSSHLoginUserNotify(object):
	#####用来检查当前登录的用户，在页面进行通知
	def __init__(self):
		pass
	@staticmethod
	def add_login_user(data):
		#####把完整的登录数据传递进来，data中包含了sid，session，登录时间，登录IP，登录地址
		try:
			_data=json.dumps(data,encoding="utf8",ensure_ascii=False)
			REDIS.rpush("CHB-RL00000000A",_data)
		except Exception,e:
			pass
	@staticmethod
	def get_login_user_list(request):
		sid=str(request.session.session_key)
		cheungssh_info={"status":False,"content":""}
		login_list=[]#####把全部数据转换为json
		try:
			index=0
			if request.user.is_superuser:
				#####非管理员权限，不能能接收登录通知
				data=REDIS.lrange("CHB-RL00000000A",0,-1)
				for _line in data:
					line=json.loads(_line)
					_sid=line["sid"]
					if str(sid)==str(_sid):
						#####这里需要判断前端传递过来的session_index是否为空，因为第一次是没有的
						
						session_index=int(request.GET.get("session_index",index+1))#####获取前端传递过来的该用户的session的在列表中的索引位置
					#####转换为json
					login_list.append(line)
					index+=1
				#####读取从索引位置开始到最后一个的数据
				login_data=login_list[session_index:]
				last_index=len(login_list)
			else:
				last_index=0
				login_data=[]
			cheungssh_info["content"]={"session_index":last_index,"data":login_data}#####记录到最后一个位置
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
