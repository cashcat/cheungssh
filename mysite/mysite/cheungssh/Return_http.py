#coding:utf-8
import json
from django.http import  HttpResponse
def ajax_http(func):	######传入视图
	def w(request,*args,**kws): #########这个是视图的request参数
		if request.method=='GET':callback=request.GET.get('callback')
		else:callback=None
		info=func(request)  #####视图返回的是info json，这里执行了该视图后，直接进行扫尾
		info=json.dumps(info,encoding='utf-8',ensure_ascii=False)
		if callback is None:
                	info=info
		else:
			info="%s(%s)"  % (callback,info)
		response=HttpResponse(info)
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST,GET,OPTIONS,PUT,DELETE"
		response["Access-Control-Allow-Credentials"] = True
		response["Access-Control-Allow-Headers"]="Cache-Control" #####跨域上传文件
		return response
	return w

		
		
		
