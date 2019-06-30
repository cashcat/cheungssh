#!/usr/bin/env python
#coding:utf-8
#Author: Cheung Kei-Chuen CheungSSH 张其川
import paramiko,re,socket,os,sys,json,time
sys.path.append('/home/cheungssh/mysite')
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
from ServersInventory import ServersInventory
from cheungssh_error import CheungSSHError
from cheungssh_sshv2 import CheungSSH_SSH
class Crontab(object):
	def __init__(self):
		pass
	@staticmethod
	def get_sed_separate(crontab_format):
		#####因为sed -i 's/' 中的分隔符号，有的计划任务携带有同样的字符，所以需要判断，避开相同字符。
		try:
			if not  re.search('\+',crontab_format):
				char= '+'
			elif not re.search('=',crontab_format):
				char= '='
			elif not re.search('%',crontab_format):
				char='%'
			elif not re.search('\?',crontab_format):
				char='?'
			elif not re.search(':',crontab_format):
				char=':'
			elif not re.search('\^',crontab_format):
				char='^'
			else:
				raise CheungSSHError("您的命令比较特殊，请您联系CheungSSH作者协助解决这个问题")
			cheungssh_info={"content":char,"status":True}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info
		
			
	def modify_crontab_list(self,action="create/modify",data={}):
		#####action 为create/modify，data是一个dict格式
		#####创建计划任务
		#####data数据格式：{"sid":"","runtime":"","cmd":"","dest":""} ,如果是modify，应该有tid字段
		cheungssh_info={"status":False,"content":""}
		crontab_format="{runtime} {cmd} #{dest}".format(runtime=data["time"],cmd=data["cmd"],dest=data["description"])
		try:
			#####判断sed的分隔符
			_sed_t=Crontab.get_sed_separate(crontab_format)#####获取判断字符是否符合规格
			if not _sed_t["status"]:
				raise CheungSSHError(_sed_t["content"])
			else:
				char=_sed_t["content"]
			ssh=CheungSSH_SSH()
			configuration = ServersInventory().get_server(sid=data["sid"])
			if not configuration["status"]:raise IOError(configuration["content"])
			a=ssh.login(**configuration["content"])
			if a["status"]:
				username=configuration["content"]["username"]
				path=os.path.join("/var/spool/cron/",username)
				if data["action"]=="modify":
					#####修改计划任务列表
					info=ssh.execute("sed -i '{id}s{char}.*{char}{crontab_format}{char}' {path}".format(char=char,id=data["line_id"],path=path,crontab_format=crontab_format))######替换新的内容
					if not info["status"]:
						raise CheungSSHError(info["content"])
				else:
					#####在文件末尾追加
					info=ssh.execute(""" echo  '{crontab_format}' >>{path} """.format(crontab_format=crontab_format,path=path))
					if not info["status"]:
						raise CheungSSHError(info["content"])
				cheungssh_info["status"] = True
			else:
				cheungssh_info["content"]=a["content"]
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		return cheungssh_info

	def delete_crontab_list(self,data):
		cheungssh_info={"content":"","status":False}
		try:
			configuration = ServersInventory().get_server(sid=data["sid"])
			if not configuration["status"]:raise IOError(configuration["content"])
			ssh=CheungSSH_SSH()
			status=ssh.login(**configuration["content"])
			if not status["status"]:
				######登录是失败的
				raise CheungSSHError(status["content"])
			else:
				info=ssh.execute("whoami")
				if info["status"]:
					path=os.path.join("/var/spool/cron/",configuration["content"]["username"])
					info=ssh.execute("sed -i '{line_id}s/.*/#/' {path}".format(line_id=data["line_id"],path=path))#####删除远程服务器上的
					if not info["status"]:
						raise CheungSSHError(info["content"])
					cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
			
		return cheungssh_info
		
	def get_crontab_list(self,sid):######data应该是存放的ip的相关登录信息
		cheungssh_info={"content":[],"status":False}
		cmd="/usr/bin/crontab -l"
		crontab_data=[]
		try:
			configuration = ServersInventory().get_server(sid=sid)
			if not configuration["status"]:raise IOError(configuration["content"])
			ssh=CheungSSH_SSH()
			status=ssh.login(**configuration["content"])
			if not status["status"]:
				######登录是失败的
				raise CheungSSHError(status["content"])
			else:
				########登录成功的
				data=ssh.execute(cmd,ignore=True)
				if re.search("-bash: /usr/bin/crontab: No such file",data["content"]):
					pass
				else:
					######命令执行结果成功了
					#print "结果:",data["content"]
					crontab_list=data["content"]
					#crontab_list="\n".join(crontab_list.split('\n')[1:][:-1])
					crontab_list="\n".join(crontab_list.split('\n')[1:][:-1])
					#print crontab_list,555555555555555555555555555555555555555
					#print crontab_list.split('abcded'),555555555555555555555555555555555555555
					line_id = 0
					for line in crontab_list.split('\n'):
						line_id += 1
						if re.search('^ *#',line):
							continue
						elif re.search('^ *$',line):
							continue
						try:
							crontab_time=" ".join(line.split()[:5])
							if re.search("#",line):
								crontab_cmd=" ".join(line.split()[5:][:-1])
							else:
								crontab_cmd=" ".join(line.split()[5:])
							if len(crontab_cmd)==0:
								if not len(line.split())==6:######考虑只有一个命令的情况，没有注释的情况或者参数的情况
									continue
								else:
									crontab_cmd=" ".join(line.split()[5:])
									
							if re.search("#",line):
								crontab_dest=line.split("#")[-1]
							else:
								crontab_dest=""
							crontab_data.append(
								{"cmd":crontab_cmd,
								"time":crontab_time,
								"description":crontab_dest,
								"sid":sid,
								"username":configuration["content"]["username"],
								"alias":configuration["content"]["alias"],
								"line":line_id,
								}
							)
						except Exception,e:
							print "报错了",str(e)
							pass
			cheungssh_info["content"]=crontab_data
			cheungssh_info["status"]=True
		except Exception,e:
			print "程序报错",e
			cheungssh_info["content"]=str(e)
			cheungssh_info["status"]=False
		return cheungssh_info
