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
	
	def __init__(self):
		pass
	@staticmethod
	def add_login_user(data):
		
		try:
			_data=json.dumps(data,encoding="utf8",ensure_ascii=False)
			REDIS.rpush("CHB-RL00000000A",_data)
		except Exception,e:
			pass
	@staticmethod
	def get_login_user_list(request):
		sid=str(request.session.session_key)
		cheungssh_info={"status":False,"content":""}
		login_list=[]
		try:
			index=0
			if request.user.is_superuser:
				
				data=REDIS.lrange("CHB-RL00000000A",0,-1)
				for _line in data:
					line=json.loads(_line)
					_sid=line["sid"]
					if str(sid)==str(_sid):
						
						
						session_index=int(request.GET.get("session_index",index+1))
					
					login_list.append(line)
					index+=1
				
				login_data=login_list[session_index:]
				last_index=len(login_list)
			else:
				last_index=0
				login_data=[]
			cheungssh_info["content"]={"session_index":last_index,"data":login_data}
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
