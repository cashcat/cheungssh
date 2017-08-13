#!/usr/bin/env python
#coding:utf-8
import os,sys,json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
from django.core.cache import cache
REDIS=cache.master_client  
def set_redis_data(keyid,keyvalue,datatype='list'):
	info={"status":False}
	try:
		if datatype=='list':
			REDIS.lpush(keyid,keyvalue)
		else:
			pass
		info['status']='True'
	except Exception,e:
		info['content']=str(e)
	return info

def get_redis_data(keyid,datatype='string'):
	info={"status":False}
	try:
		if datatype=='list':
			data=REDIS.lrange(keyid,0,-1)
			if not data:data=[]
		elif datatype=='string':
			data=REDIS.get(keyid)
		else:
			raise IOError('未知数据类型 无法读取数据')
		info['content']=data
		info['status']='True'
	except Exception,e:
		info['content']=str(e)
		
			
	return info
