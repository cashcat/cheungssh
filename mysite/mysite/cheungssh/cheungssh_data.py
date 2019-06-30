#!/usr/bin/env python
#coding:utf-8
import threading
class CheungSSHConnector(object):
	shell={}  ########存储每个服务器的连接ssh ,{"sid":ssh}
	sftp={}
	cond=threading.Condition()
	logs={}  #######log_tid_sid
	progress={}
	client={} ######{tid:"",}
