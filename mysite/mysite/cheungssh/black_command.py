#coding:utf-8
from django.core.cache import cache
from django.http import  HttpResponse
import re,json
REDIS=cache.master_client
from cheungssh_error import CheungSSHError
def black_command_check(func):
	def wrapper_black_command(request,*args,**kws):
		cheungssh_info={'status':False,"content":""}
		is_intercept=False ######默认不拦截
		callback=request.GET.get('callback')
		try:
			black_command_list=REDIS.lrange('black.command.list',0,-1)    #[{}]  #####读取黑名单，是一个LIST
			if black_command_list is None:black_command_list=[] ###########没有设置黑名单的情况下
			parameters=request.POST.get("parameters")  or request.GET.get("parameters")
			try:
				parameters=json.loads(parameters)
			except:
				raise CheungSSH("CHB0000000001")
			if not parameters:raise CheungSSHError("CHB0000000001") ##########没有读取到参数
			command=parameters["cmd"]
			try:
				#####是否强制执行的参数
				force=parameters["force"]
			except Exception,e:
				force=False
			_command=re.sub('^ *| *$','',command) #####删除开头和结尾的空格
			for _cmd in black_command_list: #####逐一匹配命令黑名单
				##########搜索黑名单的命令是否出现
				_cmd=json.loads(_cmd) #######_cmd是一个字符串
				if re.search(_cmd["cmd"],_command): #####是在黑名单中
					if request.user.is_superuser and not force:
						cheungssh_info["content"]="由于您是管理员，可以强制执行敏感命令，真的要强制吗 ?"
						cheungssh_info["ask"]=True
						cheungssh_info["status"]=True
						#####返回不执行
						is_intercept=True
						break
					elif request.user.is_superuser and force:
						#######可以继续执行
						is_intercept=False
						break
						return func(request,*args,**kws) ######继续执行命令
					else:
						#####返回不执行
						is_intercept=True
						cheungssh_info["status"]=False
						cheungssh_info["content"]="您无权执行该命令,该操作已被审计 !"
						break
		except Exception,e:
			is_intercept=True
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		cheungssh_info=json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False)
		if  not  callback is  None:cheungssh_info="%s(%s)"  % (callback,cheungssh_info) #####有callback
		if is_intercept:
			return HttpResponse(cheungssh_info) #####需要拦截
		else:
			return func(request,*args,**kws) ######继续执行命令
	return wrapper_black_command
		
