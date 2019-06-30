#!/usr/bin/env python
#coding:utf8
#Author:张其川
import os,sys,json,random,copy,time,msgpack
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings ######私有全局设置
from cheungssh_file_transfer import CheungSSHFileTransfer
from cheungssh_error import CheungSSHError
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_thread_queue import CheungSSHPool
from django.core.cache import cache
from cheungssh_sshv2 import CheungSSH_SSH
from assets_list import assets_conf
import copy
from custom_assets_class import custom_assets
REDIS=cache.master_client
######自动增加时间字段,否则前端没有时间字段
assets_conf["time"]={
		"value":"",
		"name":"采集时间"
	}
######自动增加时间字段,否则前端没有时间字段


REDIS.set("assets.conf",json.dumps(assets_conf,encoding="utf8",ensure_ascii=False))
class ControlerCenter(object):
	def __init__(self,servers_list=[],task_type="multi"):
		self.assets_conf=assets_conf
		#####"根据sid的个数判断， 是否多线程,如果是单个， 就单线程
		#####sid是一个list
		self.servers_list=servers_list
		self.task_type=task_type
		self.REDIS=REDIS
		self.assets_data={} ######存放全部主机的资产收集数据 {"sid1":{},"sid2":{}}
		self.time=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
	def get_all_servers(self):
		cheungssh_info={"status":False,"content":[]}
		try:
			servers_list=REDIS.lrange("servers.config.list",0,-1)
			if servers_list is None:
				pass
			else:
				for _line in servers_list:
					line = json.loads(_line)
					cheungssh_info["content"].append(line["id"])
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def custom_assets(self):
		cheungssh_info={"status":False,"content":""}
		try:
			data=self.REDIS.get("custom.assets.class.list")
			#########{"id":{"command":""},"id2":{}}
			if data is None:
				data={}
			else:
				data=msgpack.unpackb(data)
			cheungssh_info["content"]=data
			cheungssh_info["status"]=False
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def merge_custrom_and_fixed_assets(self):
		pass
	def upload_script_and_execute_command(self,**parameters):
		cheungssh_info={"status":False,"content":""}
		#if not parameters["username"]  == "root":
		#	raise CheungSSHError("非管理员账号，不能采集目标服务器资产")
		try:
			###########上传资产查询文件
			ssh=CheungSSH_SSH()
			login=ssh.login(**parameters)
			if not login["status"]:
				raise CheungSSHError("登录错误: %s" %login["content"])
			try:
				sid = parameters["id"]
				alias =parameters["alias"]
				#########逐个获取每一个资产项目,下面是有自定义资产添加的功能的代码
				info={} ##########用于存储一个机器的全部资产收集数据
				#tmp_assets_conf=copy.deepcopy(assets_conf) ########复制一个，用来使用,必须深拷贝
				#custom_assets_class_list=REDIS.get("custom.assets.class.list")
				#if not custom_assets_class_list is None:
				#	custom_assets_class_list=msgpack.unpackb(custom_assets_class_list)#####如果没有自定义资产，那么下面的json代码就要报错
				#else:
				#	custom_assets_class_list={}
				#tmp_assets_conf=dict(tmp_assets_conf,**custom_assets_class_list)
				#for asset in tmp_assets_conf.keys():
				_assets_conf=copy.deepcopy(self.assets_conf)
				for asset in _assets_conf.keys():
					######不能用中文
					#####print tmp_assets_conf[asset]["command"]
					if _assets_conf[asset].has_key("asset_type"):
						if _assets_conf[asset]["asset_type"]=="static":
							#######静态资产，不执行命令
							continue
					if asset=="time":
						_assets_conf[asset]["value"]=self.time ########在原来的assets_conf上加了value字段
						continue
					cmd=_assets_conf[asset]["command"][ssh.kws['os_type']]
					data=ssh.execute(cmd=cmd,sid=parameters["id"],tid=0,ignore=True) ######执行资产列表的命令
					if data["status"] is True:
						#######判断是否执行成功
						try:
							result="\n".join(data["content"].split('\r\n')[1:-1])
							#print data['content'].split('OKD'),8888888888888888888888888888888888888888888
						except Exception,e:
							result="获取数据失败 %s" % str(e)
					else:
						result="获取数据失败 %s" % data["content"]
					_assets_conf[asset]["value"]=result ########在原来的assets_conf上加了value字段
				self.assets_data[sid]={"sid":sid,"alias":alias,"data":_assets_conf}
				print "已经取得资产信息."
			except ValueError:
				raise CheungSSHError("获取资产数据失败!")
		except KeyError,e:
			print "服务器类型不对称的错误: ",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
				
		except Exception,e:
			print "采集报错: ",str(e)
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		finally:
			try:
				ssh.logout()
			except Exception,e:
				pass

		return cheungssh_info
	def run(self):
		cheungssh_info={"status":False,"content":"无消息"}
		try:
			if self.task_type == "single":
				#single
				for s in self.servers_list:
					server_config=CheungSSHControler.convert_id_to_ip(sid=s)
					ControlerCenter.upload_script_and_execute_command(**server_config["content"])
			else:
				if len(self.servers_list)==1 and self.servers_list[0].upper()=="ALL":
					info=self.get_all_servers()
					if not info["status"]:
						raise CheungSSHError(info["content"])
					else:
						self.servers_list=info["content"]
				pool=CheungSSHPool()
				for s in self.servers_list:
					server_config=CheungSSHControler.convert_id_to_ip(sid=s)
					#pool.add_task(test_func,{"args":11})
					#pool.add_task(ControlerCenter.upload_script_and_execute_command,server_config["content"])
					pool.add_task(self.upload_script_and_execute_command,server_config["content"])
				pool.all_complete()
				##########保存数据
				info=self.save_assets_data()
				if info["status"]:
					print "已经存储资产信息"
				else:
					raise CheungSSHError("存储资产信息失败了:",info["content"])
				#multi
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	def save_assets_data(self):
		#######保存资产数据到redis服务器，使用字符串的形式
		cheungssh_info={"status":False,"content":"无消息"}
		try:
			#######在写入临时资产记录的时候，把这个空间清空，否则有重复
			#current_assets=json.dumps(self.assets_data,encoding="utf8",ensure_ascii=False) ###########转换为string存储,当前表
			#self.REDIS.set("current.assets",current_assets)
			#######更新当前表的记录，但不是失败的就取消哦！如果此前的临时记录中有的， 本次没有，就不要删除以前的，保留它
			before_current_assets=self.REDIS.get("current.assets")#####当前资产记录
			if before_current_assets is None:
				before_current_assets={}#####如果是空的None，那么设置为空，否则json.loads(None)报错
			else:
				before_current_assets=json.loads(before_current_assets)
			for id in self.assets_data.keys():
				before_current_assets[id]=self.assets_data[id]
			######把它重新写入临时表
			before_current_assets=json.dumps(before_current_assets,encoding="utf8",ensure_ascii=False)
			self.REDIS.set("current.assets",before_current_assets)
			######写入历史记录表
			for sid in self.assets_data.keys():
				info=self.assets_data[sid] #########{"sid","","alias":"","data":{}}
				info=json.dumps(info,encoding="utf8",ensure_ascii=False)
				self.REDIS.rpush("history.assets",info) #######[{},{},{}]
			cheungssh_info["status"]=True
		except Exception,e:
			print "保存数据报错了",e
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
			
		
if __name__=='__main__':
	a=ControlerCenter(servers_list=["all"],task_type="multi")
	print a.run()
		
