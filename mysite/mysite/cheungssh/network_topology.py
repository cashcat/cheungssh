#!/usr/bin/env python
#coding:utf8
import os,json,time,sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
class Topology(object):
	def __init__(self):
		pass
	@staticmethod
	def add_device(data):
		cheungssh_info={"content":"","status":False}
		try:
			#####创建之前先查询
			device_name=data["name"]
			if REDIS.hget("CHB-TXWY008304534",device_name):raise CheungSSHError("设备名不可以重复！")
			data["time"]=time.strftime("%Y-%m-%d",time.localtime())
			_data=json.dumps(data,encoding="utf8",ensure_ascii=False)
			REDIS.hset("CHB-TXWY008304534",device_name,_data)
			cheungssh_info["content"]=data
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def get_device():
		cheungssh_info={"content":{},"status":False}
		try:
			
			data=REDIS.hgetall("CHB-TXWY008304534")
			for name in data.keys():
				t=json.loads(data[name])
				cheungssh_info["content"][name]=t
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def save_topology(data,username):
		cheungssh_info={"content":{},"status":False}
		try:
			data=json.dumps(data,encoding="utf8",ensure_ascii=False)
			REDIS.hset("CHB-R0937479847847",username,data)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	
	@staticmethod
	def my_topology(username):
		cheungssh_info={"content":{},"status":False}
		try:
			data=REDIS.hget("CHB-R0937479847847",username)
			if data is None:
				pass
			else:
				data=json.loads(data)
				cheungssh_info["content"]=data
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
