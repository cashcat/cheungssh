#coding:utf-8
from django.http import HttpResponse
import json
def permission_check(perm):
	def wrapper_check(func):
		def check(request,*args,**kws):
			if request.method=='GET':callback=request.GET.get('callback')
			info={'status':False,"content":""}
			if not request.user.has_perm(perm):
				info['content']="您无权访问该资源! 该操作已被审计，请联系管理员!"
				info=json.dumps(info,encoding='utf-8',ensure_ascii=False)
				if callback is None:
					info=info
				else:
					info="%s(%s)"  % (callback,info)
					return HttpResponse(info)
			else:
				return func(request,*args,**kws)
		return check
	return wrapper_check
	
