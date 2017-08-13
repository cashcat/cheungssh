#coding:utf-8
import json,sys,os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
#######shell终端操作支持
from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_dashboard import CheungSSHDashboard



class process(CheungSSHDashboard):
	def __init__(self):
		#####定义存储在redis 的名称, 历史记录有  _key 结束，临时记录以 _tmp结束
		#####先检查临时记录，如果临时记录没有，再从机器上读取
		self.all_options={
			"mem":"localhost.mem.history",
			"load":"localhost.load.history",			
			"root_disk":"localhost.root.disk.history",	
			"io":"localhost.io.history",		
			"cpu":"localhost.cpu.history",
		}
		CheungSSHDashboard.__init__(self)
	def get_info_from_redis(self):	
		#######历史记录,用户画Line图
		info={}
		for key in self.all_options:
			info[key]=REDIS.lrange(key,-7,-1)
	def execute_collect(self):
		self.all_info=self.collect()				#######执行父方法中的
		for key in self.all_info.keys():
			if key=="io":#######这里需要json转换，否则存入redis后就变成了 一个 '
				REDIS.rpush(self.all_options[key],json.dumps(self.all_info[key],encoding="utf8",ensure_ascii=False))	######写入历史记录
			elif key=="cpu":
				REDIS.rpush(self.all_options[key],json.dumps(self.all_info[key],encoding="utf8",ensure_ascii=False))	######写入历史记录
			else:
				REDIS.rpush(self.all_options[key],self.all_info[key])		######写入历史记录
			REDIS.set("%s_tmp"%(self.all_options[key]),self.all_info[key])		#####5分钟收集一次
		return self.all_info
			
	def get_info(self):
		#######获取临时记录
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
