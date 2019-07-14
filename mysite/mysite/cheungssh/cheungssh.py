#coding:utf-8
from Queue import Queue
import tarfile
import sys,os,json,random,commands,queue_task,time,threading
sys.path.append('/home/cheungssh/bin')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh/deployment_protocol')
from threading import Thread
from crontab.crontab import Crontab
import csv
import codecs
from BlackListAdmin import BlackListAdmin, BlackListGroupAdmin,UserAndBlackList
from ServiceOperation import ServiceOperation
from BatchShellAdmin import  BatchShellAdmin
from models import ServersList,SoftwareList
from RemoteFileAdmin import RemoteFileAdmin
from ScriptAdmin import ScriptAdmin
from CheungSSHCommandSystem import CheungSSHCommandSystem
from cheungssh_sshv2 import CheungSSH_SSH
from ServersInventory  import ServersInventory
from cheungssh_deployment_crontab import CheungSSHDeploymentCrontab
from cheungssh_batch_command import CheungSSHBatchCommand
from cheungssh_system_version import cheungssh_os
from cheungssh_middleware.cheungssh_middleware import CheungSSHMiddleware
from analysis_log.cheungssh_analysis_log import CheungSSHAnalyLog
from analysis_log.cheungssh_web_analysis_view import CheungSSHAnalysisWebView
from cheungssh_active_ssh import CheungSSHActiveSSH
from network_topology import Topology
import cheungssh_page_audit
from cheungssh_login import CheungSSHLoginUserNotify
from cheungssh_app_admin import CheungSSHAppAdmin
import get_file_check
from deployment_protocol.cheungssh_deployment_admin import DeploymentAdmin
from cheungssh_ssh_check import CheungSSHCheck
from cheungssh_error import CheungSSHError
from client_info import resolv_client
from django.contrib.auth.models import User,Group
from django.http import  HttpResponse,HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate,login,logout
import path_search,crond_record
from permission_check import permission_check
from Return_http import ajax_http
from parameters import parameters
from cheungssh_thread_queue import CheungSSHPool
import cheungssh_modul_controler
from cheungssh_script import CheungSSHScript
import IP
import re,platform
from cheungssh_file_admin import FileAdmin
import global_parameters,cheungssh_settings
reload(sys)
sys.setdefaultencoding('utf8')
from django.core.cache import cache
from django.views.generic.base import View 
import login_check
from black_command import black_command_check
#from dashboard import dashboard
#from localhost_dashboard_process  import process
from assets.custom_assets_class import custom_assets
###########################
REDIS=cache.master_client
from cheungssh_file_transfer import CheungSSHFileTransfer
from cheungssh_thread_queue import CheungSSHThreadAdmin
from cheungssh_docker_controler import DockerControler
import cheungssh_docker_admin
###########################
def cheungssh_redirect(request):
	return HttpResponseRedirect("/cheungssh/static/html/cheungssh.html")
def cheungssh_index(request):
	return HttpResponseRedirect("/cheungssh/static/html/cheungssh.html")
@ajax_http
def cheungssh_login(request):
	info={"status":False,"content":""}
	logintime=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
	client_ip=request.META['REMOTE_ADDR']
	limit_ip='fail.limit.%s'%(client_ip)
	ip_threshold_r=cache.get('ip.threshold')  ######从redis中读取设定的阈值
	ip_threshold=lambda x:x if x is not None else 4 ########设定默认值
	ip_threshold=ip_threshold(ip_threshold_r)######判断从redis中读取，如果没有设定这是None，需要设定为默认的4次
	if cache.has_key(limit_ip):
		if cache.get(limit_ip)>ip_threshold:  ########ip的登陆错误次数大于设定的阈值
			info['content']="系统已经拒绝您登陆,请联系管理员!"
			cache.incr(limit_ip)  ######如果发现已经是无效登陆了， 就不在增加其值了
			cache.expire(limit_ip,86400)
			return info
	if request.method=="POST":
		username = request.POST.get("username", '非法用户名')
		password = request.POST.get("password", False)
		print username,password,request.POST
		user=authenticate(username=username,password=password)
		if user is not None:
			if user.is_active:
				login(request,user)
				request.session["username"]=username
				info["status"]=True
				request.session.set_expiry(0)    ##########关闭浏览器则删除session
				if cache.has_key(limit_ip):cache.delete(limit_ip)
				login_info=resolv_client(request)
				login_info["sid"]=str(request.session.session_key)
				CheungSSHLoginUserNotify.add_login_user(login_info)#####添加用户登录记录，用来通知
				login_info=json.dumps(login_info,encoding="utf8",ensure_ascii=False)
				REDIS.lpush("CHB-R00000000101",login_info)#####[]存储所有登录成功的记录
			else:
				
				info["content"]="用户状态无效"
		else:
			if cache.has_key(limit_ip):
				cache.incr(limit_ip)
			else:
				cache.set(limit_ip,1,3600)
			info["content"]="用户名或密码错误"
		info["IP"]=client_ip
		info["IP-Locate"]=IP.find(client_ip)
		info["username"]=username
		info["logintime"]=logintime
		################写入登录记录
	else:
		info["content"]="No Get"
        return info
@login_check.login_check('登录记录',False)
@permission_check('cheungssh.show_sign_record')
@ajax_http
def show_sign_record(request):
	datainfo=redis_to_redis.get_redis_data('sign.record','list')  ##############这里就是一个info字典
	info=pagelist(request,datainfo["content"])
        return info
def cheungssh_logout(request):
	info={'status':'True'}
	if request.user.is_authenticated():
		logout(request)
	info=json.dumps(info)
	callback=request.GET.get('callback')
	if callback is None:
		info=info
	else:
		info="%s(%s)"  % (callback,info)
	return HttpResponse(info)
@login_check.login_check('上传软件包') ####################临时注释
@ajax_http#####
def upload_software(request):
	cheungssh_info={"status":True,"content":""}
	create_time = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
	tid = time.strftime("%Y%m%d%H%M%S",time.localtime())
	username=request.user.username
	if request.method=="POST":
		filename=str(request.FILES.get("file"))
		file_content=request.FILES.get('file').read()
		_dir=os.path.join(cheungssh_settings.package)
		if not os.path.isdir(_dir):
			os.mkdir(_dir)
		dfile=os.path.join(_dir,filename + "_" + tid)
		with open(dfile.encode('utf8'),"wb") as f:
			f.write(file_content)
		data={
			"name":dfile,
			"create_time":create_time,
			"description":"",
			"username":username,
			"env":"",
			"script_name":"",
		}
		a=SoftwareList(**data)
		a.save()
		data["id"] = a.id
		cheungssh_info["content"] = data
		cheungssh_info["content"]["name"] = os.path.basename("".join(cheungssh_info["content"]["name"].split("_")[:-1]))
	return cheungssh_info

@login_check.login_check('查看软件包列表')
@ajax_http
def get_software_list(request):
	cheungssh_info={"content":[],"status":True}
	data = SoftwareList.objects.all()
	for line in data:
		cheungssh_info["content"].insert(0,{
			"name":os.path.basename("".join(line.name.split("_")[:-1])),
			"create_time":line.create_time,
			"username":line.username,
			"description":line.description,
			"script_name":line.script_name,
			"id":line.id,
			"env":line.env,
		})
	return cheungssh_info
@login_check.login_check('删除软件包列表')
@ajax_http
def del_software(request):
	cheungssh_info={"status":True,"content":""}
	data = SoftwareList.objects.filter(id=request.GET.get("id"))
	if len(data)==1:
		os.remove(data[0].name)
	data.delete()
	return cheungssh_info




@login_check.login_check('修改软件备注',False)
@ajax_http
def description_software(request):
	data = request.POST.get("data")
	data = json.loads(data)
	SoftwareList.objects.filter(id=data["id"]).update(description=data["description"],script_name=data["script_name"],env=data["env"])
	return {"status":True,"content":""}
@login_check.login_check('PC上传') ####################临时注释
######@permission_check('cheungssh.local_file_upload') #####权限拒绝，但是前段没有提示
#####注意用户名没有
@ajax_http#####
def upload_file_test(request):
	cheungssh_info={"status":True,"content":""}
	fid=str(random.randint(90000000000000000000,99999999999999999999))
	username=request.user.username
	if request.method=="POST":
		filename=str(request.FILES.get("file"))
		file_content=request.FILES.get('file').read()
		_dir=os.path.join(cheungssh_settings.upload_dir,username)
		if not os.path.isdir(_dir):
			os.mkdir(_dir)
		dfile=os.path.join(_dir,filename)
		with open(dfile.encode('utf8'),"wb") as f:
			f.write(file_content)
	return cheungssh_info


@login_check.login_check('上传分析日志') ####################临时注释
######@permission_check('cheungssh.local_file_upload') #####权限拒绝，但是前段没有提示
#####注意用户名没有
@ajax_http#####
def upload_log_file(request):
	cheungssh_info={"status":True,"content":""}
	fid=str(random.randint(90000000000000000000,99999999999999999999))
	username=request.user.username
	if request.method=="POST":
		filename=str(request.FILES.get("file"))
		file_content=request.FILES.get('file').read()
		_dir=os.path.join(cheungssh_settings.upload_logfile_dir,username)
		try:
			os.makedirs(_dir)
		except:
			pass
		dfile=os.path.join(_dir,filename)
		with open(dfile.encode('utf8'),"wb") as f:
			f.write(file_content)
	return cheungssh_info



@login_check.login_check('删除脚本')
@ajax_http
def delete_script(request):
	return ScriptAdmin(request,REDIS).delete_script(request.GET.get("script_name"))

@login_check.login_check('查看脚本清单')
@permission_check('cheungssh.show_script_list')
@ajax_http
def scripts_list(request):
	return ScriptAdmin(request,REDIS).get_all_scripts()

@login_check.login_check('上传脚本')
@ajax_http
def upload_script(request):
	cheungssh_info={"status":False,"content":""}
	username=request.user.username#####注意没有值，
	if request.method=="POST":
		try:
			if len(REDIS.hgetall("scripts"))>=9:raise CheungSSHError("CHB-BUSINESS-LIMIT")
			filename=str(request.FILES.get("file"))#####上传之前要做检查，这个文件名是否属于自己，如果属于别人，则要抛出错误，不准上传
			_data=REDIS.hget("scripts",filename)
			if _data is None:
				pass
			else:
				data=json.loads(_data)
				if filename==data["script"]:#####如果文件已经存在
					if username==data["owner"]:#####如果是自己的，则表示更新，允许,否则不允许
						pass
					else:
						raise CheungSSHError("您的操作不被允许!其他账户下存在同名脚本!")
			file_content=request.FILES.get('file').read()
			parent_dir=os.path.join(cheungssh_settings.script_dir,username)
			if not os.path.isdir(parent_dir):os.mkdir(parent_dir)#####如果没有则创建
			script=os.path.join(parent_dir,filename)
			with open(script.encode('utf8'),"wb") as f:
				f.write(file_content)
			cheungssh_info["content"]={
				"script":filename,
				"owner":username,
				"time":time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()),
			}
			#####用的散列scripts:{"script-A":{},"script-B":{}}
			REDIS.hset("scripts",filename,json.dumps(cheungssh_info["content"],encoding="utf8",ensure_ascii=False))
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
	return cheungssh_info
#@login_check.login_check('命令搜索',False)
@ajax_http
def pathsearch(request):
	info={'status':True,"content":""}
	path=request.GET.get('path')
	pathinfo=path_search.get_query_string(path)
	info['content']=pathinfo
	return info

@ajax_http
def mark_ssh_as_active(request):
	return CheungSSHCommandSystem(request,REDIS).mark_ssh_as_active()

@login_check.login_check('服务器信息修改')
@permission_check('cheungssh.modify_server')
@ajax_http
def config_modify(request):
	host=request.GET.get('host')
	host = json.loads(host)
	is_super=request.user.is_superuser
	return ServersInventory().modify_server(**host)




@login_check.login_check('创建服务器')
@permission_check('cheungssh.create_server')
@ajax_http
def config_add(request):
	host =request.GET.get("host")
	client_info=resolv_client(request)
	try:
		host=json.loads(host)
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info['content']=str(e)
		return cheungssh_info
	######处理空格问题
	host["alias"] = re.sub(" +","",host["alias"])
	host["ip"] = re.sub(" +","",host["ip"])
	return ServersInventory().add_server(**host)
@login_check.login_check('查看服务器配置',False)
#####@permission_check('cheungssh.show_server')#这个权限检查取消
@ajax_http
def load_servers_list(request):
	print 1234
	username=request.user.username
	is_super=request.user.is_superuser
	if is_super:
		return ServersInventory().get_server()
	else:
		return ServersInventory().get_server(username)
		
			
@login_check.login_check('删除服务器')
@permission_check('cheungssh.delete_server')
@ajax_http
def config_del(request):
	hosts= request.GET.get("hosts")
	hosts = json.loads(hosts)
	is_super=request.user.is_superuser
	username=request.user.username
	return ServersInventory().delete_server(is_super=is_super,owner=username,hosts=hosts)
############
@login_check.login_check('删除计划任务')
@permission_check('cheungssh.crond_del')
@ajax_http
def delcrondlog(request):
	fid=request.GET.get('fid')
	info={"status":False,"content":""}
	delcrond_log=crond_record.crond_del(fid)
	if delcrond_log[0]:
		info['status']='True'
	else:
		info['content']=delcrond_log[1]
	return info
@login_check.login_check('查看计划任务')
@permission_check('cheungssh.crond_show')
@ajax_http
def showcrondlog(request):
	info={"status":True,"content":""}
	crondlog_log=crond_record.crond_show(request)[1]
	info['content']=crondlog_log
	return info
@login_check.login_check('创建计划任务')
@permission_check('cheungssh.crond_create')
@ajax_http
def crontab(request):
	runmodel="/home/cheungssh/mysite/mysite/cheungssh/"
	value=request.GET.get('value')
	runtime=request.GET.get('runtime')
	runtype=request.GET.get('type')
	info={"status":False,"content":""}
	if platform.dist()[0]=='Ubuntu':    ######Ubuntu没有这个服务,直接使用
		crond_status=(0,'')######如果是Ubuntu，人工控制为可用
	else:
		crond_status=commands.getstatusoutput('/etc/init.d/crond status')
	if not crond_status[0]==0:
		info['content']=crond_status[1]
	else:
		try:
			value=eval(value)
			if not type({})==type(value):
				info['content']="数据类型错误"
			else:
				fid=str(random.randint(90000000000000000000,99999999999999999999)) 
				lasttime=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
				value['fid']=fid
				value['user']=request.user.username
				value['status']='未启动'.decode('utf-8')
				value['runtime']=runtime
				value['cmd']=""
				value['lasttime']=lasttime
				value['runtype']=runtype
				value['createtime']=str(time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()))	
				value_to_log={}
				value_tmp=json.dumps(value)
				if runtype=="upload" or runtype=="download":
					value_to_log[value['fid']]=value
					runmodel_program=os.path.join(runmodel,"daemon_FileTransfer.py")
					cmd="""%s  %s '%s' #%s""" % (runtime,runmodel_program,value_tmp,value['fid'])
					a=open(crond_file,'a')
					a.write(cmd+"\n")
					a.close()
					crond_write=commands.getstatusoutput("""/usr/bin/crontab %s""" % (crond_file))
					if int(crond_write[0])==0:
						info['status']='True'
						crond_record.crond_record(value_to_log)
					else:
						delcmd=commands.getstatusoutput("""sed -i '/%s/d' %s"""  % (fid,crond_file))
						print delcmd,11111111111
						info['content']=crond_write[1]
					print 'Runtime: ',runtime
				elif runtype=="cmd":
					hostinfo=request.GET.get('value')
					try:
						hostinfo=eval(hostinfo)
						value['cmd']=hostinfo['cmd']
						value_to_log[value['fid']]=value
						cmdcontent= "\n%s#%s#%s\n"  %(hostinfo['cmd'],hostinfo['id'],value['fid'])
						try:
							with open(cmdfile.encode('utf8'),'a') as f:
								f.write(cmdcontent) 
							crondcmd=""" %s %s %s\n"""  % (runtime,'/home/cheungssh/bin/cheungssh_web.py',fid)
							try:
								with open(crond_file.encode('utf8'),'a') as f:
									f.write(crondcmd)
							
								crond_write=commands.getstatusoutput("""/usr/bin/crontab %s""" % (crond_file))
								if int(crond_write[0])==0:
									info['status']='True'
									crond_record.crond_record(value_to_log) 
								else:
									print "加入计划任务失败",crond_write[1],crond_write[0]
									delcmd=commands.getstatusoutput("""sed -i '/%s/d' %s"""  % (fid,crond_file))
									info['content']=crond_write[1]
							except Exception,e:
								info['content']=str(e)
						except Exception,e:
							print '写入错误',e
							info['content']=str(e)
					except Exception,e:
						print '发生错误',e
						info['content']=str(e)
				else:
					info['content']="请求任务未知"
					
				
		except Exception,e:
			print "发生错误",e
			info['content']=str(e)
	return info
@login_check.login_check('',False)
@ajax_http
def local_upload_show(request):
	info={'status':'False','content':[]}
	local_upload_all=cache.get('local_upload')
	if local_upload_all:
		info['content']=local_upload_all.values()
	return info


@login_check.login_check('',False)
@ajax_http
def get_command_result(request):
	return CheungSSHCommandSystem(request,REDIS).get_command_result()
	
@login_check.login_check('请求登录服务器')
#@permission_check('cheungssh.execute_command')
@ajax_http
def login_server_request(request):
	#####请求登录服务器
	return CheungSSHCommandSystem(request,REDIS).login_server_request()
		


@login_check.login_check('执行命令')
@permission_check('cheungssh.execute_command')
@black_command_check
@ajax_http
def execute_command(request):
	return CheungSSHCommandSystem(request,REDIS).execute_command()
	

@login_check.login_check('命令操作日志')
@permission_check('cheungssh.command_history')
@ajax_http
def command_history(request):#############传入request和一个数据list
	#t["result"]=re.sub("""\\"|\\'""",'',"</br>".join(cmd_result))########生成新的数据条目,为了转义
	cheungssh_info={"content":[],"status":True}
	history=REDIS.lrange("command.history",0,-1)
	for line in history:
		line=json.loads(line)
		cheungssh_info["content"].append(line)
	return cheungssh_info

@login_check.login_check('',False)
@ajax_http
def my_command_history(request):
	cheungssh_info={"content":[],"status":True}
	username=request.user.username
	history=REDIS.lrange("command.history",0,5)[::-1]
	for line in history:
		line=json.loads(line)
		owner=line["owner"]
		cmd=line["cmd"]
		if username==owner:cheungssh_info["content"].append(cmd)
	return cheungssh_info



@login_check.login_check('查看脚本内容')
@permission_check('cheungssh.scriptfile_show')
@ajax_http
def show_scriptcontent(request):
	fid=str(random.randint(90000000000000000000,99999999999999999999))  
	info={'status':'False','content':[]}
	edit_type=request.GET.get('edit_type')
	username=request.user.username
	uploadtime=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time())) 
	filename=request.GET.get('filename')
	try:
		scriptfilepath=os.path.join(scriptfiledir,filename)
		with open(scriptfilepath.encode('utf8')) as f:
			scriptfilecontent=f.read().strip()
		info['status']='True'
		info['content']=scriptfilecontent
	except Exception,e:
		info['content']=str(e)
		print  '脚本错误',e,show_scriptlist.__name__
	return info
@login_check.login_check('查看脚本清单')
@permission_check('cheungssh.scriptfile_list')
@ajax_http
def show_scriptlist(request):
	info={"status":False}
	scriptlogline=cache.get('scriptlogline')
	if scriptlogline:
		info['content']=scriptlogline.values()
	else:
		info['content']=[]
	info['status']='True'
	return info
@login_check.login_check('删除脚本')
@permission_check('cheungssh.scriptfile_del')
@ajax_http
def del_script(request):
	#######记得删除日志
	info={"status":False}
	try:
		filenames=request.GET.get('filename') ########不支持批量
		scriptlogline=cache.get('scriptlogline')  
		if scriptlogline:
			for f in  scriptlogline.keys():
				try:
					if filenames==f:
						del scriptlogline[f]
						break
				except KeyError:
					pass
				except Exception,e:
					print '错误',e
					info['content']=str(e)
					break
			cache.set('scriptlogline',scriptlogline,8640000000)
			info['status']='True'
	except Exception,e:
		info['content']=str(e)
	return info
#############
#######等待脚本执行功能好了以后， 这里需要分拣权限
def onelinenotice(request):
	info={'status':'False','content':[]}
	login_check_info=login_check.login_check()(request)
	if not login_check_info[0]:return HttpResponse(login_check_info[1])

def t1(request):
	a="%s---%s" %(os.getpid(),os.getppid())
	return HttpResponse(a)
@login_check.login_check('',False)
@ajax_http
def ssh_status(request):
	#####用来获取ssh检查过后的状态
	sid=request.GET.get('sid')
	status=REDIS.get("server.status.%s"%sid)
	if status is None:
		status={"status":"checking","content":"检查中"}
	else:
		status=json.loads(status)
	return status
def redirect_admin(reqeust):
	return HttpResponseRedirect('/cheungssh/admin/')
@login_check.login_check('添加命令黑名单')
@permission_check('cheungssh.command_black_create')
@ajax_http
def add_black_command(request):
	cheungssh_info={"status":True,"content":""}
	id=str(random.randint(90000000000000000000,99999999999999999999))  #########产生一个命令id
	cmd=request.GET.get('cmd')
	###########给命令增加属性
	client_info=resolv_client(request)
	client_info["id"]=id
	client_info["cmd"]=cmd
	client_info=json.dumps(client_info,encoding="utf8",ensure_ascii=False) ######写入redis [{},{}]
	REDIS.rpush('black.command.list',client_info)
	cheungssh_info["content"]=id ########把ID返回给前端，前端直接创建
	return cheungssh_info
@login_check.login_check('查看命令黑名单清单')
@permission_check('cheungssh.command_black_list')
@ajax_http
def list_black_command(request):
	cheungssh_info={"status":True,"content":""}
	list_black=REDIS.lrange("black.command.list",0,-1)
	cheungssh_info["content"]=list_black
	return cheungssh_info
@login_check.login_check('删除命令黑名单')
@permission_check('cheungssh.command_black_delete')
@ajax_http
def del_black_command(request):
	cheungssh_info={"content":"资源不存在！","status":False}
	id=request.GET.get("id")
	try:
		data=REDIS.lrange("black.command.list",0,-1)
		for _line in data:
			line=json.loads(_line)
			print str(line["id"]),str(id)
			if str(line["id"])==str(id):
				REDIS.lrem("black.command.list",_line)#####删除
				cheungssh_info["status"]=True
				break
	except Exception,e:
		print '发生了错误',e
		info["content"]=str(e)
	return cheungssh_info

@login_check.login_check('查看系统所有用户',False)
@ajax_http
def getalluser(request):
	info={"status":False}
	sysuser=[]    ########准备一个空间存放系统用户
	users=User.objects.all()
	groups=Group.objects.all()
	for a in users:
		sysuser.append(a.username)###########将username列内容提取出来
	for group in groups:
		sysuser.append(group.name)###########将username列内容提取出来
	info["status"]=True
	info["content"]=sysuser
	return info
@login_check.login_check('重置登陆失败阈值')
@permission_check('cheungssh.login_limit_set')
@ajax_http
def set_threshold(request):
	info={"status":False}
	threshold=request.GET.get('threshold')
	callback=request.GET.get('callback')
	try:
		threshold=int(threshold)
		cache.set('ip.threshold',threshold,8640000000)
		info['status']=True
	except Exception,e:
		info["content"]="参数应该是一个数字"
	return info
@login_check.login_check('查看登录失败记录')
@permission_check('cheungssh.login_fail_list')
@ajax_http
def show_ip_limit(request):
	info={"status":False,"content":[]}
	callback=request.GET.get('callback')
	R=cache.master_client
	ip_limit_list=[]
	for t in R.keys():#######从redis数据库读取所有的key
		if re.search(':1:fail\.limit.*',t):
			ip=re.sub(':1:fail\.limit\.','',t)
			ip_time=cache.get('fail.limit.%s' % (ip))
			########
			ip_threshold_r=cache.get('ip.threshold')  ######从redis中读取设定的阈值
			ip_threshold=lambda x:x if x is not None else 4 ########设定默认值
			ip_threshold=ip_threshold(ip_threshold_r)######判断从redis中读取，如果没有设定这是None，需要设定为默认的4次
			##########
			if ip_time> ip_threshold:
				ip_status="已锁定"
			else:
				ip_status="正常"
			ip_limit={"ip":ip,"ip-locate":IP.find(ip),"time":ip_time,"status":ip_status}
			ip_limit_list.append(ip_limit)
	
	info["content"]=ip_limit_list
	info["status"]=True
	return info
@login_check.login_check('删除锁定IP')
@permission_check('cheungssh.unlock_ip')
@ajax_http
def del_ip_limit(request):
	ip=request.GET.get('ip')
	info={"status":False}
	ip="fail.limit.%s" %(ip)
	cache.delete(ip)
	info["status"]=True
	return info
@login_check.login_check('设置登录安全阈值')
@permission_check('cheungssh.show_threshold')
@ajax_http
def modify_ip_limit(request):
	info={"status":False}
	limit=request.GET.get("limit")
	limit=int(limit)
	REDIS.set('ip.threshold',limit)  ######从redis中读取设定的阈值
	info["status"]=True
	return info
@login_check.login_check('查看登录安全阈值')
@permission_check('cheungssh.show_threshold')
@ajax_http
def show_ip_threshold(request):
	info={"status":False}
	ip_threshold=REDIS.get('ip.threshold')  ######从redis中读取设定的阈值
	if ip_threshold is None:
		ip_threshold=4
	else:
		ip_threshold=int(ip_threshold)
	info["content"]=ip_threshold
	info["status"]=True
	return info
@login_check.login_check('查看远程服务器文件内容')
@permission_check('cheungssh.get_remote_filecontent')
@get_file_check.check
@ajax_http #####用来处理ajax的跨域请求头消息
def get_file_content(request):
	##########################
	fid=str(random.randint(90000000000000000000,99999999999999999999))
	info={"status":False}
	host=request.GET.get('host')
	lasttime=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
	redis_info={"status":True,"content":"","progres":"0",'status':"running","lasttime":lasttime}
	cache.set("info:%s" % (fid),redis_info,360)
	username=request.user.username
	filename=request.GET.get('filename')
	filename=os.path.basename(filename)############删除用户的路径，只能是文件名
	T=FileTransfer.getconf(host,fid,username,"download") ###########这里没有采用多线程， 是单线程
	RT=cache.get("info:%s"%(fid))
	if RT['status']=='False':
		info['content']="文件下载失败,%s"%RT['content']
	else:
		if type(T)==type(None):T=(True,)
		if T[0]:
			try:
				filepath=os.path.join(downloaddir,filename)
				with open(filepath.encode('utf8')) as f:
					info["content"]="".join(f.readlines())
				info['status']='True'
			except Exception,e:
				if e.errno==2:info["content"]="文件不存在"
				else:
					info["content"]=str(e)
		else:
			info['content']=T[1]    #######如果返回值是假，那么现实信息，这是一个2单位元祖
	return info ########交给装饰器， 统一处理ajax跨域请求格式，连函数调用都不需要了
@login_check.login_check('更新远程文件内容')
@permission_check('cheungssh.up_remote_filecontent')
@ajax_http #####用来处理ajax的跨域请求头消息
def up_file_content(request):
	info={"status":False}
	content=request.POST.get('content')###########POST方式
	filename=request.POST.get('filename')  #####文件名.ip形式
	filename=os.path.basename(filename)
	filepath=os.path.join(upload_dir,filename)######一段是POST 更新， 一段是GET获取内容进度， 必须分开两个API访问，不是不能集成到一个API
	try:
		with open(filepath.encode('utf8'),'w')as f: ########前端发起第二阶段的请求，需要写入绝对路径
			f.write(content)
		info["status"]=True
	except Exception,e:
		info["content"]=str(e)
	return info
@login_check.login_check('查看可管理文件清单',False)
@permission_check('cheungssh.catadminfilelist')
@ajax_http #####用来处理ajax的跨域请求头消息
def catfilelist(request):
	info=redis_to_redis.get_redis_data('adminfilelist','list')
	return info
@login_check.login_check('设置可管理文件清单',False)
@permission_check('cheungssh.setadminfilelist')
@ajax_http #####用来处理ajax的跨域请求头消息
def setfilelist(request):
	filename=request.GET.get('filename').strip(' ')
	info=redis_to_redis.set_redis_data('adminfilelist',filename)
	return info



@login_check.login_check('查看命令执行状态',False)
@ajax_http #####用来处理ajax的跨域请求头消息
def cmdstatus(request):
	info={"status":True}
	rid=request.GET.get('rid') #############需要传递浏览器链接websocket的rid查询
	FailID=cache.get(rid)#######获取值是一个list
	if FailID is None:
		info["content"]=[]
	else:
		cache.delete(rid)#######读取完了就删除记录
		info['content']=FailID
	info["num"]=len(info['content'])
	return info
@ajax_http
def http404(request):
	info={"status":False,"content":"网页不存在"}
	return info
@ajax_http
def http500(request):
	info={"status":False,"content":"抱歉，服务器无法识别您的请求，请联系管理员!"}
	return info
@ajax_http
def test(request):
	info={"status":True,"content":"测试用"}
	return info
	return 

@login_check.login_check('查看命令执行状态',False)
@ajax_http #####用来处理ajax的跨域请求头消息
def whoami(request):
	info={"status":True,"content":""}
	username=request.user.username
	info["content"]=username
	return info
	
def login_html(request):
	return  render_to_response('login.html')
	
@login_check.login_check('查看命令执行状态',False)
@ajax_http #####用来处理ajax的跨域请求头消息
def all_parameters(request):
	info={"status":True,"content":""}
	_parameters=parameters()
	request_parameter=request.GET.get("parameter")
	if request_parameter=="serverOptions":
		info["content"]=_parameters.get_server_options()
	
	return info
#@login_check.login_check('服务器状态',False)
@ajax_http #####用来处理ajax的跨域请求头消息
def get_dashboard(request):
	info={"status":True,"content":""}
	a=process()
	info["content"]=a.get_info()
	return info
#权限清理
#@login_check.login_check('创建/修改App')
#@permission_check('cheungssh.create_app')
@ajax_http #####用来处理ajax的跨域请求头消息
def create_app(request):
	cheungssh_info={"status":False,"content":""}
	app_id=str(random.randint(90000000000000000000,99999999999999999999))
	parameters=request.POST.get("parameters")
	username=request.user.username
	username="cheungssh"
	try:
		try:
			parameters=json.loads(parameters)
		except:
			raise CheungSSHError("CHB0000000026")
		if parameters.has_key("id") and parameters["id"]:#####是修改应用,否则是创建
			app_id=parameters["id"]
		if not parameters["owner"]==username and not request.user.is_superuser:#####如果当前归属不是自己，而且自己也不是超级用户,就报错
			raise CheungSSHError("您无权转移权限!")
		data={
			"id":app_id,
			"owner":username,
			"app_name":parameters["app_name"],
			"app_command":parameters["app_command"],
			"app_check_command":parameters["app_check_command"],
			"sid":parameters["sid"],
			"alias":parameters["alias"],
			"content":"",
			"status":"新建",
			"time":time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()),
		}
		_data=json.dumps(data,encoding="utf-8",ensure_ascii=False)
		REDIS.hset("CHB-R000000000210",app_id,_data)
		cheungssh_info["content"]=data
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["content"]=str(e)
		cheungssh_info["status"]=False
	return cheungssh_info

@login_check.login_check('查看应用管理')
@permission_check('cheungssh.view_app')
@ajax_http #####用来处理ajax的跨域请求头消息
def get_app_list(request):
	username=request.user.username
	is_super=request.user.is_superuser
	return CheungSSHAppAdmin.get_app_list(username,is_super)
@login_check.login_check('执行App应用')
@permission_check('cheungssh.execute_app')
@ajax_http #####用来处理ajax的跨域请求头消息
def execute_app(request):
	appid=request.GET.get("appid")
	username=request.user.username
	is_super=request.user.is_superuser
	return  CheungSSHAppAdmin.execute_app(appid,username,is_super)

@login_check.login_check('删除App应用')
@permission_check('cheungssh.delete_app')
@ajax_http #####用来处理ajax的跨域请求头消息
def delete_app(request):
	appid=request.GET.get("appid")
	username=request.user.username
	is_super=request.user.is_superuser
	return  CheungSSHAppAdmin.delete_app(appid,username,is_super)








			
@login_check.login_check('自定义资产项查看')
@permission_check('cheungssh.custom_assets_list')	
@ajax_http
def custom_assets_class(request):
	info={"status":True,"content":""}
	a=custom_assets()
	info["content"]=a.get_assets_class()
	return info
@login_check.login_check('自定义资产创建/修改')
@permission_check('cheungssh.custom_assets_create')
@ajax_http
def increate_asset(request):
	info={"status":False,"content":""}
	id=str(random.randint(90000000000000000000,99999999999999999999))
	asset=request.GET.get("asset")
	try:
		if not asset:raise CheungSSHError("CHB0000000003")
		try:
			asset=json.loads(asset)
			a=custom_assets()
			if not asset.has_key("id"):
				_asset={id:asset}		########创建一个ID,否则是更新 {"id111":{}}
				info["content"]=id #####返回创建的ID
			else:
				#########更新资产
				_asset={asset["id"]:asset}
				#########更新动态资产的表头
				dynamic_assets=REDIS.get("assets.conf")
				dynamic_assets=json.loads(dynamic_assets)
				try:
					del dynamic_assets[asset["id"]]
					dynamic_assets=json.dumps(dynamic_assets,encoding="utf8",ensure_ascii=False)
					
					REDIS.set("assets.conf",dynamic_assets)
				except Exception,e:
					raise CheungSSHError(e)
			a.increate_asset_class(_asset)
			info["status"]=True
		except:
			raise CheungSSHError("CHB0000000004")
	except Exception,e:
		info["content"]=str(e)
		info["status"]=False
	return info
@login_check.login_check('查看资产信息')
@permission_check('cheungssh.assets_list')
@ajax_http
def load_assets_list(request):
	info={"status":True,"content":""}
	a=custom_assets()
	info["content"]=a.get_assets_class()
	return info
@login_check.login_check('自定义资产删除')
@permission_check('cheungssh.custom_assets_delete')
@ajax_http
def delete_asset_list(request):
	info={"status":True,"content":""}
	assets_list=request.GET.get("assets")
	try:
		try:
			assets_list=json.loads(assets_list)
		except:
			raise CheungSSHError("CHB0000000005")
		if not type([]) == type(assets_list):raise CheungSSHError("CHB0000000006")
		a=custom_assets()
		a.delete_assets_class(assets_list)
		info["status"]=True
	except Exception,e:
		info["content"]=str(e)
		info["status"]=False
	return info
@ajax_http
def get_progress(request):
	#print  globals.user,type(globals),111111111111111111
	#print type(globals.request),111111111
	cheungssh_info={"content":""}
	return cheungssh_info





@login_check.login_check('Docker镜像清单查看')
@permission_check('cheungssh.docker_image_list')
@ajax_http
def docker_images_list(request):
	cheungssh_info=cheungssh_docker_admin.DockerAdmin.read_docker_images_list()
	return cheungssh_info
@login_check.login_check('Docker容器清单查看')
@permission_check('cheungssh.docker_containner_list')
@ajax_http
def docker_containers_list(request):
	cheungssh_info=cheungssh_docker_admin.DockerAdmin.read_docker_containers_list()
	return cheungssh_info
@ajax_http
def docker_image_count(request):
	cheungssh_info=cheungssh_docker_admin.DockerAdmin.read_docker_image_count()
	return cheungssh_info
@ajax_http
def docker_container_count(request):
	cheungssh_info=cheungssh_docker_admin.DockerAdmin.read_docker_container_count()
	return cheungssh_info
@ajax_http
def docker_container_start(request):
	cheungssh_info={"status":False,"content":""}
	id=str(random.randint(90000000000000000000,99999999999999999999))
	cheungssh_info["content"]=id
	parameters=request.GET.get("parameters")
	try:
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000005")
		if parameters["task_type"]=="start":
			if not request.user.has_perm('cheungssh.docker_containner_start'):
				raise CheungSSHError("您无权访问该资源! 该操作已被审计，请联系管理员!")
		elif parameters["task_type"]=="stop":
			if not request.user.has_perm('cheungssh.docker_containner_stop'):
				raise CheungSSHError("您无权访问该资源! 该操作已被审计，请联系管理员!")
		elif parameters["task_type"]=="delete":
			if not request.user.has_perm('cheungssh.docker_containner_delete'):
				raise CheungSSHError("您无权访问该资源! 该操作已被审计，请联系管理员!")
		parameters["tid"]=id
		D=DockerControler(parameters)
		D.run()
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@ajax_http
def get_docker_container_progress(request):
	tid=request.GET.get("tid")
	cheungssh_info={"status":False,"content":""}
	try:
		cheungssh_info=DockerControler.get_docker_container_progress(tid=tid)
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('查看资产信息')
@permission_check('cheungssh.assets_list')
@ajax_http
def get_current_assets_data_export(request):
	cheungssh_info={"status":False,"content":""}
	tid=time.strftime("%Y%m%d%H%M",time.localtime())
	try:
		data=REDIS.get("current.assets")
		if data is None:data={}
		else:data=json.loads(data)
		title=["主机"]
		_title=[]
		for sid in data.keys():
			a=data[sid]["data"]
			for t in a.keys():
				name=a[t]["name"]
				title.append(name)
				_title.append(t)
			break;
		filename='/home/cheungssh/download/%s.csv' %tid
		f = file(filename ,'wb')
		f.write(codecs.BOM_UTF8)
		writer = csv.writer(f,dialect='excel')
		writer.writerow(title)

		for sid in data.keys():
			alias=data[sid]["alias"]
			_data=data[sid]["data"]
			_value=[alias]
			for key in _title:
				value=_data[key]["value"]
				value=re.sub("\r|\n|\r\n"," ",value)
				_value.append(value)
			writer.writerow(_value)
		f.close()
		cheungssh_info={"status":True,"content":"/cheungssh/download/file/%s.csv" % tid}
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info




@login_check.login_check('查看资产信息')
@permission_check('cheungssh.assets_list')
@ajax_http
def get_current_assets_data(request):
	cheungssh_info={"status":False,"content":""}
	try:
		data=REDIS.get("current.assets")
		if data is None:data={}
		else:data=json.loads(data)
		cheungssh_info["content"]=data
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('查看历史资产信息')
@permission_check('cheungssh.assets_list')
@ajax_http
def get_history_assets_data(request):
	cheungssh_info={"status":False,"content":""}
	try:
		cheungssh_info["status"]=True
		data=REDIS.lrange('history.assets',-50,-1)
		#data=json.loads(data)
		cheungssh_info["content"]=data
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@ajax_http
@permission_check('cheungssh.assets_list')
def get_assets_conf(request):
	cheungssh_info={"status":False,"content":""}
	try:
		data=REDIS.get("assets.conf")
		if data is None:data={}
		else:data=json.loads(data)
		cheungssh_info["content"]=data
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
class FileUploadAndDownload(Thread):
	def __init__(self,Q):
		Thread.__init__(self)
		self.Q = Q
	def run(self):
		while True:
			if self.Q.empty():
				return True
			tid,sid,sfile,dfile,action = self.Q.get()
			sfile = sfile.encode("utf-8")
			dfile = dfile.encode("utf-8")
			try:
				host=ServersInventory().get_server(sid=sid)
				if not host["status"]:raise CheungSSHError(host['content'])
				host=host['content']
				ssh=CheungSSH_SSH()
				login=ssh.login(**host)
				if not login["status"]:raise CheungSSHError(login["content"])
				if action == "upload":
					ssh.sftp_upload(tid,sid,sfile,dfile)
				else:
					ssh.sftp_download(tid,sid,sfile,dfile)
			except Exception,e:
				e = {"status":False,"content":str(e)}
				e = json.dumps(e,encoding="utf8",ensure_ascii=False)
				REDIS.hset(tid,"progress."+sid,e)
				
		
@login_check.login_check('远程文件上传')
@permission_check('cheungssh.remote_file_upload')
@ajax_http
def filetrans_upload(request):
	tid=str(random.randint(90000000000000000000,99999999999999999999))
	username=request.user.username
	cheungssh_info={"status":False,"content":""}
	try:
		parameters=request.POST.get('data')
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000008")
		#####处理源地址只能为upload目录下
		Q = Queue()
		servers = []
		for line in parameters:
			sfile=os.path.join(cheungssh_settings.upload_dir,username,os.path.basename(line["sfile"]))  #####只能是upload下的目录
			dfile=line["dfile"]
			sid = line["sid"]
			Q.put((tid,sid,sfile,dfile,"upload"))
			servers.append(sid)
		REDIS.hset(tid,"servers",json.dumps(servers))
		REDIS.hset(tid,"all_server_num",len(servers))
		for i in xrange(50):
			a=FileUploadAndDownload(Q)
			a.start()
		########sftp.logout() ##自动注销
		cheungssh_info["status"]=True
		cheungssh_info["content"]=tid
	except Exception,e:
		#####初始化写入进度，因为第一次可能还没有产生进度
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@ajax_http
def get_filetrans_progress(request):
	tid=request.GET.get("tid")
	cheungssh_info=CheungSSHFileTransfer.get_progress(tid)
	return cheungssh_info
	
@login_check.login_check('远程文件下载')
@permission_check('cheungssh.remote_file_download')
@ajax_http
def remote_download(request):
	tid=str(random.randint(90000000000000000000,99999999999999999999))
	username=request.user.username
	cheungssh_info={"status":False,"content":""}
	try:
		parameters=request.POST.get('data')
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000008")
		#####处理源地址只能为upload目录下
		Q = Queue()
		servers = []
		all_dfile = []
		for line in parameters:
			sfile = line["sfile"]
			alias = ServersInventory().get_server(sid=line["sid"])["content"]["alias"]
			alias = alias.encode("utf-8")
			filename = os.path.basename(line["sfile"])
			dfile="{alias}.{tid}.{filename}".format(alias=alias,tid=tid,filename=filename)
			d_dir = os.path.join(cheungssh_settings.download_dir,username)
			if not os.path.isdir(d_dir):os.makedirs(d_dir)
			all_dfile.append(dfile)
			dfile = os.path.join(d_dir,dfile)
			sid = line["sid"]
			Q.put((tid,sid,sfile,dfile,"download"))
			servers.append(sid)
		REDIS.hset(tid,"servers",json.dumps(servers))
		REDIS.hset(tid,"all_server_num",len(servers))
		for i in xrange(50):
			a=FileUploadAndDownload(Q)
			a.start()
		########sftp.logout() ##自动注销
		cheungssh_info["status"]=True
		cheungssh_info["content"]=tid
		cheungssh_info["all_dfile"] = all_dfile
	except Exception,e:
		#####初始化写入进度，因为第一次可能还没有产生进度
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@ajax_http
def create_tgz_pack(request):
	#####打包，然后返回一个url
	tid = time.strftime("%Y-%m-%d.%H.%M.%S",time.localtime())
	cheungssh_info={"status":False,"content":""}
	username = request.user.username
	try:
		files=request.POST.get("files")
		try:
			files=json.loads(files)
		except Exception,e:
			raise CheungSSHError("CHB0000000020")
		if not type(files)==type([]):raise CheungSSHError("CHB0000000020")
		#####切换到下载目录下
		filename="%s.tar" %tid
		url=os.path.join(cheungssh_settings.download_file_url,filename)
		if not os.path.isdir(cheungssh_settings.download_file_url):os.makedirs(cheungssh_settings.download_file_url)
		path  = os.path.join(cheungssh_settings.download_dir,username)
		os.chdir(path)
		f = tarfile.open(url,"w")
		for name in files:
			name = name.encode("utf-8")
			if not  os.path.isfile(name):continue
			f.add(name)
		f.close()
		#####打包成功
		server_head=request.META['HTTP_HOST']
		full_url="http://{server_head}{url}".format(server_head=server_head,url=url)
		cheungssh_info["content"]=full_url
		cheungssh_info["status"]=True
	except Exception,e:
		print e
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('读取脚本内容')
@permission_check('cheungssh.show_script_content')
@ajax_http
def get_script_content(request):
	return ScriptAdmin(request,REDIS).get_script_content(request.GET.get("script_name"))
@login_check.login_check('修改脚本')
@permission_check('cheungssh.create_script')
@ajax_http
def rewrite_script_content(request):
	return ScriptAdmin(request,REDIS).rewrite_script_content()
@login_check.login_check('创建脚本')
@permission_check('cheungssh.create_script')
@ajax_http
def write_script_content(request):
	action=request.POST.get("action")
	if action=="update":
		return ScriptAdmin(request,REDIS).rewrite_script_content()
	else:
		return ScriptAdmin(request,REDIS).create_script()
@login_check.login_check('执行脚本')
@permission_check('cheungssh.execute_script')
@ajax_http
def init_script(request):
	return ScriptAdmin(request,REDIS).init_script()
	
@ajax_http
def get_my_file_list(request):
	username=request.user.username
	cheungssh_info={"content":[],"status":False}#####默认是空列表
	try:
		_dir=os.path.join(cheungssh_settings.upload_dir,username)
		try:
			file_list=os.listdir(_dir)#####当前账户可能还没有上传过文件,所以默认是空
			cheungssh_info["content"]=file_list
		except:
			pass
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check("获取批量部署任务清单")
@permission_check("cheungssh.get_deployment_batch_list")
@ajax_http
def get_batch_deployment_task(request):
	username=request.user.username
	is_super=request.user.is_superuser
	return DeploymentAdmin.get_batch_task_conf(username,is_super)




@login_check.login_check("创建批量部署任务")
@permission_check("cheungssh.deployment_batch_create")
@ajax_http
def batch_create_deployment_task(request):
	username=request.user.username
	data=request.POST.get("data")
	return DeploymentAdmin.batch_create_task_conf(data,username)




@login_check.login_check('创建部署任务')
@permission_check('cheungssh.deployment_create')
@ajax_http
def create_deployment_task(request):
	username=request.user.username
	data=request.POST.get("data")
	return DeploymentAdmin.create_task_conf(data,username)
@login_check.login_check('部署清单查看')
@permission_check('cheungssh.deployment_list')
@ajax_http
def get_deployment_task(request):
	username=request.user.username
	is_super=request.user.is_superuser
	return DeploymentAdmin.get_task_conf(username,is_super)


@login_check.login_check("批量删除部署任务")
@permission_check("cheungssh.deployment_batch_delete")
@ajax_http
def delete_batch_deployment_task(request):
	username=request.user.username
	is_super=request.user.is_superuser
	taskid=request.GET.get("taskid")
	return DeploymentAdmin.delete_batch_task_conf(username,is_super,taskid)



@login_check.login_check('删除部署任务')
@permission_check('cheungssh.deployment_delete')
@ajax_http
def delete_deployment_task(request):
	username=request.user.username
	is_super=request.user.is_superuser
	taskid=request.GET.get("taskid")
	return DeploymentAdmin.delete_task_conf(username,is_super,taskid)


@login_check.login_check("执行批量部署任务")
@permission_check("cheungssh.batch_deployment_execute")
@ajax_http
def start_batch_deployment_task(request):
	cheungssh_info={"content":"","status":False}
	taskid=request.GET.get("taskid")
	try:
		if taskid is None:raise CheungSSHError("非法请求!")
		a=DeploymentAdmin(taskid)
		cheungssh_info=a.run_batch_deployment()
	except Exception,e:
		cheungssh_info={"content":str(e),"status":False}
	return cheungssh_info


@login_check.login_check('执行灰度部署任务')
@permission_check('cheungssh.deployment_execute')
@ajax_http
def start_deployment_task(request):
	cheungssh_info={"content":"","status":False}
	taskid=request.GET.get("taskid")
	try:
		if taskid is None:raise CheungSSHError("非法请求!")
		a=DeploymentAdmin(taskid)
		cheungssh_info=a.demo()
	except Exception,e:
		cheungssh_info={"content":str(e),"status":False}
	return cheungssh_info
@login_check.login_check('部署进度查看')
@permission_check('cheungssh.deployment_progress')
@ajax_http
def get_deployment_progress(request):
	taskid=request.GET.get("taskid")
	cheungssh_info=DeploymentAdmin.get_progress(taskid)
	return cheungssh_info

@login_check.login_check('登录记录查看')
@permission_check('cheungssh.login_success_history')
@ajax_http
def login_success_log(request):
	cheungssh_info={"content":[],"status":True}
	data=REDIS.lrange("CHB-R00000000101",0,-1)
	for line in data:
		_data=json.loads(line)
		cheungssh_info["content"].append(_data)
	return cheungssh_info

@login_check.login_check('创建服务器')
@permission_check('cheungssh.create_server')
@ajax_http
def batch_create_servers(request):
	hosts=request.POST.get("hosts")#####用POST方式传递参数
	cheungssh_info={"content":"","status":False}
	try:
		_hosts=hosts.split('\n')
		i=0
		real_i=0
		config_data=[];
		for line in _hosts:
			i+=1
			line=re.sub("^ *","",line)
			if re.search("^ *$",line):
				#####跳过空行
				continue
			elif re.search("^#",line):
				#####跳过注释行
				continue
			else:
				#####真正的行
				real_i+=1
				segment=line.split()
				if len(segment)<12:
					raise CheungSSHError("在第【%d行】,您指定的配置字段少于12个，请您填写完整的配置信息。如果字段为空的，请使用#代替。" %i)
				_port=segment[5]
				try:
					_port=int(_port)
				except ValueError:
					raise CheungSSHError("在第【%d】行，第6个字段，端口必须是一个数字。"%i)
				#####检查sudo方式
				_sudo=segment[6].upper()
				if not _sudo=="N" and not _sudo=="Y":
					raise CheungSSHError("在第【%d】行，第7个字段，sudo方式必须为'Y'或者'N'。"%(i))
				#####su方式
				_su=segment[8].upper()
				if not _su=="N" and  not _su=="Y":
					raise CheungSSHError("在第【%d】行，第9个字段，su方式必须为'Y'或者'N'。"%(i))
				config_line={
					"ip":segment[0],
					"alias":segment[1],
					"owner":request.user.username,
					"group":segment[2],
					"username":segment[3],
					"password":segment[4],
					"port":_port,
					"sudo":_sudo,
					"sudo_password":segment[7],
					"su":_su,
					"su_password":segment[9],
					"os_type":segment[10],
					"description":segment[11],
				}
				######创建前先检查是否存在相同别名
				if ServersInventory().query_server(alias=config_line["alias"])["status"]:
					raise CheungSSHError("在第【{line_number}】行，别名【{alias}】早已存在，请更换。".format(line_number=i,alias=config_line["alias"]))
				else:
					#####存储起来,最后成功了统一入库
					ServersList(**config_line).save()
		if len(hosts)==0:
			raise CheungSSHError("您尚未指定有效的服务器置行！")
		cheungssh_info["content"]="已成功添加配置."
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
	
@login_check.login_check('',False)
@ajax_http
def get_login_user_list(request):
	return CheungSSHLoginUserNotify.get_login_user_list(request)

@login_check.login_check('',False)
@permission_check('cheungssh.access_history')
@ajax_http
def page_access_history(request):
	return cheungssh_page_audit.CheungSSHPageAudit.get_access_history(request)




@login_check.login_check('创建拓扑设备')
@permission_check('cheungssh.create_device')
@ajax_http
def add_device(request):
	data=request.GET.get("device")
	data=json.loads(data)
	data["owner"]=request.user.username
	return Topology.add_device(data)
@login_check.login_check('查看拓扑')
@permission_check('cheungssh.get_device')
@ajax_http
def get_device(request):
	return Topology.get_device()

@login_check.login_check('保存拓扑')
@permission_check('cheungssh.save_topology')
@ajax_http
def save_topology(request):
	data=request.GET.get("topology")
	data=json.loads(data)
	username=request.user.username
	return Topology.save_topology(data,username)
@login_check.login_check('',False)
@ajax_http
def my_topology(request):
	username=request.user.username
	return Topology.my_topology(username)

@login_check.login_check('单独登录SSH')
@permission_check('cheungssh.active_ssh')
@ajax_http
def active_ssh(request):
	sid=request.GET.get("sid")
	return CheungSSHActiveSSH().run(sid)

@login_check.login_check('',False)
@ajax_http
def get_active_ssh_result(request):
	log_key=request.GET.get("log_key")
	return CheungSSHActiveSSH.get_result(log_key)
@login_check.login_check('独立命令')
@ajax_http
def add_active_ssh_command(request):
	cmd=request.GET.get("cmd")
	cmd_key=request.GET.get("cmd_key")
	return CheungSSHActiveSSH.add_command(cmd,cmd_key)
@login_check.login_check('获取计划任务列表')
@permission_check("cheungssh.get_crontab_list")
@ajax_http
def get_crontab_list(request):
	sid = request.GET.get("sid")
	return Crontab().get_crontab_list(sid)
@login_check.login_check("删除计划任务")
@permission_check("delete.get_crontab_list")
@ajax_http
def delete_crontab_list(request):
	data=request.GET.get("data")
	data = json.loads(data)
	return Crontab().delete_crontab_list(data)
@login_check.login_check("创建/修改计划任务")
@permission_check('cheungssh.create_or_modify_crontab')
@ajax_http
def modify_crontab_list(request):
	action=request.POST.get("action")#####指定行为，modify/create
	data=request.POST.get("data")
	data=json.loads(data)
	return Crontab().modify_crontab_list(action=action,data=data)

@login_check.login_check("分析本地日志文件")
@ajax_http
def local_analysis_log(request):
	filename=request.GET.get("filename")
	realname=request.GET.get("realname")
	date=request.GET.get("date")
	username=request.user.username
	full_path=os.path.join(cheungssh_settings.upload_logfile_dir,username,filename)
	return CheungSSHAnalysisWebView.get_local_analysis_data(filename=full_path,date=date)
@login_check.login_check("获取日志文件日期")
@ajax_http
def get_date_analysis_log(request):
	filename=request.GET.get("filename")
	realname=request.GET.get("realname")
	realname=realname.encode('utf-8')
	_type=request.GET.get("type")
	username=request.user.username
	full_path=os.path.join(cheungssh_settings.upload_logfile_dir,username,filename)
	real_path=os.path.join(cheungssh_settings.upload_logfile_dir,username,realname)
	return CheungSSHAnalyLog.get_logfile_date(full_path,real_path,_type)
@login_check.login_check("创建远程日志分析路径")
@ajax_http
def add_remote_analysis_logfile(request):
	path=request.GET.get("path")
	sid=request.GET.get("sid")
	alias=request.GET.get("alias")
	data={"path":path,"sid":sid,"alias":alias}
	return CheungSSHAnalysisWebView.add_remote_analysis_logfile(data)

@login_check.login_check("创建远程日志分析路径")
@ajax_http
def get_remote_analysis_logfile_info(request):
	return CheungSSHAnalysisWebView.get_remote_analysis_logfile_info()
@login_check.login_check("删除远程日志分析路径")
@ajax_http
def delete_remote_analysis_logfile_info(request):
	tid=request.GET.get("tid")
	return CheungSSHAnalysisWebView.delete_remote_analysis_logfile_info(tid)
@login_check.login_check("删除远程日志分析路径")
@ajax_http
def get_to_web_middleware_info(request):
	return CheungSSHMiddleware.get_to_web_middleware_info()

@ajax_http
def get_os_type(request):
	return {"content":cheungssh_os.CheungSSHOSVersion.os_type,"status":True}
@ajax_http
def save_deployment_crontab(request):
	data=request.GET.get("data")
	data=json.loads(data)
	whoami=request.user.username
	return CheungSSHDeploymentCrontab.save_deployment_crontab(data,whoami)
@ajax_http
def get_deployment_crontab(request):
	whoami=request.user.username
	is_super=request.user.is_superuser
	return CheungSSHDeploymentCrontab.get_deployment_crontab(is_super,whoami)

@ajax_http
def delete_deployment_crontab(request):
	owner=request.GET.get("owner")
	is_super=request.user.is_superuser
	tid=request.GET.get("tid")
	return CheungSSHDeploymentCrontab.delete_deployment_crontab(is_super,owner,tid)
@login_check.login_check("查看脚本历史版本")
@ajax_http
def get_scripts_historic_list(request):
	return ScriptAdmin(request,REDIS).get_scripts_historic_list()
@login_check.login_check("重置脚本版本")
@ajax_http
def set_script_active_version(request):
	return ScriptAdmin(request,REDIS).set_script_active_version()
@login_check.login_check("查看脚本的历史内容")
@ajax_http
def get_script_historic_content(request):
	return ScriptAdmin(request,REDIS).get_script_historic_content();
@login_check.login_check("查看脚本的历史参数")
@ajax_http
def get_script_historic_parameters(request):
	return ScriptAdmin(request,REDIS).get_script_historic_parameters()
@login_check.login_check("修改脚本状态")
@ajax_http
def change_executable_status(request):
	return ScriptAdmin(request,None).change_executable_status()
@login_check.login_check("",False)
@ajax_http
def get_server_groups(request):
	return ServersInventory().get_server_groups(request.GET.get("script_id"),request.GET.get("all_os"))
@login_check.login_check("",False)
@ajax_http
def get_script_parameter(request):
	return ScriptAdmin(request,None).get_script_parameter()
@login_check.login_check("",False)
@ajax_http
def get_script_init_progress(request):
	return ScriptAdmin(None,REDIS).get_script_init_progress(request.GET.get("tid"))
@login_check.login_check("",False)
@ajax_http
def get_server_alias(request):
	return ServersInventory().get_server_alias(request.POST.get("servers"))
@login_check.login_check("查看远程文件内容")
@ajax_http
def get_remote_file_content(request):
	return RemoteFileAdmin().get_remote_file_content(request)
@login_check.login_check("创建远程文件路径")
@ajax_http
def add_remote_file_path(request):
	return RemoteFileAdmin().create_path(request)
@login_check.login_check("创建远程文件路径")
@ajax_http
def get_remote_file_list(request):
	return RemoteFileAdmin().get_remote_file_list()
@login_check.login_check("编辑远程文件内容")
@ajax_http
def write_remote_file_content(request):
	return RemoteFileAdmin().write_remote_file_content(request)
@login_check.login_check("查看文件历史清单")
@ajax_http
def get_remote_file_historic_list(request):
	return RemoteFileAdmin().get_remote_file_historic_list(request)
@login_check.login_check("恢复远程文件历史版本")
@ajax_http
def enable_remote_file_history_version(request):
	return RemoteFileAdmin().enable_remote_file_history_version(request)
@login_check.login_check("查看远程文件历史内容")
@ajax_http
def get_remote_file_historic_content(request):
	return RemoteFileAdmin().get_remote_file_historic_content(request)
@login_check.login_check("修改远程文件权限")
@ajax_http
def change_file_permission(request):
	return RemoteFileAdmin().change_file_permission(request)
@login_check.login_check("删除远程文件清单")
@permission_check('cheungssh.delete_remote_file_list')
@ajax_http
def delete_remote_file_list(request):
	return RemoteFileAdmin().delete_remote_file_list(request)
@login_check.login_check("保存批量命令设置")
@ajax_http
def save_batch_shell_configuration(request):
	return BatchShellAdmin().save_batch_shell_configuration(request)
@login_check.login_check("查看批量命令清单")
@ajax_http
def get_batch_shell_list(request):
	return BatchShellAdmin().get_batch_shell_list(request)
@login_check.login_check("删除批量命令清单")
@ajax_http
def del_batch_shell(request):
	return BatchShellAdmin().del_batch_shell(request)

@login_check.login_check("保存黑名单")
@permission_check("cheungssh.save_black_list")
@ajax_http
def save_black_list(request):
	return BlackListAdmin().save_black_list(request)
@login_check.login_check("查看黑名单")
@permission_check("cheungssh.get_black_list")
@ajax_http
def get_black_list(request):
	return BlackListAdmin().get_black_list()
@login_check.login_check("删除黑名单")
@permission_check("cheungssh.del_black_list")
@ajax_http
def del_black_list(request):
	return BlackListAdmin().del_black_list(request)
@login_check.login_check("保存黑名单组")
@permission_check("cheungssh.save_black_list_group")
@ajax_http
def save_black_list_group(request):
	return BlackListGroupAdmin().save_black_list_group(request)
@login_check.login_check("查看黑名单组")
@permission_check("cheungssh.get_black_list_group")
@ajax_http
def get_black_list_group(request):
	return BlackListGroupAdmin().get_black_list_group()
@login_check.login_check("删除黑名单组")
@permission_check("cheungssh.del_black_list_group")
@ajax_http
def del_black_list_group(request):
	return BlackListGroupAdmin().del_black_list_group(request)
@login_check.login_check("",False)
@ajax_http
def get_user_and_black_list_group(request):
	return UserAndBlackList().get_user_and_black_list_group()
@login_check.login_check("绑定用户与黑名单")
@permission_check("cheungssh.bind_user_with_black_list_group")
@ajax_http
def save_user_with_black_list_group(request):
	return UserAndBlackList().save_user_with_black_list_group(request)
@login_check.login_check("查看用户绑定的黑名单")
@permission_check("cheungssh.get_user_with_black_list_group")
@ajax_http
def get_user_with_black_list_group(request):
	return UserAndBlackList().get_user_with_black_list_group(request)
@login_check.login_check("删除用户绑定的黑名单")
@permission_check("cheungssh.del_user_with_black_list_group")
@ajax_http
def del_user_with_black_list_group(request):
	return UserAndBlackList().del_user_with_black_list_group(request)
@login_check.login_check("绑定业务操作")
@permission_check("cheungssh.save_service_operation")
@ajax_http
def save_service_operation(request):
	return ServiceOperation(request).save_service_operation()
@login_check.login_check("常看业务操作")
@permission_check("cheungssh.get_service_operation")
@ajax_http
def get_service_operation(request):
	return ServiceOperation(request).get_service_operation()
@login_check.login_check("删除业务操作")
@permission_check("cheungssh.del_service_operation")
@ajax_http
def del_service_operation(request):
	return ServiceOperation(request).del_service_operation()
@login_check.login_check("执行业务操作")
@permission_check("cheungssh.init_script_for_service_operation")
@ajax_http
def init_script_for_service_operation(request):
	return ScriptAdmin(request,REDIS).init_script_for_service_operation()
@ajax_http
def get_login_progress(r):
	return CheungSSHCommandSystem(r,REDIS).get_login_progress()
