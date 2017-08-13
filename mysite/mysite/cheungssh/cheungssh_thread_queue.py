#!/usr/bin/env python
#coding:utf-8
import threading,Queue,time
from cheungssh_auto_thread import AutoGetThreadNum
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_error import CheungSSHError
import os,sys,json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache


class CheungSSHThreadAdmin(object):
	
	def __init__(self):
		self.REDIS=cache.master_client
	def run(self,parameter={}):
		cheungssh_info={"status":True,"content":""}
		try:
			task_type=parameter["task_type"]
			tid=parameter["tid"]
			multi_thread=parameter["multi_thread"] 
			if not type(multi_thread) ==type(False):raise CheungSSHError("CHB0000000010")
			if task_type=="cmd":
				cmd=parameter["cmd"]
				servers=parameter["servers"]
				if not type(servers)==type([]):raise CheungSSHError("CHB0000000011")
				total="total.%s" % tid
				current="current.%s" %tid
				self.REDIS.set(total,len(servers))
				self.REDIS.set(current,0)
				#CheungSSHConnector.progress[total]=len(servers)
				#CheungSSHConnector.progress[current]=0
				if multi_thread:
					
					pool=CheungSSHPool()
					for s in servers:
						controler=CheungSSHControler()
						param={"cmd":cmd,"sid":s,"tid":tid}
						pool.add_task(controler.command_controler,param)
					
				else:
					
					for s in servers:
						controler=CheungSSHControler()
						controler.command_controler(cmd=cmd,sid=s,tid=tid)
						
			elif task_type=="file":
				pass
			else:
				raise CheungSSHError("CHB0000000009")
		except Exception,e:
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		print cheungssh_info
			
		return cheungssh_info
			
class CheungSSHThread(threading.Thread):
	def __init__(self,queue):
		threading.Thread.__init__(self)
		self.queue=queue
		self.daemon=True
		self.start()
	def run(self):
		while True:
			try:
				func,kws=self.queue.get()
				func(**kws)
			except Exception,e:
				print e
				pass
			self.queue.task_done()
class CheungSSHPool(AutoGetThreadNum):
	
	def __init__(self):
		AutoGetThreadNum.__init__(self)
		self.thread_num=self.auto_thread() 
		self.queue=Queue.Queue(self.thread_num)
		for i in range(self.thread_num):#循环多少次，实际上是一个数字
			CheungSSHThread(self.queue)
	def add_task(self,func,dict):
		self.queue.put((func,dict))#把参数和函数，放到队列里面去，然后，有一个run会来这里取的
	def all_complete(self):
		self.queue.join()

def  test_func(**kws):
	time.sleep(0.5)
	print "哈哈，这里是你穿的参数",kws

if __name__=='__main__':
	p=CheungSSHPool()
	for i in range(20):
		p.add_task(test_func,{"username":i})
	p.all_complete()
