#!/usr/bin/env python
#coding:utf8
import commands
from auto_login import auto_login
class Crontab:
	def __init__(self):
		pass
	def get_status(self):
		status=auto_login('192.168.13.135',22,'root','zhang',"service crond status")
		if status[1]:
			return True
		else:
			return False
	def show_list(self):
		#在获取crond的清单之前，应该判断一下crond是否启动了，否则没有意义啊
		data={}
		if self.get_status():
			info=auto_login('192.168.13.135',22,'root','zhang',"crontab -l")[0]
			for line in info.split('\n'):
				_line=line.split('#')
				crond_line=_line[0]
				id=_line[-1]
				#刚才发现了有空的id，那么我们在这里过滤一下就好了
				if len(id)==0:
					continue
				data[id]=crond_line
		else:
			print "抱歉，您的crond服务尚未启动!"
		return data
	def add_crontab(self,time,command,id):
		#这里只能用来一个个的计划任务添加，不能用来全部重新写入
		crond_command=" echo '%s %s #%s' >> /var/spool/cron/root" % (time,command,id)
		info=auto_login('192.168.13.135',22,'root','zhang',crond_command)
		if info[1]:
			print "恭喜，已经写成功了"
		else:
			print "抱歉，写入计划任务失败了"
	def remove_crontab(self,id):
		#输入一个id，然后根据这个id删除计划任务的条目
		my_crond_list=self.show_list()#通过这个函数，去获取到清单
		for cid in my_crond_list.keys():#查找，如果你传递过来的id等于本来的id，那么就应该把这个删除
			if str(id)==str(cid):#转换为string类型，否则不同类型不能比较
				del my_crond_list[cid]#直接删除就行了
		#这里应该去调用rewrite方法/函数
		status=self.rewrite_crontab(my_crond_list)
		if status:
			print "哈哈， 完成了哦"
		else:
			print "糟糕，错误了!"
	def rewrite_crontab(self,my_crond_list):
		#第一步，首先清空原来的计划任务表，然后重新写入
		info=auto_login('192.168.13.135',22,'root','zhang',"echo  '' > /var/spool/cron/root")
		#开始循环把新的写入
		for id in my_crond_list.keys():
			command="echo '%s #%s' >> /var/spool/cron/root" % (my_crond_list[id],id)
			info=auto_login('192.168.13.135',22,'root','zhang',command)
			if info[1]:
				print "成功了"
			else:
				print "失败了"
				return False
		return True
		
	
			
			
			
		
		
		
		
if  __name__=='__main__':
	G=Crontab()
	#G.show_list()
	#G.get_status()
	#G.write_crontab("*/3 * * * *","/sbin/ifconfig","99999")
	G.remove_crontab(99999)
