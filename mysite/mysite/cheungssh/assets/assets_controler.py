#!/usr/bin/env python
#coding:utf8
#Author:张其川
import os,sys,json,random,copy,time,msgpack
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings 
from cheungssh_file_transfer import CheungSSHFileTransfer
from cheungssh_error import CheungSSHError
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_thread_queue import CheungSSHPool
from django.core.cache import cache
from cheungssh_sshv2 import CheungSSH_SSH
from assets_list import assets_conf
from custom_assets_class import custom_assets
REDIS=cache.master_client
redis_assets_conf=REDIS.get("assets.conf")
if redis_assets_conf is None:
	REDIS.set("assets.conf",json.dumps(assets_conf,encoding="utf8",ensure_ascii=False))
else:
	assets_conf=json.loads(redis_assets_conf) 
class ControlerCenter(object):
	def __init__(self,servers_list=[],task_type="multi"):
		
		
		self.servers_list=servers_list
		self.task_type=task_type
		self.REDIS=REDIS
		self.assets_data={} 
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
		if not parameters["username"]  == "root":
			raise CheungSSHError("非管理员账号，不能采集目标服务器资产")
		try:
			
			ssh=CheungSSH_SSH()
			login=ssh.login(**parameters)
			if not login["status"]:
				raise CheungSSHError("登录错误: %s" %login["content"])
			try:
				sid = parameters["id"]
				alias =parameters["alias"]
				
				info={} 
				tmp_assets_conf=copy.deepcopy(assets_conf) 
				custom_assets_class_list=REDIS.get("custom.assets.class.list")
				if not custom_assets_class_list is None:
					custom_assets_class_list=msgpack.unpackb(custom_assets_class_list)
				else:
					custom_assets_class_list={}
				tmp_assets_conf=dict(tmp_assets_conf,**custom_assets_class_list)
				for asset in tmp_assets_conf.keys():
					
					
					if tmp_assets_conf[asset].has_key("asset_type"):
						if tmp_assets_conf[asset]["asset_type"]=="static":
							
							tmp_assets_conf[asset]["value"]=tmp_assets_conf[asset]["value"]
							continue
					if asset=="time":
						tmp_assets_conf[asset]["value"]=self.time 
						continue
					data=ssh.execute(cmd=tmp_assets_conf[asset]["command"],sid=parameters["id"],tid=0,ignore=True) 
					if data["status"] is True:
						
						try:
							result=data["content"].split('\n')[1].strip('\r')
						except Exception,e:
							result="获取数据失败 %s" % str(e)
					else:
						result="获取数据失败 %s" % data["content"]
					tmp_assets_conf[asset]["value"]=result 
				self.assets_data[sid]={"sid":sid,"alias":alias,"data":tmp_assets_conf}
				print "已经取得资产信息."
			except ValueError:
				raise CheungSSHError("获取资产数据失败!")
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
		
		cheungssh_info={"status":False,"content":"无消息"}
		try:
			
			#current_assets=json.dumps(self.assets_data,encoding="utf8",ensure_ascii=False) 
			#self.REDIS.set("current.assets",current_assets)
			
			before_current_assets=self.REDIS.get("current.assets")
			if before_current_assets is None:
				before_current_assets={}
			else:
				before_current_assets=json.loads(before_current_assets)
			for id in self.assets_data.keys():
				before_current_assets[id]=self.assets_data[id]
			
			before_current_assets=json.dumps(before_current_assets,encoding="utf8",ensure_ascii=False)
			self.REDIS.set("current.assets",before_current_assets)
			
			for sid in self.assets_data.keys():
				info=self.assets_data[sid] 
				info=json.dumps(info,encoding="utf8",ensure_ascii=False)
				self.REDIS.rpush("history.assets",info) 
			cheungssh_info["status"]=True
		except Exception,e:
			print "保存数据报错了",e
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
			
		
if __name__=='__main__':
	a=ControlerCenter(servers_list=["all"],task_type="multi")
	print a.run()
		
