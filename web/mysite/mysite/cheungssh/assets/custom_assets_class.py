#!/usr/bin/env python
#coding:utf-8
#Author: 张其川 CheungSSH
import json,os,sys,time,re,redis
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
import msgpack

class custom_assets(object):
	def __init__(self):
		
		self.custom_assets_class_list='custom.assets.class.list'
		self.REDIS=cache.master_client
		if not self.REDIS.exists(self.custom_assets_class_list):
			self.set_assets_class({})   
	def increate_asset_class(self,assets_list={}):
		source_list=self.get_assets_class()
		new_assets_list=dict(source_list,**assets_list) 
		self.set_assets_class(new_assets_list)
		
		dynamic_assets=json.loads(self.REDIS.get("assets.conf"))
		dynamic_assets=dict(assets_list,**dynamic_assets)
		self.REDIS.set("assets.conf",json.dumps(dynamic_assets,encoding="utf8",ensure_ascii=False))
		return True
		
		
		
		
	def delete_assets_class(self,assets_list=[]):
		
		source_list=self.get_assets_class()
		dynamic_assets=json.loads(self.REDIS.get("assets.conf"))
		for id in assets_list:	
			try:
				try:
					del dynamic_assets[id]
					print "删除 成功"
				except Exception,e:
					print e,"删除失败"
					pass
				del source_list[id]	
			except KeyError:
				pass
		dynamic_assets=json.dumps(dynamic_assets,encoding="utf8",ensure_ascii=False)
		self.REDIS.set("assets.conf",dynamic_assets)
		self.set_assets_class(source_list)
		return True
	def get_assets_class(self):
		source_list=self.REDIS.get(self.custom_assets_class_list)
		source_list=msgpack.unpackb(source_list)	
		return source_list 
	def set_assets_class(self,v):
		v=msgpack.packb(v)			
		self.REDIS.set(self.custom_assets_class_list,v)
		return True
		
		
if __name__=='__main__':
	cheungssh=custom_assets()
	cheungssh.increate_assets_class({"地区":{"city":"广州","contry":"中国"}})
	#print cheungssh.get_assets_class()
	
