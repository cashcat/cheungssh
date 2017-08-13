#coding:utf-8
import json,sys,os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')

from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_dashboard import CheungSSHDashboard



class process(CheungSSHDashboard):
	def __init__(self):
		
		
		self.all_options={
			"mem":"localhost.mem.history",
			"load":"localhost.load.history",			
			"root_disk":"localhost.root.disk.history",	
			"io":"localhost.io.history",		
			"cpu":"localhost.cpu.history",
		}
		CheungSSHDashboard.__init__(self)
	def get_info_from_redis(self):	
		
		info={}
		for key in self.all_options:
			info[key]=REDIS.lrange(key,-7,-1)
	def execute_collect(self):
		self.all_info=self.collect()				
		for key in self.all_info.keys():
			if key=="io":
				REDIS.rpush(self.all_options[key],json.dumps(self.all_info[key],encoding="utf8",ensure_ascii=False))	
			elif key=="cpu":
				REDIS.rpush(self.all_options[key],json.dumps(self.all_info[key],encoding="utf8",ensure_ascii=False))	
			else:
				REDIS.rpush(self.all_options[key],self.all_info[key])		
			REDIS.set("%s_tmp"%(self.all_options[key]),self.all_info[key])		
		return self.all_info
			
	def get_info(self):
		
		info={}
		for key in self.all_options.keys():
			_value=REDIS.get("%s_tmp"%self.all_options[key])
			info[key]=_value
		info["io"]=REDIS.lrange(self.all_options["io"],-7,-1)
		info["cpu"]=REDIS.lrange(self.all_options["cpu"],-7,-1)
		return info
if  __name__=="__main__":
	a=process()
	print a.get_info()
