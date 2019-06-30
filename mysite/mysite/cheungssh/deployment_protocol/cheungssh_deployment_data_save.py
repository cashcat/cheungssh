#!/usr/bin/env python
#coding:utf8
import os,sys,random,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
from django.core.cache import cache
REDIS=cache.master_client
def set_progress(taskid,stepid,data):
	#####tid是进度id，不是taskid任务id
	now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
	data["time"]=now_time
	if not data.has_key("summary"):
		data["summary"]="暂无"
	data=json.dumps(data,encoding="utf8",ensure_ascii=False)
	REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=taskid),stepid,data)#####hset taskid stepid data


