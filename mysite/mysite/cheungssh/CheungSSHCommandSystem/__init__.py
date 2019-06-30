# encoding:utf8
# Autor: 张其川
import random
import re
import socket
import json
import sys
from client_info import resolv_client
from cheungssh_thread_queue import CheungSSHThreadAdmin
from cheungssh_error import CheungSSHError
from server import CheungSSHServer
from django.contrib.auth.models import User

sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
from BlackListAdmin import MatchBlackList
class CheungSSHCommandSystem(object):

	def __init__(self, r, redis):
		self.r=r
		self.REDIS=redis
	def get_login_progress(self):
		##### 获取登陆的进度
		tid = self.r.GET.get("tid")
		cheungssh_info={"content":"","status":True,"progress":0}
		all ="{tid}.all.logined.server.amount".format(tid=tid)
		current ="{tid}.current.logined.server.amount".format(tid=tid)
		login_data_key = "{tid}.data.logined.server".format(tid=tid)
		all_value = self.REDIS.get(all)
		current_value = self.REDIS.get(current)
		if current_value is None:
			current_value = 0
		if all_value is None:
			return {"status":False,"content":"该资源不存在！"}
		info = self.REDIS.get(login_data_key)
		if info is None:
			info = {}
		else:
			info = json.loads(info)
		progress = "%0.2f" % (float(current_value)/float(all_value) * 100) 
		cheungssh_info["progress"] = progress
		if progress == "100.00":
			self.REDIS.delete(all)
			self.REDIS.delete(current)
			self.REDIS.delete(login_data_key)
			
		cheungssh_info["content"] = info
		return cheungssh_info
		

	def get_command_result(self):
		#cheungssh_info={"content":{"content":"","stage":"running","status":None}, "status":True,"progress":0}
		cheungssh_info={
				"content":{
						#"progress.1" :{"content":"","stage":"running","status":None}
					},
				"status":True,
				"progress":0}
		tid=self.r.GET.get("tid")
		try:
			total=self.REDIS.get("total.%s" % tid)
			current=self.REDIS.get("current.%s" % tid)
			try:
				if total is None or current is None: 
					print "没有产生进度，默认为0"
					progress=0 #####进度还没有产生的可能
				else:
					progress= "%0.2f"  % (float(current) / float(total) * 100)
					print  "取得进度",progress,total,current
			except Exception,e:
				raise CheungSSHError("CHB0000000012")
			cheungssh_info["progress"]=progress
			all_sid = "{tid}.all_sid".format(tid=tid)
			all_sid = self.REDIS.get(all_sid)
			if all_sid is None:
				all_sid = []
			else:
				all_sid = json.loads(all_sid)
			for sid in all_sid:
				content="" #####存储读取到的命令集合
				log_name="log.%s.%s" % (tid,sid)
				LLEN=self.REDIS.llen(log_name) #####获取当前redeis队列的长度，一次读完
				if not LLEN==0:
					for i in xrange(LLEN):
						_content=self.REDIS.lpop(log_name)
						_content=json.loads(_content) #####从redis读取后转换dict
						content+=_content["content"]
						key = sid
						content=re.sub("""\x1B\[[0-9;]*[mK]""","",content)
						cheungssh_info["content"][key]={"content":content,"stage":_content["stage"],"status":_content["status"]}
					# cheungssh_info["content"]["content"]=re.sub("""\\[6;1H|(\){1,}|\\[J\\[H""","",cheungssh_info["content"]["content"])
				if progress == "100.00":
					self.REDIS.delete(log_name) 
			if progress == "100.00":
				##### 删除数据
				self.REDIS.delete("{tid}.all_sid".format(tid=tid)) 
				self.REDIS.delete("current.%s" % tid) 
				self.REDIS.delete("total.%s" % tid) 
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
	def execute_command(self):
		cheungssh_info={"status":False,'content':"","ask":False}
		try:
			#####每次执行均产生一个新的ID，避免重复
			#########优先考虑POST，也可以用GET，字符可能需要转义
			parameter=self.r.POST.get("parameters") or self.r.GET.get("parameters") #####优先获取POST，如果没有则获取GET
			try:
				parameter=json.loads(parameter)
			except Exception,e:
				raise CheungSSHError("错误码:CHB0000000001")
			try:
				cmd=parameter["cmd"]
			except:
				raise CheungSSHError("错误码:CHB0000000002")
			##### 检查是否命中黑名单
			try:
				_cmd = json.loads(cmd)
			except Exception,e:
				_cmd = [cmd]
			for cmd in _cmd:
				tmp = MatchBlackList().match(cmd,User.objects.get(username=self.r.user.username).id)
				if tmp["status"] is False and self.r.user.is_superuser:
					if parameter["force"] is False:
						cheungssh_info["content"] = tmp["content"]  + " 但由于您是管理员，可以强行执行，请问真的要强行执行吗？"
						cheungssh_info["ask"] = True
						cheungssh_info["status"] = True
						return cheungssh_info
				elif tmp["status"] is False:
					raise IOError(tmp["content"])
			#######获取指定的参数
			#########用来记录历史命令
			client_info=resolv_client(self.r)
			client_info["cmd"]=cmd
			#client_info["parameter"]=parameter
			client_info=dict(client_info,**parameter)#####重装组合
			#####记录命令操作的初始化状态
			init_status={"content":"","status":False,"stage":"running"}#stage为running或者done,
			client_info=dict(client_info,**init_status)#####重装组合
			#########用来记录历史命令
			client_info=json.dumps(client_info,encoding="utf8",ensure_ascii=False)
			#########写入历史记录
			self.REDIS.rpush('command.history',client_info)
			###### 此处不需要tid，接收来自前端请求的tid
			s = socket.socket(2,1)
			s.connect(("127.0.0.1",9002))
			parameter = json.dumps(parameter, encoding='utf8',ensure_ascii=False)
			s.send(parameter)
			data = s.recv(204800)
			s.close()
			cheungssh_info = json.loads(data)
		except Exception,e:
			print "发生错误 execute_command",str(e)
			if hasattr(e, "errno") and e.errno == 111:
				info = "请先启动cheungssh-command-system后操作。"
			else:
				info = str(e)
			cheungssh_info={"status":False,"content":info}
		return cheungssh_info

	def login_server_request(self):
		cheungssh_info={"status":False,'content':""}
		try:
			###### 需要产生一个tid
			tid=str(random.randint(10000000000000000000,99999999999999999999))
			parameter=self.r.GET.get("parameters")
			parameter = json.loads(parameter)
			parameter["tid"] = tid
			parameter = json.dumps(parameter,encoding='utf8',ensure_ascii=False)
			s = socket.socket(2,1)
			s.connect(("127.0.0.1",9002))
			s.send(parameter)
			data = s.recv(204800)
			s.close()
			cheungssh_info = json.loads(data)
		except Exception,e:
			print "login_server_request 发生错误",str(e)
			if hasattr(e, "errno") and e.errno == 111:
				info = "请先启动cheungssh-command-system后操作。"
			else:
				info = str(e)
			cheungssh_info={"status":False,"content":info}
		return cheungssh_info
	def mark_ssh_as_active(self):
		cheungssh_info={"status":False,'content':""}
		try:
			data = {"request_type":"active"}
			hosts = self.r.GET.get("hosts")
			hosts = json.loads(hosts)
			data["hosts"] = hosts
			data = json.dumps(data,encoding='utf8',ensure_ascii=False)
			s = socket.socket(2,1)
			s.connect(("127.0.0.1",9002))
			s.send(data)
			data = s.recv(204800)
			s.close()
			cheungssh_info = json.loads(data)
		except Exception,e:
			cheungssh_info = {"status":False,"content":str(e)}
		return cheungssh_info
