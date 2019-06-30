#!/usr/bin/env python
#coding:utf8
#Author: 张其川
import os,sys,threading
sys.path.append('/home/cheungssh/mysite/mysite/cheungssh')
import cheungssh_settings
from cheungssh_error import CheungSSHError
from cheungssh_file_transfer import CheungSSHFileTransfer
import cheungssh_modul_controler,random
from cheungssh_sshv2 import CheungSSH_SSH
class CheungSSHScript(object):
	def __init__(self):
		pass
	@staticmethod
	def script_init(sid,sfile,username):
		#####sid是要上传的服务器，sfile是要上传的源文件，username是那个用户请求上传
		sfile=sfile.encode("utf-8")
		cheungssh_info={"content":"","status":False}
		tid=str(random.randint(90000000000000000000,99999999999999999999))
		try:
			sfile=os.path.join(cheungssh_settings.script_dir,username,os.path.basename(sfile))#####过滤源文件地址为规定目录中
			dfile=os.path.join('/tmp/',tid)#####上传到远程目录的tmp下
			host=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)
			if not host["status"]:raise CheungSSHError(host['content'])
			_host_info=host['content']
			sftp=CheungSSHFileTransfer()
			login=sftp.login(**_host_info)
			if not login["status"]:raise CheungSSHError(login["content"])
			#####写入初始的进度0
			_tmp_data={"status":True,"content":"","progress":"0","tid":tid}
			sftp.write_progress(_tmp_data)
			t=threading.Thread(target=sftp.upload,args=(sfile,dfile,tid))
			t.start()
			cheungssh_info["status"]=True
			cheungssh_info["tid"]=tid
			cheungssh_info["dfile"]=dfile
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
			#####返回格式{"status":True,"content":"","tid":tid,"dfile":dfile}
		return cheungssh_info

	@staticmethod
	def deployment_script_init_and_execute(sid,sfile,username):
		######用不着写进度，直接就是获取返回值，不是多线程
		cheungssh_info={"content":"","status":False}
		tid=str(random.randint(90000000000000000000,99999999999999999999))
		try:
			sfile=os.path.join(cheungssh_settings.script_dir,username,os.path.basename(sfile))
			dfile=os.path.join('/tmp/',tid)
			host=cheungssh_modul_controler.CheungSSHControler.convert_id_to_ip(sid)
			if not host["status"]:raise CheungSSHError(host['content'])
			_host_info=host['content']
			sftp=CheungSSHFileTransfer()
			login=sftp.login(**_host_info)
			print 676767
			if not login["status"]:
				print login["content"],"登录失败"
				raise CheungSSHError(login["content"])
			cheungssh_info=sftp.upload(sfile,dfile,"")
			sftp.logout()
			if not cheungssh_info["status"]:raise CheungSSHError(cheungssh_info["content"])
			cheungssh_info["dfile"]=dfile
			#####上传完毕，开始执行
			ssh=CheungSSH_SSH()
			login=ssh.login(**_host_info)
			if not login["status"]:raise CheungSSHError(login["content"])
			cheungssh_info=ssh.execute(dfile,ignore=True)
			ssh.logout()
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
