#coding:utf8
#Author: 张其川
import re,os,sys,commands
path="/var/spool/cron/cheungssh"
class CheungSSHDeploymentCrontab(object):
	@staticmethod
	def save_deployment_crontab(data,whoami):
		action=data["action"]
		try:
			line="{time} python /home/cheungssh/mysite/mysite/cheungssh/deployment_protocol/cheungssh_deployment_admin.py {taskid} {task_name} {owner}".format(time=data["crontab_time"],taskid=data["tid"],task_name=data["task_name"],owner=whoami)
			try:
				with open(path,"r") as f:
					t=f.read()
			except Exception,e:
				e=str(e)
				if re.search("No such file or directory",e):
					t=""
				else:
					raise IOError(e)
				
			if re.search("{tid}.*{owner}".format(tid=data["tid"],owner=data["owner"]),t) and action=="add":
				raise IOError("该部署任务在计划任务表中存在，您不必再次创建计划任务，修改后保存即可.")
			elif action=="edit":
				cmd="sed -i 's#.*python /home/cheungssh/mysite/mysite/cheungssh/deployment_protocol/cheungssh_deployment_admin.py {taskid} {task_name} {owner}#{crontab_time} python /home/cheungssh/mysite/mysite/cheungssh/deployment_protocol/cheungssh_deployment_admin.py {taskid} {task_name} {owner}#g' {path}".format(
					taskid=data["tid"],
					task_name=data["task_name"],
					owner=data["owner"],
					crontab_time=data["crontab_time"],
					path=path)
				#####修改完毕后，归属依然是原来的，仅仅修改的是时间而已,归属和任务名不许修改
				status=commands.getstatusoutput(cmd)
				if not status[0]==0:
					raise IOError(status[1])
			else:
				with open(path,"a") as f:
					f.write("{line}\n".format(line=line))
			del t,f
			cheungssh_info={"status":True,"content":""}
		except Exception,e:
			cheungssh_info={"status":False,"content":str(e)}
		return cheungssh_info
	@staticmethod
	def delete_deployment_crontab(is_super,owner,tid):
		cheungssh_info={"content":"","status":False}
		try:
			cmd="sed -i '/{tid}.*{owner}/d' {path}".format(tid=tid,owner=owner,path=path)
			print cmd
			status=commands.getstatusoutput(cmd)
			if status[0]==0:
				cheungssh_info["status"]=True
			else:
				cheungssh_info["content"]=status[1]
		except Exception,e:
			cheungssh_info["content"]=str(e)
		return cheungssh_info
	@staticmethod
	def get_deployment_crontab(isSuper,whoami):
		cheungssh_info={"content":[],"status":True}
		try:
			f=open(path,"r")
			for line in f:
				_line=line.strip().split()
				try:
					t="python /home/cheungssh/mysite/mysite/cheungssh/deployment_protocol/cheungssh_deployment_admin.py"
					if re.search(t,line):
						#####找到了任务行
						run_time  = " ".join(_line[:5])
						tid       = _line[7]
						task_name = _line[8]    
						owner     = _line[9]
						last_run_time = "新建"
						#########查找最后一次运行的时间
						isBreak=False
						x=sorted(os.listdir("/var/log/"))[::-1]
						x.insert(0,'cron')
						for filename in x:#####反排序，并且优先搜索cron文件
							########逐个扫描文件
							if re.search("cron",filename):
								try:
									with open("/var/log/{filename}".format(filename=filename),"r") as m:
										_info=m.readlines()
									_info=_info[::-1] ######从文件末尾开始扫描,避免扫到之前的记录
									for h in _info:
										#######扫描每一个文件的每一行
										if re.search("\(cheungssh\) CMD \(python /home/cheungssh/mysite/mysite/cheungssh/deployment_protocol/cheungssh_deployment_admin.py {tid}.*{owner}".format(tid=tid,owner=owner),h):
											#####取消任务名匹配，因为有中文获取不到
											last_run_time=" ".join(h.split()[:3])
											isBreak=True
											break
									if isBreak:break########## 找到了配置，就不找了
								except Exception,e:
									pass
							else:
								continue
						if isSuper or whoami == owner:
							info= {"crontab_time":run_time,"tid":tid,"task_name":task_name,"owner":owner,"last_run_time":last_run_time}
							cheungssh_info["content"].append(info)

				except Exception,e:
					pass
			f.close()
			cheungssh_info["status"]=True
		except Exception,e:
			err=str(e)
			if re.search("Permission denied",err):
				err="请在CheungSSH服务器上执行命令: chown -R cheungssh.cheungssh {path} 解决这个错误".format(path=os.path.dirname(path))
				cheungssh_info["content"]=err
				cheungssh_info["status"]=False
			elif re.search("No such file or directory",err):
				cheungssh_info["content"]=[]
				cheungssh_info["status"]=True
				#####默认没有计划任务，所以是True
			else:
				cheungssh_info["content"]=err
				cheungssh_info["status"]=False
				
		return cheungssh_info
