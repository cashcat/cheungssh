#coding:utf-8
from django.core.cache import cache
from django.http import  HttpResponse
import re,json
REDIS=cache.master_client
from cheungssh_error import CheungSSHError
def black_command_check(func):
	def wrapper_black_command(request,*args,**kws):
		cheungssh_info={'status':False,"content":""}
		is_intercept=False 
		callback=request.GET.get('callback')
		try:
			black_command_list=REDIS.lrange('black.command.list',0,-1)    #[{}]  
			if black_command_list is None:black_command_list=[] 
			parameters=request.POST.get("parameters")  or request.GET.get("parameters")
			try:
				parameters=json.loads(parameters)
			except:
				raise CheungSSH("CHB0000000001")
			if not parameters:raise CheungSSHError("CHB0000000001") 
			command=parameters["cmd"]
			try:
				
				force=parameters["force"]
			except Exception,e:
				force=False
			servers=parameters["servers"]
			_command=re.sub('^ *| *$','',command) 
			for _cmd in black_command_list: 
				
				_cmd=json.loads(_cmd) 
				if re.search(_cmd["cmd"],_command): 
					if request.user.is_superuser and not force:
						cheungssh_info["content"]="由于您是管理员，可以强制执行敏感命令，真的要强制吗 ?"
						cheungssh_info["ask"]=True
						cheungssh_info["status"]=True
						
						is_intercept=True
						break
					elif request.user.is_superuser and force:
						
						is_intercept=False
						break
						return func(request,*args,**kws) 
					else:
						
						is_intercept=True
						cheungssh_info["status"]=False
						cheungssh_info["content"]="您无权执行该命令,该操作已被审计 !"
						break
		except Exception,e:
			is_intercept=True
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		cheungssh_info=json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False)
		if  not  callback is  None:cheungssh_info="%s(%s)"  % (callback,cheungssh_info) 
		if is_intercept:
			return HttpResponse(cheungssh_info) 
		else:
			return func(request,*args,**kws) 
	return wrapper_black_command
		
