#coding:utf8
import time,IP,json,os,sys
from django.core.cache import cache
from django.http import HttpResponse
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
REDIS=cache.master_client
class CheungSSHPageAudit(object):
	def __init__(self):
		pass
	@staticmethod
	def get_access_history(request):
		cheungssh_info={"content":"","status":False}
		try:
			data=REDIS.lrange("CHB-R0000000010A-A",0,-1)
			tmp=[]
			for _line in data:
				line=json.loads(_line)######转换为json
				tmp.append(line)
			cheungssh_info["content"]=tmp
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
