#coding:utf-8
import json
from django.http import  HttpResponse
def ajax_http(func):	
	def w(request,*args,**kws): 
		if request.method=='GET':callback=request.GET.get('callback')
		else:callback=None
		info=func(request)  
		info=json.dumps(info,encoding='utf-8',ensure_ascii=False)
		if callback is None:
                	info=info
		else:
			info="%s(%s)"  % (callback,info)
		response=HttpResponse(info)
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST,GET,OPTIONS,PUT,DELETE"
		response["Access-Control-Allow-Credentials"] = True
		response["Access-Control-Allow-Headers"]="Cache-Control" 
		return response
	return w

		
		
		
