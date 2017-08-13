#!/usr/bin/env python
#coding:utf-8
import os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
from cheungssh_sshv2 import CheungSSH_SSH
from  cheungssh_modul_controler import CheungSSHControler
from cheungssh_error import CheungSSHError
from cheungssh_thread_queue import CheungSSHPool
REDIS=cache.master_client
class DockerControler(object):
	def __init__(self,parameters={}):
		
		self.parameters=parameters
		self.REDIS=REDIS
		self.tid=self.parameters["tid"]
		self.date=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
	def run(self):
		cheungssh_info={"content":"","status":False}
		try:
			if self.parameters["task_type"]=="start":
				self.task_type="start"
			elif self.parameters["task_type"]=="stop":
				self.task_type="stop"
			elif self.parameters["task_type"]=="delete":
				self.task_type="rm -f"
			else:
				raise CheungSSHError("CHB0000000013")
			pool=CheungSSHPool()
			
			total_docker=0
			for sid in self.parameters["servers"].keys():
				docker_count=len(self.parameters["servers"][sid]) 
				total_docker+=docker_count
			self.REDIS.set("log.%s.total" % self.tid,total_docker) 
			self.REDIS.set("log.%s.current" % self.tid,0)
			for sid in self.parameters["servers"].keys():
				cmd="docker  %s %s"
				containers=self.parameters["servers"][sid]
				data={
					"cmd":cmd,
					"containers":containers,
					"sid":sid,
				}
				pool.add_task(self.execute_docker,data)
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def message_process(self,cmd="",sid="",containers=[],tid="",shell="",cid=""):
		cheungssh_info={"content":"","status":False}
		try:
			cheungssh_info=shell.execute(cmd,ignore=True)
			cheungssh_info["cid"]=cid
			
			try:
				
				db_containers=self.REDIS.get("docker.containers");
				db_containers=json.loads(db_containers)
				for i in range(len(db_containers)): 
					if str(db_containers[i]["container_id"]) ==str(cid):
						db_containers[i]["date"]=self.date
						db_containers[i]["status_time"]="5分钟左右"
						if self.task_type=="start":
							if cheungssh_info["content"]:
								db_containers[i]["status"]=True
							else:
								db_containers[i]["status"]=False
						elif self.task_type=="rm -f":
								del db_containers[i] 
						else:
							if cheungssh_info["content"]:
								db_containers[i]["status"]=False  
							else:
								db_containers[i]["status"]=True
							
				
				db_containers=json.dumps(db_containers,encoding="utf8",ensure_ascii=False)
				self.REDIS.set("docker.containers",db_containers)
						
			except Exception,e:
				print "修改镜像记录失败",e
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		_data=json.dumps(cheungssh_info,encoding="utf8",ensure_ascii=False)
		self.REDIS.rpush("log.docker.container.%s" %tid,_data)
		self.REDIS.incr("log.%s.current" % tid)
		return cheungssh_info
	def execute_docker(self,cmd="",sid="",containers=[]):
		cheungssh_info={"content":"","status":False}
		try:
			server_config=CheungSSHControler.convert_id_to_ip(sid=sid)
			if not server_config["status"]:
				for cid in containers:
					log={"status":False,"content":server_config["content"],"cid":cid}
					log=json.dumps(log,encoding="utf8",ensure_ascii=False)
					self.REDIS.incr("log.%s.current" % tid)
					self.REDIS.rpush("log.docker.container.%s" %self.parameters["tid"],log)
				print "解析配置失败",server_config["content"]
				raise CheungSSHError(server_config["content"])
			ssh=CheungSSH_SSH()
			data=ssh.login(**server_config["content"])
			if not data["status"]:
				print "登录失败"
				
				for cid in containers:
					log={"status":False,"content":data["content"],"cid":cid}
					log=json.dumps(log,encoding="utf8",ensure_ascii=False)
					self.REDIS.incr("log.%s.current" % tid)
					self.REDIS.rpush("log.docker.container.%s" %self.parameters["tid"],log)
				raise CheungSSHError(data["content"])
			
			for c in containers: 
				print "执行命里干活"
				_cmd=cmd % (self.task_type,c)
				self.message_process(**{"cmd":_cmd,"sid":sid,"tid":self.parameters["tid"],"shell":ssh,"cid":c})
			
			ssh.logout()
			cheungssh_info["status"]=True
		except Exception,e:
			print "报错",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		print cheungssh_info,112222
		return cheungssh_info
	@staticmethod
	def get_docker_container_progress(tid=""):
		cheungssh_info={"status":False,"content":""}	
		data=[]
		try:
			data_length=REDIS.llen("log.docker.container.%s" % tid) 
			total=REDIS.get("log.%s.total" % tid) 
			current=REDIS.get("log.%s.current" % tid) 
			progress=   "%0.2f"  % ( float(current)/float(total) * 100 )
			for i in range(data_length):
				_data=REDIS.lpop("log.docker.container.%s" %tid)
				_data=json.loads(_data)
				data.append(_data)
			cheungssh_info["status"]=True
			cheungssh_info["content"]=data
			cheungssh_info["progress"]=progress
		except Exception,e:
			print "获取容器进度报错",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
