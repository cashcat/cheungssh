#!/usr/bin/env python
#coding:utf8
#Author: 张其川
import time,inspect,traceback
class CheungSSHLog(object):
	logfile="/home/cheungssh/logs/cheungssh.log"
	@staticmethod
	def __write_log(data):
		try:
			f=open(CheungSSHLog.logfile,'a')
			info="[{now_time}] -- [{case}] -- [{info}]".format(now_time=data["now_time"],case=data["case"],info=data["info"])
			f.write("%s\n" % info)
			f.close()
		except Exception,e:
			pass
		
	@staticmethod
	def info(case="未定义事件",info="无结论消息"):
		now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		data={'now_time':now_time,'case':case,'info':info}
		CheungSSHLog._CheungSSHLog__write_log(data)
		
		
