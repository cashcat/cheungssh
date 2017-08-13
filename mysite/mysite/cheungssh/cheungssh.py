#coding:utf-8
import sys,os,json,random,commands,queue_task,time,threading
sys.path.append('/home/cheungssh/bin')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh/deployment_protocol')
import csv
import codecs
from cheungssh_system_version import cheungssh_os
from cheungssh_middleware.cheungssh_middleware import CheungSSHMiddleware
from analysis_log.cheungssh_analysis_log import CheungSSHAnalyLog
from analysis_log.cheungssh_web_analysis_view import CheungSSHAnalysisWebView
from crontab.cheungssh_crontab_controler import CheungSSHCrontabControler
from cheungssh_active_ssh import CheungSSHActiveSSH
from network_topology import Topology
import cheungssh_page_audit
from cheungssh_login import CheungSSHLoginUserNotify
from cheungssh_app_admin import CheungSSHAppAdmin
import get_file_check
from deployment_protocol.cheungssh_deployment_admin import DeploymentAdmin
from remote_file_admin import RemoteFileAdmin
from cheungssh_ssh_check import CheungSSHCheck
from cheungssh_error import CheungSSHError
from client_info import resolv_client
from django.contrib.auth.models import User,Group
from django.http import  HttpResponse,HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate,login,logout
from mysite.cheungssh.models import ServerConf
import path_search,crond_record
from permission_check import permission_check
from Return_http import ajax_http
from parameters import parameters
from cheungssh_thread_queue import CheungSSHPool
import cheungssh_modul_controler
from crontab.cheungssh_crontab_controler import CheungSSHCrontabControler
from cheungssh_script import CheungSSHScript
import IP
import cheungssh_web,login_check
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

REDIS=cache.master_client
from cheungssh_file_transfer import CheungSSHFileTransfer
from cheungssh_thread_queue import CheungSSHThreadAdmin
from cheungssh_docker_controler import DockerControler
import cheungssh_docker_admin

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
	ip_threshold_r=cache.get('ip.threshold')  
	ip_threshold=lambda x:x if x is not None else 4 
	ip_threshold=ip_threshold(ip_threshold_r)
	if cache.has_key(limit_ip):
		if cache.get(limit_ip)>ip_threshold:  
			info['content']="系统已经拒绝您登陆,请联系管理员!"
			cache.incr(limit_ip)  
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
				request.session.set_expiry(0)    
				if cache.has_key(limit_ip):cache.delete(limit_ip)
				login_info=resolv_client(request)
				login_info["sid"]=str(request.session.session_key)
				CheungSSHLoginUserNotify.add_login_user(login_info)
				login_info=json.dumps(login_info,encoding="utf8",ensure_ascii=False)
				REDIS.lpush("CHB-R00000000101",login_info)
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
		
	else:
		info["content"]="No Get"
        return info
@login_check.login_check('登录记录',False)
@permission_check('cheungssh.show_sign_record')
@ajax_http
def show_sign_record(request):
	datainfo=redis_to_redis.get_redis_data('sign.record','list')  
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

@login_check.login_check('删除SSHKey')
@permission_check('cheungssh.delete_keyfile')
@ajax_http
def delete_keyfile(request):
	username=request.user.username
	cheungssh_info={"status":False,"content":""}
	try:
		parameters=request.GET.get("parameters")
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000022")
		if not type({})== type(parameters):raise CheungSSHError("CHB0000000022")
		owner=parameters["username"]
		filename=parameters["filename"]
		if request.user.is_superuser:
			
			full_path=os.path.join(cheungssh_settings.keyfile_dir,username,filename)
			
		else:
			
			if not username==owner:
				raise CheungSSHError("CHB0000000023")
			else:
				
				pass
		if not os.path.isfile(full_path):
			
			pass
		else:
			os.remove(full_path) 
		line={"owner":username,"keyfile":filename}
		line=json.dumps(line,encoding="utf8",ensure_ascii=False)
		REDIS.lrem("keyfile.list",line,0) 
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('本地上传文件')
@ajax_http
def upload_keyfile(request):
	username=request.user.username
	cheungssh_info={"status":True,"content":""}
	fid=str(random.randint(90000000000000000000,99999999999999999999))
	info={"status":False,"content":"","path":""}
	if request.method=="POST":
		filename=str(request.FILES.get("file"))
		file_content=request.FILES.get('file').read()
		os.chdir(cheungssh_settings.keyfile_dir)
		
		full_dir=os.path.join(cheungssh_settings.keyfile_dir,username)
		if not os.path.isdir(full_dir):
			
			os.mkdir(username)
		os.chdir(username)
		with open(filename.encode('utf8'),"wb") as f:
			f.write(file_content)
		line={"owner":username,"keyfile":filename}
		line=json.dumps(line,encoding="utf8",ensure_ascii=False)
		REDIS.rpush("keyfile.list",line)
	return cheungssh_info
@ajax_http
def show_keyfile_list(request):
	cheungssh_info={"status":False,"content":[]}
	username=request.user.username
	try:
		data=REDIS.lrange("keyfile.list",0,-1)
		for _line in data:
			line=json.loads(_line)
			if username==line["owner"] or request.user.is_superuser:
				
				cheungssh_info["content"].append(line)
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('PC上传') 


@ajax_http
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


@login_check.login_check('上传分析日志') 


@ajax_http
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



@ajax_http
def delete_script(request):
	username=request.user.username
	filename=request.GET.get("filename")
	cheungssh_info={"status":False,"content":""}
	full_path=os.path.join(cheungssh_settings.script_dir,username,filename)
	try:
		data=REDIS.hget("scripts",filename)
		if data is None:
			pass
		else:
			data=json.loads(data)
			if filename==data["script"] and (request.user.is_superuser or username==data["owner"]):
				REDIS.hdel("scripts",filename)
				try:
					os.remove(full_path)
					print "delte.."
				except:
					pass
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["content"]=str(e)
		cheungssh_info["status"]=False
	return cheungssh_info
@login_check.login_check('查看脚本清单')
@permission_check('cheungssh.scripts_list')
@ajax_http
def scripts_list(request):
	username=request.user.username
	cheungssh_info={"status":False,"content":""}
	try:
		
		data=REDIS.hgetall("scripts")
		for filename in data.keys():
			_data=json.loads(data[filename])
			if request.user.is_superuser or username==_data["owner"]:
				data[filename]=_data
		cheungssh_info["content"]=data
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["content"]=str(e)
		cheungssh_info["status"]=False
	return cheungssh_info

@login_check.login_check('上传脚本')
@ajax_http
def upload_script(request):
	cheungssh_info={"status":False,"content":""}
	username=request.user.username
	if request.method=="POST":
		try:
			if len(REDIS.hgetall("scripts"))>=9:raise CheungSSHError("CHB-BUSINESS-LIMIT")
			filename=str(request.FILES.get("file"))
			_data=REDIS.hget("scripts",filename)
			if _data is None:
				pass
			else:
				data=json.loads(_data)
				if filename==data["script"]:
					if username==data["owner"]:
						pass
					else:
						raise CheungSSHError("您的操作不被允许!其他账户下存在同名脚本!")
			file_content=request.FILES.get('file').read()
			parent_dir=os.path.join(cheungssh_settings.script_dir,username)
			if not os.path.isdir(parent_dir):os.mkdir(parent_dir)
			script=os.path.join(parent_dir,filename)
			with open(script.encode('utf8'),"wb") as f:
				f.write(file_content)
			cheungssh_info["content"]={
				"script":filename,
				"owner":username,
				"time":time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()),
			}
			
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

@login_check.login_check('服务器信息修改')
@permission_check('cheungssh.modify_server')
@ajax_http
def config_modify(request):
	cheungssh_info={"content":"该服务器不存在 !","status":False}
	host=request.GET.get('host')
	username=request.user.username
	is_super=request.user.is_superuser
	try:
		try:
			host=json.loads(host)
		except Exception,e:
			raise CheungSSHError("CHB0000000008")
		servers_list=REDIS.lrange("servers.config.list",0,-1)
		if servers_list is None:raise CheungSSHError("当前系统没有服务器")
		else:
			id=host["id"]
			for _s in servers_list:
				
				s=json.loads(_s)
				if str(id)==s["id"]:
					if username==host["owner"] or is_super:
						
						if host["password"]         == "******":
							host["password"]=s["password"]
						if host["sudo_password"]    == "******":
							host["sudo_password"]=s["sudo_password"]
						if host["su_password"]      == "******":
							host["su_password"]=s["su_password"]
						if host["keyfile_password"] == "******":
							host["keyfile_password"]=s["keyfile_password"]
						REDIS.lrem("servers.config.list",_s,0) 
						host=json.dumps(host,encoding="utf8",ensure_ascii=False)
						REDIS.rpush("servers.config.list",host) 
						cheungssh_info["status"]=True
						cheungssh_info["content"]=""
						break
	except Exception,e:
		cheungssh_info['content']=str(e)
		cheungssh_info["status"]=False
	return cheungssh_info




@login_check.login_check('创建服务器')
@permission_check('cheungssh.create_server')
@ajax_http
def config_add(request):
	host =request.GET.get("host")
        cheungssh_info={"content":"","status":False}
	id=str(random.randint(90000000000,99999999999))
	client_info=resolv_client(request)
	try:
		try:
			host=json.loads(host)
		except Exception,e:
			print host
			raise CheungSSHError("CHB0000000006")
		host["id"]=id
		cheungssh_info["content"]=id 
		host["owner"]=client_info["owner"]
		host=json.dumps(host,encoding="utf8",ensure_ascii=False) 
		REDIS.rpush("servers.config.list",host)
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info['content']=str(e)
	return cheungssh_info
@login_check.login_check('查看服务器配置',False)

@ajax_http
def load_servers_list(request):
	cheungssh_info={"content":[],"status":True}
	servers_list=REDIS.lrange("servers.config.list",0,-1)
	username=request.user.username
	is_super=request.user.is_superuser
	if servers_list is None:
		cheungssh_info["content"]=[] 
	else:
		
		for _line in servers_list:
			line=json.loads(_line)
			if username==line["owner"]  or is_super :
				
				line["password"]        ="******"
				line["su_password"]     ="******"
				line["sudo_password"]   ="******"
				line["keyfile_password"]="******"
				
				status=REDIS.get("server.status.%s" % line["id"])
				
				if status is None:
					status={
						"status":"checking",
						"content":"检查中"
					}
				else:
					status=json.loads(status)
				line["status"]=status
				cheungssh_info["content"].append(line)
	return cheungssh_info
				
		
			
@login_check.login_check('删除服务器')
@permission_check('cheungssh.delete_server')
@ajax_http
def config_del(request):
	cheungssh_info={"content":"","status":False}
	hosts=request.GET.get("hosts") 
	is_super=request.user.is_superuser
	username=request.user.username
	try:
		try:
			hosts=json.loads(hosts) 
			if not type([])==type(hosts)  or len(hosts)==0:raise CheungSSHError("CHB0000000007-1")
		except Exception,e:
			raise CheungSSHError("CHB0000000007")
		servers_list=REDIS.lrange("servers.config.list",0,-1)
		for h in hosts:
			for _s in servers_list:
				s=json.loads(_s)
				if str(h)==str(s["id"]):
					if username==s["owner"] or is_super:
						
						
						REDIS.lrem("servers.config.list",_s,0) 
					else:
						raise CheungSSHError("您无权删除该服务器!")
					break
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info['content']=str(e)
	return cheungssh_info

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
	if platform.dist()[0]=='Ubuntu':    
		crond_status=(0,'')
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
	cheungssh_info={"content":{"content":"","stage":"running","status":None}, "status":True,"progress":0}
	tid=request.GET.get("tid")
	sid=request.GET.get("sid")
	content="" 
	try:
		total=REDIS.get("total.%s" % tid)
		current=REDIS.get("current.%s" % tid)
		try:
			if total is None or current is None: progress=0 
			else:progress= "%0.2f"  % (float(current) / float(total) * 100)
		except Exception,e:
			raise CheungSSHError("CHB0000000012")
		cheungssh_info["progress"]=progress
		log_name="log.%s.%s" % (tid,sid)
		LLEN=REDIS.llen(log_name) 
		if not LLEN==0:
			for i in range(LLEN):
				_content=REDIS.lpop(log_name)
				_content=json.loads(_content) 
				content+=_content["content"]
				cheungssh_info["content"]={"content":content,"stage":_content["stage"],"status":_content["status"]}
			cheungssh_info["content"]["content"]=re.sub("""\x1B\[[0-9;]*[mK]""","",cheungssh_info["content"]["content"])
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
	
@login_check.login_check('执行命令')
@permission_check('cheungssh.execute_command')
@black_command_check
@ajax_http
def execute_command(request):
	cheungssh_info={"status":False,'content':""}
	try:
		
		id=str(random.randint(90000000000000000000,99999999999999999999))
		
		parameter=request.POST.get("parameters") or request.GET.get("parameters") 
		if not parameter:
			raise CheungSSHError("错误码:CHB0000000000")
		try:
			parameter=json.loads(parameter)
		except:
			raise CheungSSHError("错误码:CHB0000000001")
		try:
			servers=parameter["servers"]
			cmd=parameter["cmd"]
		except:
			raise CheungSSHError("错误码:CHB0000000002")
		
		
		
		parameter["tid"]=id 
		CheungSSHThread=CheungSSHThreadAdmin()

		CheungSSHThread.run(parameter)


		client_info=resolv_client(request)
		client_info["cmd"]=cmd
		#client_info["parameter"]=parameter
		client_info=dict(client_info,**parameter)
		
		init_status={"content":"","status":False,"stage":"running"}#stage为running或者done,
		client_info=dict(client_info,**init_status)
		
		servers=client_info["servers"]
		_alias=[]
		for sid in servers:
			try:
				host_alias=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)["content"]["alias"]		
				_alias.append(host_alias)
			except Exception,e:
				
				pass
		client_info["alias"]=_alias
		
		client_info=json.dumps(client_info,encoding="utf8",ensure_ascii=False)
		
		REDIS.rpush('command.history',client_info)
		cheungssh_info["content"]=id
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
	

@login_check.login_check('命令操作日志')
@permission_check('cheungssh.command_history')
@ajax_http
def command_history(request):
	#t["result"]=re.sub("""\\"|\\'""",'',"</br>".join(cmd_result))
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
	
	info={"status":False}
	try:
		filenames=request.GET.get('filename') 
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
	
	sid=request.GET.get('sid')
	status=REDIS.get("server.status.%s"%sid)
	if status is None:
		status={"status":"checking","content":"检查中"}
	else:
		status=json.loads(status)
	return status
@ajax_http
def ssh_check(request):
	
	sid=request.GET.get('sid')
	
	ssh=CheungSSHCheck(sid=sid)
	ssh.run()
	
	status=REDIS.get("server.status.%s"%sid)
	if status is None:
		status={
			"status":"checking",
			"content":"检查中",
			"time":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
		}
	else:
		status=json.loads(status)
	status["alias"]=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)["content"]["alias"]
	return status
def redirect_admin(reqeust):
	return HttpResponseRedirect('/cheungssh/admin/')
@login_check.login_check('添加命令黑名单')
@permission_check('cheungssh.command_black_create')
@ajax_http
def add_black_command(request):
	cheungssh_info={"status":True,"content":""}
	id=str(random.randint(90000000000000000000,99999999999999999999))  
	cmd=request.GET.get('cmd')
	
	client_info=resolv_client(request)
	client_info["id"]=id
	client_info["cmd"]=cmd
	client_info=json.dumps(client_info,encoding="utf8",ensure_ascii=False) 
	REDIS.rpush('black.command.list',client_info)
	cheungssh_info["content"]=id 
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
				REDIS.lrem("black.command.list",_line)
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
	sysuser=[]    
	users=User.objects.all()
	groups=Group.objects.all()
	for a in users:
		sysuser.append(a.username)
	for group in groups:
		sysuser.append(group.name)
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
	for t in R.keys():
		if re.search(':1:fail\.limit.*',t):
			ip=re.sub(':1:fail\.limit\.','',t)
			ip_time=cache.get('fail.limit.%s' % (ip))
			
			ip_threshold_r=cache.get('ip.threshold')  
			ip_threshold=lambda x:x if x is not None else 4 
			ip_threshold=ip_threshold(ip_threshold_r)
			
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
	REDIS.set('ip.threshold',limit)  
	info["status"]=True
	return info
@login_check.login_check('查看登录安全阈值')
@permission_check('cheungssh.show_threshold')
@ajax_http
def show_ip_threshold(request):
	info={"status":False}
	ip_threshold=REDIS.get('ip.threshold')  
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
@ajax_http 
def get_file_content(request):
	
	fid=str(random.randint(90000000000000000000,99999999999999999999))
	info={"status":False}
	host=request.GET.get('host')
	lasttime=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
	redis_info={"status":True,"content":"","progres":"0",'status':"running","lasttime":lasttime}
	cache.set("info:%s" % (fid),redis_info,360)
	username=request.user.username
	filename=request.GET.get('filename')
	filename=os.path.basename(filename)
	T=FileTransfer.getconf(host,fid,username,"download") 
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
			info['content']=T[1]    
	return info 
@login_check.login_check('更新远程文件内容')
@permission_check('cheungssh.up_remote_filecontent')
@ajax_http 
def up_file_content(request):
	info={"status":False}
	content=request.POST.get('content')
	filename=request.POST.get('filename')  
	filename=os.path.basename(filename)
	filepath=os.path.join(upload_dir,filename)
	try:
		with open(filepath.encode('utf8'),'w')as f: 
			f.write(content)
		info["status"]=True
	except Exception,e:
		info["content"]=str(e)
	return info
@login_check.login_check('查看可管理文件清单',False)
@permission_check('cheungssh.catadminfilelist')
@ajax_http 
def catfilelist(request):
	info=redis_to_redis.get_redis_data('adminfilelist','list')
	return info
@login_check.login_check('设置可管理文件清单',False)
@permission_check('cheungssh.setadminfilelist')
@ajax_http 
def setfilelist(request):
	filename=request.GET.get('filename').strip(' ')
	info=redis_to_redis.set_redis_data('adminfilelist',filename)
	return info



@login_check.login_check('查看命令执行状态',False)
@ajax_http 
def cmdstatus(request):
	info={"status":True}
	rid=request.GET.get('rid') 
	FailID=cache.get(rid)
	if FailID is None:
		info["content"]=[]
	else:
		cache.delete(rid)
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
@ajax_http 
def whoami(request):
	info={"status":True,"content":""}
	username=request.user.username
	info["content"]=username
	return info
	
def login_html(request):
	return  render_to_response('login.html')
	
@login_check.login_check('查看命令执行状态',False)
@ajax_http 
def all_parameters(request):
	info={"status":True,"content":""}
	_parameters=parameters()
	request_parameter=request.GET.get("parameter")
	if request_parameter=="serverOptions":
		info["content"]=_parameters.get_server_options()
	
	return info
#@login_check.login_check('服务器状态',False)
@ajax_http 
def get_dashboard(request):
	info={"status":True,"content":""}
	a=process()
	info["content"]=a.get_info()
	return info
#权限清理
#@login_check.login_check('创建/修改App')
#@permission_check('cheungssh.create_app')
@ajax_http 
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
		if parameters.has_key("id") and parameters["id"]:
			app_id=parameters["id"]
		if not parameters["owner"]==username and not request.user.is_superuser:
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
@ajax_http 
def get_app_list(request):
	username=request.user.username
	is_super=request.user.is_superuser
	return CheungSSHAppAdmin.get_app_list(username,is_super)
@login_check.login_check('执行App应用')
@permission_check('cheungssh.execute_app')
@ajax_http 
def execute_app(request):
	appid=request.GET.get("appid")
	username=request.user.username
	is_super=request.user.is_superuser
	return  CheungSSHAppAdmin.execute_app(appid,username,is_super)

@login_check.login_check('删除App应用')
@permission_check('cheungssh.delete_app')
@ajax_http 
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
				_asset={id:asset}		
				info["content"]=id 
			else:
				
				_asset={asset["id"]:asset}
				
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
@login_check.login_check('远程文件上传')
@permission_check('cheungssh.remote_file_upload')
@ajax_http
def filetrans_upload(request):
	tid=str(random.randint(90000000000000000000,99999999999999999999))
	username=request.user.username
	cheungssh_info={"status":False,"content":""}
	data={"tid":tid,"progress":0,"content":"","status":True}
	try:
		parameters=request.GET.get('parameters')
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000008")
		
		REDIS.set("progress.%s"%tid,json.dumps(data,encoding="utf8",ensure_ascii=False))
		
		if not parameters.has_key("sfile") or not parameters.has_key("dfile"):raise CheungSSH("CHB0000000014")
		sfile=os.path.join(cheungssh_settings.upload_dir,username,os.path.basename(parameters["sfile"]))  
		dfile=parameters["dfile"]
		if not type(parameters)==type({}):raise CheungSSHError("CHB0000000007-1")
		host=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(parameters["sid"])
		if not host["status"]:raise CheungSSHError(host['content'])
		host=host['content']
		sftp=CheungSSHFileTransfer()
		login=sftp.login(**host)
		if not login["status"]:raise CheungSSHError(login["content"])
		t=threading.Thread(target=sftp.upload,args=(sfile,dfile,tid))
		t.start()
		
		cheungssh_info["status"]=True
		cheungssh_info["content"]=tid
	except Exception,e:
		
		REDIS.set("progress.%s"%tid,json.dumps(data,encoding="utf8",ensure_ascii=False))
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
	cheungssh_info={"status":False,"content":""}
	try:	
		parameters=request.GET.get('parameters')
		try:
			parameters=json.loads(parameters)
		except Exception,e:
			raise CheungSSHError("CHB0000000008")
		if not type(parameters)==type({}):raise CheungSSHError("CHB0000000007-1")
		
		data={"tid":tid,"progress":0,"content":"","status":True}
		REDIS.set("progress.%s"%tid,json.dumps(data,encoding="utf8",ensure_ascii=False))
		
		if not parameters.has_key("sfile"):raise CheungSSH("CHB0000000019")
		sfile=parameters["sfile"]
		host=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(parameters["sid"])
		if not host["status"]:raise CheungSSHError(host['content'])
		host=host['content']
		alias=host["alias"]
		dfile_name="{alias}.{tid}.{filename}".format(alias=alias,tid=tid,filename=os.path.basename(parameters["sfile"]))  
		dfile_full_path=os.path.join(cheungssh_settings.download_dir,dfile_name)  
		sftp=CheungSSHFileTransfer()
		login=sftp.login(**host)
		if not login["status"]:raise CheungSSHError(login["content"])
		t=threading.Thread(target=sftp.download,args=(sfile,dfile_full_path,tid))
		t.start()
		
		cheungssh_info["status"]=True
		cheungssh_info["tid"]=tid
		cheungssh_info["filename"]=dfile_name
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@ajax_http
def create_tgz_pack(request):
	
	tid=str(random.randint(90000000000000000000,99999999999999999999))
	cheungssh_info={"status":False,"content":""}
	try:
		files=request.GET.get("files")
		try:
			files=json.loads(files)
		except Exception,e:
			raise CheungSSHError("CHB0000000020")
		if not type(files)==type([]):raise CheungSSHError("CHB0000000020")
		
		os.chdir(cheungssh_settings.download_dir)
		filename="%s.tgz" %tid
		cmd="tar zcvf {filename} {files}".format(filename=filename,files=" ".join(files))
		data=commands.getstatusoutput(cmd)
		if data[0]:
			raise CheungSSHError("打包失败",data[1])
		else:
			
			server_head=request.META['HTTP_HOST']
			url=os.path.join(cheungssh_settings.download_file_url,filename)
			full_url="http://{server_head}{url}".format(server_head=server_head,url=url)
			cheungssh_info["content"]=full_url
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('脚本内容查看')
@permission_check('cheungssh.show_script_content')
@ajax_http
def get_script_content(request):
	filename=request.GET.get("filename")
	username=request.user.username
	full_path=os.path.join(cheungssh_settings.script_dir,username,filename)
	return FileAdmin.get_content(full_path)
@login_check.login_check('修改/创建脚本')
@permission_check('cheungssh.create_script')
@ajax_http
def write_script_content(request):
	cheungssh_info={"status":False,"content":""}
	_filename=request.POST.get('filename')
	filename=os.path.basename(_filename)
	filecontent=request.POST.get("content")
	username=request.user.username
	try:
		if len(REDIS.hgetall("scripts"))>=9:raise CheungSSHError("CHB-BUSINESS-LIMIT")
		try:
			os.makedirs(os.path.join(cheungssh_settings.script_dir,username))
		except Exception,e:
			
			pass
		full_path=os.path.join(cheungssh_settings.script_dir,username,filename)
		if not filecontent.endswith("\n"):
			filecontent="%s\n" %filecontent
		with open(full_path.encode('utf8'),"wb") as f:
			f.write(filecontent)
		filename=str(request.FILES.get("file"))
		_data=REDIS.hget("scripts",filename)
		if _data is None:
			pass
		else:
			data=json.loads(_data)
			if filename==data["script"]:
				if username==data["owner"]:
					pass
				else:
					raise CheungSSHError("您的操作不被允许!其他账户下存在同名脚本!")
		cheungssh_info["content"]={
			"script":_filename,
			"owner":username,
			"time":time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()),
		}
		REDIS.hset("scripts",_filename,json.dumps(cheungssh_info["content"],encoding="utf8",ensure_ascii=False))
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('执行脚本')
@permission_check('cheungssh.execute_script')
@ajax_http
def script_init(request):
	username=request.user.username
	sid=request.GET.get("sid")
	sfile=request.GET.get("sfile")
	return CheungSSHScript.script_init(sid,sfile,username)
@login_check.login_check('远程文件管理创建')
@permission_check('cheungssh.remote_file_admin_create')
@ajax_http
def add_remote_file(request):
	cheungssh_info={"status":False,"content":""}
	try:
		username=request.user.username
		_id=str(random.randint(90000000000000000000,99999999999999999999))
		
		id=request.GET.get("id",_id)
		owner=request.GET.get("owner")
		alias=request.GET.get('alias')
		sid=request.GET.get("server")
		path=request.GET.get("path")
		description=request.GET.get("description")
		if owner==username or request.user.is_superuser:
			cheungssh_info=RemoteFileAdmin.add_remote_file(owner=owner,path=path,description=description,id=id,server=sid,alias=alias)
		else:
			raise CheungSSHError("您不能把该资源授权给其他用户或者组")
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
@login_check.login_check('远程文件管理列表')
@permission_check('cheungssh.remote_file_admin_list')
@ajax_http
def get_remote_file_list(request):
	super=request.user.is_superuser
	username=request.user.username
	return RemoteFileAdmin.get_remote_file_list(super,username)
@ajax_http
def delete_remote_file_list(request):
	id=request.GET.get("id")
	super=request.user.is_superuser
	username=request.user.username
	return RemoteFileAdmin.delete_remote_file_list(super,username,id)
@login_check.login_check('远程文件内容查看')
@permission_check('cheungssh.remote_file_admin_content_show')
@ajax_http
def get_remote_file_opt(request):
	id=request.GET.get("tid")
	action=request.GET.get('action')
	action="GET"
	super=request.user.is_superuser
	username=request.user.username
	return RemoteFileAdmin.remote_file_content(super,username,id,action)
@login_check.login_check('远程文件内容更新')
@permission_check('cheungssh.write_remote_file_opt')

@ajax_http
def write_remote_file_opt(request):
	
	action="WRITE"
	id=request.POST.get("tid")
	super=request.user.is_superuser
	super=True
	username=request.user.username
	file_content=request.POST.get("content")
	if not file_content.endswith('\n'):
		file_content="%s\n" %file_content
	return RemoteFileAdmin.remote_file_content(super,username,id,action,file_content)
@ajax_http
def get_my_file_list(request):
	username=request.user.username
	cheungssh_info={"content":[],"status":False}
	try:
		_dir=os.path.join(cheungssh_settings.upload_dir,username)
		try:
			file_list=os.listdir(_dir)
			cheungssh_info["content"]=file_list
		except:
			pass
		cheungssh_info["status"]=True
	except Exception,e:
		cheungssh_info["status"]=False
		cheungssh_info["content"]=str(e)
	return cheungssh_info
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
@login_check.login_check('删除部署任务')
@permission_check('cheungssh.deployment_delete')
@ajax_http
def delete_deployment_task(request):
	username=request.user.username
	is_super=request.user.is_superuser
	taskid=request.GET.get("taskid")
	return DeploymentAdmin.delete_task_conf(username,is_super,taskid)
@login_check.login_check('执行部署任务')
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
	hosts=request.POST.get("hosts")
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
				
				continue
			elif re.search("^#",line):
				
				continue
			else:
				
				
				real_i+=1
				segment=line.split()
				if len(segment)<14:
					raise CheungSSHError("在第【%d行】,您指定的配置字段小于14个，请您填写完整的配置信息，如果不填写的，请使用#代替!" %i)
				_login_method=segment[4].upper()
				_port=segment[8]
				if not _login_method=="PASSWORD" and  not _login_method=="KEY":
					
					raise CheungSSHError("在第【%d】行，第5个配置字段【%s】的值应该为PASSWORD或者KEY !"%(i,_login_method))
				try:
					
					int(_port)
				except ValueError:
					raise CheungSSHError("在第【%d】行，第9个字段，端口必须是一个数字!"%i)
				
				_sudo=segment[9].upper()
				if not _sudo=="N" and not _sudo=="Y":
					raise CheungSSHError("在第【%d】行，第10个字段，sudo方式必须为Y或者N！"%(i))
				
				_su=segment[11].upper()
				if not _su=="N" and  not _su=="Y":
					raise CheungSSHError("在第【%d】行，第12个字段，su方式必须为Y或者N！"%(i))
				tid=str(random.randint(90000000000000000000,99999999999999999999))
				config_line={
					"id":tid,
					"ip":segment[0],
					"alias":segment[1],
					"owner":request.user.username,
					"group":segment[2],
					"username":segment[3],
					"login_method":_login_method,
					"password":segment[5],
					"keyfile":segment[6],
					"keyfile_password":segment[7],
					"port":_port,
					"sudo":_sudo,
					"sudo_password":segment[10],
					"su":_su,
					"su_password":segment[12],
					"description":segment[13],
				}
				config_data.append(config_line)
		if len(config_data)==0:
			raise CheungSSHError("您尚未指定有效的服务器配置行！")
		for _config_line in config_data:
			
			tmp=json.dumps(_config_line,encoding="utf8",ensure_ascii=False)
			REDIS.rpush("servers.config.list",tmp)
		cheungssh_info["content"]="已成功添加%d条记录"% len(config_data)
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
	return CheungSSHCrontabControler.get_crontab_list_to_web()
@login_check.login_check("删除计划任务")
@permission_check("delete.get_crontab_list")
@ajax_http
def delete_crontab_list(request):
	sid=request.GET.get("sid")
	tid=request.GET.get("tid")
	return CheungSSHCrontabControler.delete_crontab(sid,tid)
@login_check.login_check("创建/修改计划任务")
@permission_check('cheungssh.create_or_modify_crontab')
@ajax_http
def save_crontab_to_server(request):
	action=request.POST.get("action")
	data=request.POST.get("data")
	data=json.loads(data)
	return CheungSSHCrontabControler.save_crontab_to_server(action=action,data=data)

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
