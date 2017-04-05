#!/usr/bin/env python
#coding:utf-8
import re,os,sys,json,socket,time
from cheungssh_error import CheungSSHError
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_sshv2 import CheungSSH_SSH
from cheungssh_thread_queue import *
import threading
REDIS=cache.master_client
class DockerAdmin(CheungSSHControler):
	def __init__(self):
		self.now_time=time.strftime("%Y-%m-%d",time.localtime(time.time()))
		self.cond=threading.Condition()
		self.servers=[]
		self.REDIS=REDIS
		self.controler=CheungSSHControler()
		self.get_docker_image_command="docker images"
		self.get_docker_container_command="docker ps -a"
		self.image_count=0 
		self.container_count=0
		self.all_image=[]
		self.all_container=[]
	@staticmethod
	def read_docker_images_list():
		cheungssh_info={"content":"","status":True}
		images=REDIS.get("docker.images")
		if images is None:
			images=[]
		else:
			images=json.loads(images) 
		
		cheungssh_info["content"]=images
		return cheungssh_info
	@staticmethod
	def read_docker_containers_list():
		cheungssh_info={"content":"","status":True}
		containers=REDIS.get("docker.containers")
		if containers is None:
			containers=[]
		else:
			containers=json.loads(containers) 
		
		cheungssh_info["content"]=containers
		return cheungssh_info
		
	@staticmethod
	def read_docker_container_count():
		cheungssh_info={"content":[],"status":True}
		container_count=REDIS.hgetall("docker.containers.count")
		if container_count is None:
			container_count=[]
		cheungssh_info["content"]=container_count
		return cheungssh_info["content"]


	@staticmethod
	def read_docker_image_count():
		cheungssh_info={"content":[],"status":True}
		image_count=REDIS.hgetall("docker.images.count")
		if image_count is None:
			image_count=[]
		cheungssh_info["content"]=image_count
		return cheungssh_info["content"]
	def get_docker_images_history(self):
		cheungssh_info={"content":"","status":False}
		images_history=self.REDIS.hgetall("docker.images.count")
		if images_history is None:images_history={}
		cheungssh_info["status"]=True
		return cheungssh_info
		
	def docker_images_redis(self):
		
		cheungssh_info={"content":"","status":False}
		
		try:
			self.REDIS.hset("docker.images.count",self.now_time,self.image_count) 
			self.all_image=json.dumps(self.all_image,encoding="utf8",ensure_ascii=False) 
			self.REDIS.set("docker.images",self.all_image)
			cheungssh_info["status"]=True
		except Exception,e:
			print "redis错误",e
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def docker_containers_redis(self):
		cheungssh_info={"content":"","status":False}
		
		try:
			self.REDIS.hset("docker.containers.count",self.now_time,self.container_count) 
			self.all_container=json.dumps(self.all_container,encoding="utf8",ensure_ascii=False) 
			self.REDIS.set("docker.containers",self.all_container)
			cheungssh_info["status"]=True
		except Exception,e:
			print "redis错误",e
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
	def format_docker_image_list(self,content,alias,ip,sid):
		cheungssh_info=content
		content=cheungssh_info["content"]
		images_list=[] 
		is_responsetory=False 
		try:
			if cheungssh_info["status"]:
				content=content.split('\r\n')[1:-1]
				for _line in content:
					image_option={"image":"","tag":"","image_id":"","create_time":"","size":"","alias":alias,"ip":ip,"date":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time())),"sid":sid}
					line=re.split(' {3,}',_line)
					if re.search("REPOSITORY",line[0]):
						is_responsetory=True
						continue 
					elif  not is_responsetory:
						continue
						
					image_option["image"]=line[0]
					image_option["tag"]=line[1]
					image_option["image_id"]=line[2]
					image_option["create_time"]=line[3]
					image_option["size"]=line[4]
					images_list.append(image_option) 
				self.cond.acquire()
				self.image_count+=len(images_list)  
				self.all_image+=images_list
				self.cond.release()
		except Exception,e:
			print "程序有错误1",str(e)
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
	def format_docker_container_list(self,content,alias,ip,sid):
		cheungssh_info=content
		content=cheungssh_info["content"]
		containers_list=[] 
		is_container=False 
		try:
			if cheungssh_info["status"]:
				content=content.split('\r\n')[1:-1]
				for _line in content:
					container_option={"status_time":"","port":"","status":"","image":"","container_id":"","command":"","create_time":"","alias":alias,"ip":ip,"date":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time())),"sid":sid}
					line=re.split(' {3,}',_line)
					if re.search("CONTAINER",line[0]):
						is_container=True
						continue 
					elif  not is_container:
						continue
						
					container_option["container_id"]=line[0]
					container_option["image"]=line[1]
					command=line[2]
					
					command=re.sub('"','',command)
					container_option["command"]=command
					container_option["create_time"]=line[3]
					_status=line[4]
					if re.search("^Up",_status):	
						status=True
						
					elif re.search("^Exited",_status):
						status=False
						
					else:
						status=None
						
					container_option["status"]=status
					status_time=re.search("^(Up|Exited) (.*)",_status).group(2) 
					container_option["status_time"]=status_time
					
					"""
					container_option["port"]=line[5]
					try:
						container_option["name"]=line[6]
					except:
						pass
					"""
					containers_list.append(container_option) 
				self.cond.acquire()
				self.container_count+=len(containers_list)  
				self.all_container+=containers_list
				self.cond.release()
		except Exception,e:
			print "程序有错误1",str(e)
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
		
	@staticmethod
	def get_all_servers():
		servers_config=REDIS.lrange("servers.config.list",0,-1)	
		if servers_config is None:servers_config=[]
		servers=[]
		for _s in servers_config:
			s=json.loads(_s)
			servers.append(s["id"])
		return servers
	def get_docker(self,**parameter):
		cheungssh_info={"content":"","status":False}
		try:
			SSH=CheungSSH_SSH()
			SSH.login(**parameter)
			sid=parameter["id"]
			alias=parameter["alias"]
			ip=parameter["ip"]
			images=SSH.execute(cmd=self.get_docker_image_command,sid=sid,tid="0",ignore=True)
			container=SSH.execute(cmd=self.get_docker_container_command,sid=sid,tid="0",ignore=True)
			self.format_docker_image_list(images,alias,ip,sid)
			self.format_docker_container_list(container,alias,ip,sid)
		except Exception,e:
			print "redis错误",e
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
	def run(self):
		pool=CheungSSHPool()
		self.servers=DockerAdmin.get_all_servers()
		
		for s in  self.servers:
			server_conf=self.convert_id_to_ip(sid=s)
			if not server_conf["status"]:
				continue
			pool.add_task(self.get_docker,server_conf["content"])
		pool.all_complete()
		
		self.docker_images_redis()
		self.docker_containers_redis()
	


if __name__=='__main__':
	A=DockerAdmin()
	print A.run()
		
