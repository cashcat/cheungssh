#!/usr/bin/env python
#coding:utf-8
#作者:张其川
#总设计师: 张其川
from custom_assets_class import custom_assets
class AssetAdmin(object):
	def __init__(self):
		self.custom_assets=custom_assets()
	def get_custom_asset(self):
		cheungssh_info={"status":False,"content":""}
		try:
			cheungssh_info["content"]=self.custom_assets.get_assets_class()
			cheungssh_info["status"]=True
		except Exception,e:
			cheungssh_info["status"]=False
			cheungssh_info["content"]=str(e)
		return cheungssh_info
		
if __name__ =='__main__':
	A=AssetAdmin()
	a=A.get_custom_asset()
	content=a["content"]
	print content


