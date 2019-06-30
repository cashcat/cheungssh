# coding:utf8
# Author: 张其川

import random
import socket
import select
import threading
import sys
import Queue
import json
import os
import time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh/")
from ServersInventory import ServersInventory
from cheungssh_sshv2 import CheungSSH_SSH
from django.core.cache import cache
REDIS=cache.master_client
Lock = threading.Lock()


class CheungSSHThread(threading.Thread):
	"""
		用于处理socket
	"""
	def __init__(self,queue):
		threading.Thread.__init__(self)
		self.queue=queue
		self.daemon=True
		self.start()

	def run(self):
		while True:
			func,kws=self.queue.get()
			func(**kws)
			self.queue.task_done()

class CheungSSHLoginThread(threading.Thread):
	def __init__(self,queue,login_list):
		threading.Thread.__init__(self)
		self.queue=queue
		self.login_list = login_list
		self.start()
	def run(self):
		while True:
			if self.queue.empty():
				##### 队列完成
				return True
			sid, tid, instance, request_type,cmd=self.queue.get()
			if request_type == "login":
				self.connect_ssh(sid=sid, tid=tid,instance=instance)
			elif request_type == "active":
				self.mark_ssh_as_active(instance=instance,sid=sid)
			else:
				try:
					if isinstance(json.loads(cmd),dict) is True:
						cmd = json.loads(cmd)[sid]
						if isinstance(cmd,dict) or isinstance(cmd,list):
							cmd = json.dumps(cmd,encoding="utf8",ensure_ascii=False)
				except:
					pass
				self.execute_command(cmd=cmd,sid=sid, tid=tid,instance=instance)
			self.queue.task_done()

	def connect_ssh(self,sid=None, tid=None,instance = None):
		current_amount ="{tid}.current.logined.server.amount".format(tid=tid)
		##### 用来存储登陆的结果
		login_data_key ="{tid}.data.logined.server".format(tid=tid)
		cheungssh_info={"status":True,"content":[]}
		key = "{tid}.{sid}".format(sid=sid,tid=tid)
		server_config = ServersInventory().get_server(sid=sid)["content"]
		ssh = CheungSSH_SSH()
		channel = ssh.login(**server_config)
		channel["sid"] = ssh.sid
		if channel["status"] == True:
			instance.ServersSSHLoginPool[key] = {"ssh":ssh, "beginning_time": time.time()}
			print "登录成功,已缓存登录通道"
		else:
			print "登录失败,不缓存登录通道"
		Lock.acquire()
		self.login_list[key] = channel
		##### 记录完成的服务器数量，用户显示登陆进度
		REDIS.set(login_data_key,json.dumps(self.login_list,encoding="utf8",ensure_ascii=False))
		REDIS.incr(current_amount)
		Lock.release()
		
	def execute_command(self,cmd=None,tid=None,sid=None,instance=None):
		cheungssh_info={"status":False,"content":""}
		key = "{tid}.{sid}".format(tid=tid,sid=sid)
		log_name = "log.{tid}.{sid}".format(tid=tid,sid=sid)
		current = "current.{tid}".format(tid=tid)
		try:
			if not instance.ServersSSHLoginPool.has_key(key):
				raise IOError("会话已超时，请重新登录。")
			ssh = instance.ServersSSHLoginPool[key]["ssh"]
			print "开始执行命令",cmd
			ssh.execute(cmd,sid=sid,tid=tid)
		except Exception,e:
			print "发送执行请求发生错误",str(e)
			info = {"content":str(e),"stage":"done","status":False}
			REDIS.lpush(log_name, json.dumps(info,encoding='utf8',ensure_ascii=False))
		if not cmd == "BREAK-COMMAND":
			##### 中断命令不添加
			##### 由于在ssh中已经加入了数据done，但是在这里才有incr，会导致误差
			REDIS.incr(current)
		return cheungssh_info

	def mark_ssh_as_active(self,instance=None,sid=None):
		cheungssh_info={"status":False,"content":""}
		try:
			if instance.ServersSSHLoginPool.has_key(sid):
				Lock.acquire()
				_time = instance.ServersSSHLoginPool[sid]["beginning_time"]
				print "延迟前{sid}的失效时间到: {time}".format(sid=sid,time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(_time)))
				instance.ServersSSHLoginPool[sid]["beginning_time"] += 900
				Lock.release()
				_time = instance.ServersSSHLoginPool[sid]["beginning_time"]
				print "已延迟{sid}的失效时间到: {time}".format(sid=sid,time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(_time)))
			cheungssh_info["status"] = True
		except Exception,e:
			e = str(e)
			print "标记程序错误",e
			cheungssh_info = {"status":False, "content":e}
		return cheungssh_info


class CheungSSHPool:
	
	def __init__(self):
		self.queue=Queue.Queue() ##### 不限队列
		for i in range(22):
			CheungSSHThread(self.queue)
	def add_task(self,func,dict):
		self.queue.put((func,dict))
	def all_complete(self):
		self.queue.join()

class CheungSSHClearSSH(threading.Thread):
	def __init__(self,instance):
		self.instance=instance
		threading.Thread.__init__(self)
		self.start()
	def run(self):
		while True:
			###### 15分钟过一次
			time.sleep(30)
			print "开始扫描SSH队列"
			now_time = time.time()
			for k,v in self.instance.ServersSSHLoginPool.items():
				if now_time - v["beginning_time"] > 900:
					del self.instance.ServersSSHLoginPool[k]
					print "已经销毁会话:",k
			print "SSH队列已被扫描完毕"
			print self.instance.ServersSSHLoginPool

class CheungSSHServer(object):
	def __init__(self):
		self.port = 9002
		self.INPUTS=[]
		self.OUTPUTS=[]
		self.cheungssh_pool=CheungSSHPool()
		##### {"tid.sid":SSH,"beginning_time":123}
		self.ServersSSHLoginPool={} 

	def listen(self):
		try:
			self.server=socket.socket(2,1)
			self.server.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
			self.server.bind(("127.0.0.1",self.port))
			self.server.listen(5)
			self.INPUTS.append(self.server)
			print "启动CheungSSH-Server成功"
			self.run()
		except Exception,e:
			print "启动CheungSSH-Server失败，请联系CheungSSH作者：",str(e)
			sys.exit(1)
	def run(self):
		while self.INPUTS:
			reading, writing, error = select.select(self.INPUTS,[],[])
			for s in reading:
				if s is self.server:
					connection, address = s.accept()
					self.INPUTS.append(connection)
				else:
					self.cheungssh_pool.add_task(self.recv_data,{"connection":connection})

	def recv_data(self,connection=None):
		cheungssh_info={"status":False,"content":[]}
		try:
			try:
				data = connection.recv(204800)
			except Exception,e:
				return None
			if data == "":
				print "断开连接"
				if connection in self.INPUTS:
					self.INPUTS.remove(connection)
				connection.close()
				return None
			data = json.loads(data)
			print "收到数据:",data
			if not isinstance(data,dict):
				######  {"tid":123456,hosts:[1,2,3,4,5],"request_type":"cmd/login"}
				raise IOError("收到不合规的数据")
			queue = Queue.Queue()
			request_type = data["request_type"]
			if data["request_type"] == "active":
				###### active类型不需要tid
				data["tid"] = None
			tid = data["tid"]
			total = "total.{tid}".format(tid=tid)
			all_sid ="{tid}.all_sid".format(tid=tid)
			current = "current.{tid}".format(tid=tid)
			REDIS.set(total,len(data["hosts"]),360000)
			REDIS.set(all_sid,json.dumps(data["hosts"]),360000)
			REDIS.set(current,0,360000)
			for sid in data["hosts"]:
				key = "{tid}.{sid}".format(sid=sid,tid=tid)
				if request_type == "login":
					if self.ServersSSHLoginPool.has_key(key):
						print "会话已存在，无需再次登录"
						continue
					else:
						print "会话不存在，开始登录"
					cmd = None
				elif request_type == "active":
					cmd = None
				else:
					cmd = data["cmd"]
				######执行命令或者是登录
				queue.put((sid,tid,self,request_type,cmd))
			threading_list = []
			###### 用于存储单个socket请求的登录列表
			login_list = {}
			for i in xrange(50):
				a=CheungSSHLoginThread(queue,login_list)
				threading_list.append(a)
			#if request_type == "login" or request_type == "active":
			if request_type == "active":
				##### 执行命令不需要等待线程完成
				for i in threading_list:
					i.join()
					del i
				del threading_list
			elif request_type == "login":
				##### 登陆也不需要等待，前端可以获取进度
				key ="{tid}.all.logined.server.amount".format(tid=tid)
				REDIS.set(key,data["hosts"].__len__(),36000)
			cheungssh_info={"status":True,"content":login_list,"tid":tid}
		except Exception,e:
			print "程序错误",str(e)
			cheungssh_info["content"] = str(e)
		connection.send(json.dumps(cheungssh_info,encoding="utf-8"))
		print "All logined request have been completed by CheungSSH."
		print "已返回消息到HTTP"
		
			
if __name__ == '__main__':
	server = CheungSSHServer()
	a=CheungSSHClearSSH(server)
	server.listen()
