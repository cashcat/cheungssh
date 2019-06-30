#coding:utf-8
from django.http import  HttpResponse
import os,sys,redis_to_redis,json
def check(func):
	def w(request):
		info={"status":False}
	
		callback=request.GET.get('callback')
		filename=request.GET.get('filename')
		filename=os.path.basename(filename) 
		filename="".join(request.GET.get('filename').split('.')[:-1])
		filelist=redis_to_redis.get_redis_data('adminfilelist','list')['content']
		for f in filelist:
			f=os.path.basename(f)#########删除路径后缀
			if f==filename:
				return func(request)
		if len(filelist)!=0 and not request.user.is_superuser:#########该处需要做普通用户的权限价差， 和存在限制记录的检查
			info['content']='您无权访问该系统资源!'
			info=json.dumps(info,encoding='utf-8',ensure_ascii=False)
			if callback is None:
				info=info
			else:
				info="%s(%s)"  % (callback,info)
			return HttpResponse(info)
		return func(request)
	return w
