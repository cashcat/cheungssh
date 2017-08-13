#!/usr/bin/env python
#coding:utf8
import os,sys,random,json,threading,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from cheungssh_error import CheungSSHError
from django.core.cache import cache
from cheungssh_deployment_controler import  CheungSSHDeploymentControler
from cheungssh_localupload import CheungSSHLocalUpload
import cheungssh_settings
REDIS=cache.master_client
class DeploymentAdmin:
	def __init__(self,taskid):
		#####taskid是要执行的任务id
		self.taskid=taskid
	@staticmethod
	def delete_task_conf(username,is_super,taskid):
		cheungssh_info={"content":"","status":False}
		try:
			data=REDIS.hget("CSSH-R00000000002",taskid)
			data=json.loads(data)
			if data["owner"] == username or is_super:
				REDIS.hdel("CSSH-R00000000002",taskid)
			else:
				raise CheungSSHError("您无权删除该资源!")
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def create_task_conf(data,username):
		cheungssh_info={"content":"","status":False}
		try:
			try:
				data=json.loads(data)
			except:
				raise CheungSSHError("CHB0000000025-0")
			if not type({}) == type(data):raise CheungSSHError("CHB0000000025-1")
			#####判断是否有tid，如果有则是修改，否则是创建
			if data.has_key("tid"):
				taskid=data["tid"]
			else:
				taskid=str(random.randint(9000000000000000,9999999999999999))
			data["taskid"]=taskid#####新增taskid
			data["owner"]=username#####区别用户归属
			data["status"]="新建"
			data["time"]=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
			data["model"]="灰度"
			i=0#####记录第一层的循环个数，主要是为了在缘来的数据上修改
			for _ in data["servers"]:#####在原始数据的基础上修改数据，所以跟for循环吐出的值没关系
				#steps=server["steps"]
				ii=0#####第二层list循环位置
				for _ in data["servers"][i]["steps"]:
					stepid=str(random.randint(9000000000000000,9999999999999999))
					#step=data["servers"][i]["steps"][ii],这个步骤就是得到的step的dict
					data["servers"][i]["steps"][ii]["stepid"]=stepid#####所以这里直接访问到step，然后新增key为stepid
					ii+=1
				i+=1
			_data=json.dumps(data,encoding="utf8",ensure_ascii=False)#####还原为json
			cheungssh_info["status"]=True
			REDIS.hset("CSSH-R00000000002",taskid,_data)
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def task_info(taskid):
		cheungssh_info={"status":False,"content":""}
		try:
			conf=REDIS.hget("CSSH-R00000000002",taskid)
			conf=json.loads(conf)
			cheungssh_info["content"]=conf
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	
	@staticmethod
	def set_deployment_status(taskid="",status=""):
		#####传入要修改的taskid状态文字,新建/运行中/失败/成功
		data=REDIS.hgetall("CSSH-R00000000002")#####原始数据，需要经过筛选
		conf=json.loads(data[taskid])
		conf["status"]=status#####重置部署状态
		conf=json.dumps(conf,encoding="utf8",ensure_ascii=False)
		REDIS.hset("CSSH-R00000000002",taskid,conf)#####重新写入值
	@staticmethod
	def get_task_conf(username,is_super):
		cheungssh_info={"status":False,"content":""}
		try:
			data=REDIS.hgetall("CSSH-R00000000002")#####原始数据，需要经过筛选
			_data={}#####默认是空
			for taskid in data.keys():
				_tmp=json.loads(data[taskid])
				if _tmp["owner"]==username or is_super:_data[taskid]=_tmp#####权限检查
			cheungssh_info["content"]=_data
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info

	def demo(self):
		tid=str(random.randint(9000000000000000,9999999999999999))
		self.tid=tid#####是进度id，区分taskid
		print "生成的tid是",self.tid,tid
		cheungssh_info={"content":"0","status":False}
		try:
			_tmp=REDIS.hget("CHB-R000000000050.{taskid}".format(taskid=self.taskid),"status")
			if _tmp=="running":
				raise CheungSSHError("该任务正在执行当中！请等待执行完毕后再操作!")
			a=threading.Thread(target=self.run)
			a.start()
			REDIS.delete("CHB-R000000000050.{taskid}".format(taskid=self.taskid))#####删除此前的记录，否则会发生叠加重复
			REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=self.taskid),"step_num",1)#####每循环一个服务器，就增加一个步骤,默认是第一个
			cheungssh_info["content"]=self.taskid######返回tid进度给前端
			REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=self.taskid),"status","running")##### status的是是running/done
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
		
	def run(self):
		cheungssh_info={"content":"","status":False}
		stepid=0
		stepname=''
		try:
			conf=DeploymentAdmin.task_info(self.taskid)
			if not conf["status"]:raise CheungSSHError(conf["content"])
			content=conf["content"]
			servers=content["servers"]
			current_step_num=1#####定义当前正在运行的步骤，前端用来显示加载的图标使用
			DeploymentAdmin.set_deployment_status(taskid=self.taskid,status="运行中")
			for server in servers:#####每一个服务器
				steps=server["steps"]#####每一个步骤
				sid=server["server"]
				for step in steps:
					current_step_num+=1
					stepid=step["stepid"]
					stepname=step['step_name']
					task_modul=step["task_modul"]
					if task_modul=="git":
						git_url=step["git_url"]
						git_dir=step["git_dir"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.git(git_url,git_dir,stepid)
						if not cheungssh_info["status"]:#####如果又失败的，才重写日志记录
							raise CheungSSHError(cheungssh_info["content"])#####中断执行
					elif task_modul=="commandBak":
						source_dir=step["source_dir"]
						dest_dir=step["bak_dir"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.command_backup(source_dir,dest_dir,stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
					elif task_modul=="command":
						command=step["command"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.command(command,stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
					elif task_modul=="script":
						owner=step["owner"]
						script_name=step["script_name"]
						script_parameter=step["script_parameter"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.script(sid=sid,sfile=script_name,parameter=script_parameter,owner=owner,stepid=stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
						print "脚本模块执行成功"
					elif task_modul=="permission":
						path=step["path"]
						recursion=step["recursion"]
						code=step['code']
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.command_permission(path=path,recursion=recursion,code=code,stepid=stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
						print "权限执行成功"
					elif task_modul=="owner":
						path=step['path']
						owner=step['owner']
						recursion=step['recursion']
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.command_chown(path=path,recursion=recursion,owner=owner,stepid=stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
						print "归属修改执行成功"
					elif task_modul=="localUpload":
						local_path=step["local_path"]
						remote_path=step["remote_path"]
						owner=step["owner"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						local_path=os.path.join(cheungssh_settings.upload_dir,owner,local_path)
						cheungssh_info=A.local_upload(sid=sid,sfile=local_path,dfile=remote_path,owner=owner,stepid=stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
					elif task_modul=="svn":
						url=step["svn_url"]
						username=step["svn_username"]
						password=step["svn_password"]
						dest_dir=step["svn_dir"]
						A=CheungSSHDeploymentControler(self.taskid)
						info=A.init_server_conf(sid)
						if not info["status"]:raise CheungSSHError(info["content"])
						cheungssh_info=A.svn(url=url,username=username,password=password,dest_dir=dest_dir,stepid=stepid)
						if not cheungssh_info["status"]:
							raise CheungSSHError(cheungssh_info["content"])
					REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=self.taskid),"step_num",current_step_num)#####每循环一个服务器，就增加一个步骤,执行完了添加一步，否则前端展示要乱套
	
						
						
						
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		if not cheungssh_info["status"]:#####如果又失败的，才重写日志记录
			print cheungssh_info["content"], stepname,"任务流程执行失败!"
			DeploymentAdmin.set_progress(self.taskid,stepid,cheungssh_info)
			DeploymentAdmin.set_deployment_status(taskid=self.taskid,status="失败")#####部署存储数据是失败
		else:
			DeploymentAdmin.set_deployment_status(taskid=self.taskid,status="成功")######部署存储数据为成功
		#####修改最后的时间
		now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		DeploymentAdmin.modify_deployment_time(taskid=self.taskid,now_time=now_time)######部署存储数据为成功
		REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=self.taskid),"status","done")##### status的是是running/done,不管成功与否，都写入done状态
		#####不返回信息

	@staticmethod
	def modify_deployment_time(taskid="",now_time=""):
		#####传入要修改的taskid还有当前时间值
		data=REDIS.hgetall("CSSH-R00000000002")#####原始数据，需要经过筛选
		conf=json.loads(data[taskid])
		conf["time"]=now_time#####重置部署状态
		conf=json.dumps(conf,encoding="utf8",ensure_ascii=False)
		REDIS.hset("CSSH-R00000000002",taskid,conf)#####重新写入值
	
	@staticmethod
	def set_progress(taskid,stepid,data):
		#####tid是进度id，不是taskid任务id
		now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		data["time"]=now_time
		if not data.has_key("summary"):
			data["summary"]="暂无"
		data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		REDIS.hset("CHB-R000000000050.{taskid}".format(taskid=taskid),stepid,data)#####hset taskid stepid data
	@staticmethod
	def get_progress(taskid):
		data=REDIS.hgetall("CHB-R000000000050.{taskid}".format(taskid=taskid))#####hset taskid stepid data,该任务没有content，有satus但值是running/done，不是True/False
		try:
			if data == {}:raise CheungSSHError("该任务尚未启动过!")
			_data={}
			for stepid in data.keys():
				try:
					#####正常的staus和content内容，需要转换为json
					info=json.loads(data[stepid])
				except:
					#####有单独的status字段，跳过
					info=data[stepid]
				_data[stepid]=info
			return _data
		except Exception,e:
			data["content"]=str(e)#####告诉前端报错信息，放置status和content两项参数
			data["status"]=False
		return data
		
if __name__=='__main__':
	#####命令用法 program taskid
	taskid=sys.argv[1]
	a=DeploymentAdmin(taskid)
	b=a.demo()
	print b


