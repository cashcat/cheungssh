#!/usr/bin/env python
#coding:utf8
#Author:张其川,CheungSSH
import random,msgpack,os,sys
from cheungssh_analysis_log import CheungSSHAnalyLog
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client


class CheungSSHAnalysisWebView(object):
	
	@staticmethod
	def get_local_analysis_data(filename="",date="09/Nov/2017"):
		#{"year":"2016","month":"Nov","day":"17"}
		cheungssh_info={"content":"","status":False}
		try:
			_t=date.split("/")
			date={"year":_t[2],"month":_t[1],"day":_t[0]}

			a=CheungSSHAnalyLog(date,filename)
			data1=a.intime_max_access_hour()
			data2=a.intime_every_hour_url_count()
			if not data1["status"]:
				raise IOError(data1["content"])
			elif not  data2["status"]:
				raise IOError(data2["content"])
			data={"time_seg":{"name":"24小时内访问量最大的时间段","value":data1["content"]},"max_url":{"name":"访问量最大时间段中访问次数最多的URL","value":data2["content"]},"http_code":{"name":"24小时内各返回码数量","value":a.http_code}}
			cheungssh_info={"content":data,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
	@staticmethod
	def add_remote_analysis_logfile(data):
		cheungssh_info={"content":"","status":False}
		tid=str(random.randint(90000000000,99999999999))
		try:
			data=msgpack.packb(data,encoding="utf-8")
			REDIS.hset("CHB-0383740494845",tid,data)
			cheungssh_info={"content":tid,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
	@staticmethod
	def get_remote_analysis_logfile_info():
		cheungssh_info={"content":"","status":False}
		try:
			data=REDIS.hgetall("CHB-0383740494845")
			_data={}
			for tid in data.keys():
				_data[tid]=msgpack.unpackb(data[tid])
			cheungssh_info={"content":_data,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
	@staticmethod
	def delete_remote_analysis_logfile_info(tid):
		cheungssh_info={"content":"","status":False}
		try:
			REDIS.hdel("CHB-0383740494845",tid)
			cheungssh_info={"content":"","status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
