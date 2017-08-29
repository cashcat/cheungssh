#coding:utf-8
import time,IP,json,os,sys
from django.core.cache import cache
from django.http import HttpResponse
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
REDIS=cache.master_client
def login_check(page='未知页面',isRecord=True):
	def decorator(func):
		def login_auth_check(request,*args,**kws):
			if request.method=='POST':
				request_content=request.POST
			else:
				request_content=request.GET
			callback=request.GET.get('callback')
			info={}
			info['time']=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			info['url']=  "%s?%s"   %(request.META['PATH_INFO'],request.META['QUERY_STRING'])
			info['ip']=request.META['REMOTE_ADDR']
			info['page']=page
			info['request_content']=request_content
			info['ip_locate']=IP.find(info['ip'])
			isAuth=False
			if request.user.is_authenticated():
				info["username"]=request.user.username
				isAuth=True
			if isAuth:
				if isRecord:
					_info=json.dumps(info,encoding="utf8",ensure_ascii=False)
					REDIS.lpush("CHB-R0000000010A-A",_info)			
				return func(request,*args,**kws)
			else:
				backinfo={'status':'login'}
				backinfo=json.dumps(backinfo,encoding="utf8",ensure_ascii=False)
				if callback:
					info="%s(%s)"  % (callback,backinfo)
				else:
					info="%s"  % (backinfo)
				return HttpResponse(info)
		return login_auth_check
	return decorator
