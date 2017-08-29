#!/usr/bin/env python
#coding:utf8
#Author:张其川
import os
from cheungssh_error import CheungSSHError
class FileAdmin(object):
	def __init__(self):
		pass
	@staticmethod
	def get_content(file):
		cheungssh_info={"content":"","status":False}
		try:
			with open(file.encode("utf8")) as f:
				content=f.readlines()
			content="".join(content)
			cheungssh_info["status"]=True
			cheungssh_info["content"]=content
		except IOError:
			cheungssh_info["content"]="指定的文件不存在！"
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info

		
