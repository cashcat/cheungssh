#!/usr/bin/env python
#coding:utf-8
import threading
class CheungSSHConnector(object):
	shell={}  
	sftp={}
	cond=threading.Condition()
	logs={}  
	progress={}
	client={} 
