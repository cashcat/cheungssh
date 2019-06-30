#!/usr/bin/env python
#coding:utf8
#Author:张其川,CheungSSH
import re,sys,os,msgpack,shutil
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings
from django.core.cache import cache
from cheungssh_error import CheungSSHError
REDIS=cache.master_client
from cheungssh_file_transfer import CheungSSHFileTransfer

from cheungssh_modul_controler import CheungSSHControler

class CheungSSHAnalyLog(object):
	
	def __init__(self,check_time={"year":"2017","month":"Nov","day":"22"},logfile=""):
			self.check_time=check_time
			self.logfile=logfile
			self.logtype=["24小时内访问量最大的时间段","访问量最大时间段中访问次数最多的URL"]
			self.http_code={}

	def __process_all_data(self):
		#指定时间段内，访问次数最多的排序,参数为哪一年的哪一天月份中的哪一天，一共24个小时
		cheungssh_info={"content":"","status":False}
		# 整理时间格式
		search_time="{day}/{month}/{year}".format(day=self.check_time["day"],month=self.check_time["month"],year=self.check_time["year"])
		data={}
		try:
			p=open(self.logfile)
			i=0
			for  line in p:
				i+=1
				# 获取符合日期的小时关键字
				time_seg=re.search("%s:(\d{2})" % search_time,line)
				if time_seg:
					# 如果找到了，则处理
					try:
						url=re.search("\"(POST|GET) +(\S*)",line).group(2).split("?")[0]  
					except Exception,e:
						#错误日志行忽略
						continue
					time_seg="{hour}点".format(year=self.check_time["year"],month=self.check_time["month"],day=self.check_time["day"],hour=time_seg.group(1))
					# 处理返回码
					self.process_http_code(line)
					if data.has_key(time_seg):
						# 此前已经有数据了，所以每循环到一行，累加就可以了
						data[time_seg]["count"]+=1
						if data[time_seg]["url"].has_key(url):
							# 如果此前已经出现过了一次这个url，那么累加
							data[time_seg]["url"][url]+=1
						else:
							# 之前在比如8点的时候，也可能到现在为止没有出现过这个URL，所以设定为1,
							data[time_seg]["url"][url]=1
					else:
						# 第一次计数，所以设定为1
						data[time_seg]={
									"count":1,
									"url":{}
								}
						data[time_seg]["url"][url]=1
				else:
					pass
			p.close()
			cheungssh_info={"status":True,"content":data}
		except Exception,e:
			print  "报错了"
			cheungssh_info={"content":str(e),"status":False}
		#返回数据格式：{01:200,02:9999,03:.....23:333,24:66666}
		self.all_data=cheungssh_info
		return cheungssh_info
	def intime_every_hour_url_count(self,head_time=24,head_url=10):
		# 访问量最大的时间段中，放问最多的URL的和次数.比如8点访问了A,B,C,D这些URL，他们分别多少次
		# --parameter: head_time 时间段访问量排名靠前
		# --parameter: head_url URL访问量排名靠前
		cheungssh_info={"content":"","status":False}
		self._CheungSSHAnalyLog__process_all_data()
		info=self.intime_max_access_hour(head_time)
		try:
			if info["status"]:
				data=info["content"]
				#获得每小时访问量最高的排序后的原始数据
				#[('01', {'count': 4, 'url': {'/robots.txt': 1, '/': 3}}), ('03', {'count': 7, 'url': {'/robots.txt': 1, '/': 6}})]
				_tmp={}
				for t in data:
					time_seg=t[0]
					_tmp[time_seg]=self.all_data["content"][time_seg]
				_data=[]
				for hour in _tmp.keys():	
					time_round_url_item=_tmp[hour]["url"].items()

					# 开始冒泡计算
					for i in range(len(time_round_url_item)-1):    # 这个循环负责设置冒泡排序进行的次数
						for j in range(len(time_round_url_item)-i-1):  # ｊ为列表下标
							if time_round_url_item[j][1] > time_round_url_item[j+1][1]:
								time_round_url_item[j], time_round_url_item[j+1] = time_round_url_item[j+1], time_round_url_item[j]
				
					#最后排序  [13:("url1":29,"url2":90),16:()]
					_data.append({hour:time_round_url_item[-head_url:]}) #显示排名靠N前的
				
			else:
				raise IOError(info["content"])
			cheungssh_info={"content":_data,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		"""
		[{'02': [('http://www.baidu.com/', 1), ('/admin/editor/plugins/code/prettify.css', 1), ('/content/templates/default/main.css', 1), ('/admin/editor/plugins/code/prettify.js', 1), ('/robots.txt', 2), ('/include/lib/js/common_tpl.js', 2), ('/xmlrpc.php', 2), ('/sitemap.xml', 3), ('/', 9)]}, {'03': [('/robots.txt', 1), ('/', 6)]}, {'00': [('/robots.txt', 1), ('/admin/editor/plugins/code/prettify.css', 1), ('/content/templates/default/main.css', 1), ('/admin/editor/plugins/code/prettify.js', 1), ('/status_code.html', 1), ('/include/lib/js/common_tpl.js', 2), ('/', 4)]}, {'01': [('/robots.txt', 1), ('/', 3)]}]
		"""
		return cheungssh_info
			
			
		

	def intime_max_access_hour(self,head_time=24):
		#在24小时内，访问URL次数最多的小时排序
		#默认前面三个
		
		cheungssh_info={"content":"","status":False}
		self._CheungSSHAnalyLog__process_all_data()
		try:
			if not self.all_data["status"]:raise IOError(self.all_data["content"])
			data=self.all_data["content"].items()
			# 开始冒泡计算
			if self.all_data["status"]:
				for i in range(len(data)-1):    # 这个循环负责设置冒泡排序进行的次数
					for j in range(len(data)-i-1):  # ｊ为列表下标
						if data[j][1]["count"] > data[j+1][1]["count"]:
							data[j], data[j+1] = data[j+1], data[j]
			else:
				raise IOError(self.all_Data["content"])
			cheungssh_info={"content":data[-head_time:],"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
	def process_http_code(self,line):
		try:
			code=int(line.split()[8])
			if code==200:
				color="green"
				name="状态码%s正常" % code
			elif code==401:
				color="#FF8EFF"
				name="状态码%s未授权" %code
			elif code==403:
				color="#6F00D2"
				name="状态码%s禁止" %code
			
			elif code==404:
				color="yellow"
				name="状态码%s未找到" %code
			elif code==500:
				color="red"
				name="状态码%s错误" %code
			else:
				color="#6C6C6C"
				name="状态码%s未定义" %code
				
			if self.http_code.has_key(code):
				self.http_code[code]["value"]+=1
			else:
				self.http_code[code]={"value":1,"color":color,"name":name}
		except Exception,e:
			#报错忽略
			pass

	@staticmethod
	def get_logfile_date(logfile,realname,_type):
		# 获取整个日志文件的天日，格式为：日/月/年
		cheungssh_info={"content":"","status":False}
		# 存放所有日期
		date=[]
		try:
			#####判断是否是远程日志，如果是，则需要提前下载
			
			#####
			try:
				os.makedirs(os.path.dirname(realname))
			except:
				pass
			if  _type=="remote":
				tfile=realname
				sid=msgpack.unpackb(REDIS.hget("CHB-0383740494845",tfile.split("/")[-1]))["sid"]#####获取服务器sid
				conf=CheungSSHControler.convert_id_to_ip(sid)
				if not conf["status"]:raise IOError(conf["content"])
				conf=conf["content"]
				ssh=CheungSSHFileTransfer()
				sftp=ssh.login(**conf)
				if not sftp["status"]:raise IOError(sftp["content"])
				t=ssh.download(remote_file=logfile,local_file=realname,tid="")
				shutil.move(os.path.join(cheungssh_settings.download_dir,realname.split("/")[-1]),realname)
				if not t["status"]:raise IOError(t["content"])
			else:
				tfile=logfile
			f=open(tfile)
			for line in f:
				try:
					_date=re.search("\[([0-9]{1,2}/[A-Z][a-z]{2}/20[0-9]{2}):[0-9]{2}:[0-9]{2}:[0-9]{2}",line).group(1)
					# 判断是否重复过
					if not _date in date: date.append(_date)
				except:
					pass
			data={"date":date,"type":CheungSSHAnalyLog().logtype,"realname":realname}
			cheungssh_info={"content":data,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		print type(cheungssh_info)
		return cheungssh_info
		

if  __name__=='__main__':
	#a=CheungSSHAnalyLog({"year":"2016","month":"Nov","day":"17"},"access.log")
	#print a.intime_max_access_hour()
	#print a.intime_every_hour_url_count()
	pass
