#!/usr/bin/env python
#coding:utf-8
#Author: 张其川 CheungSSH
import json,os,sys,time,re,redis
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
import msgpack
#######以下需要在被管理机器上安装
class custom_assets(object):
	def __init__(self):
		##########设置存储自定义分类的名字，并且初始化存储的数据格式
		self.custom_assets_class_list='custom.assets.class.list'
		self.REDIS=cache.master_client
		if not self.REDIS.exists(self.custom_assets_class_list):
			self.set_assets_class({})   ######设置默认数据格式为dict,默认可以存储json，但是读取出来后是str
	def increate_asset_class(self,assets_list={}):
		source_list=self.get_assets_class()
		new_assets_list=dict(source_list,**assets_list) #########合并新旧资产分类
		self.set_assets_class(new_assets_list)
		######加入资产表头
		dynamic_assets=json.loads(self.REDIS.get("assets.conf"))
		dynamic_assets=dict(assets_list,**dynamic_assets)
		self.REDIS.set("assets.conf",json.dumps(dynamic_assets,encoding="utf8",ensure_ascii=False))
		return True
		
		######传递一个字典，字典直接组合,新增和修改为同一个接口，均获取页面当前值传递给后端
		##########新增分类
		###########定义前端传递的数据格式为字典，{ "ID1111":{"name":"电话","unit":"None","type":"string","value":"空" }  }  value由每一个服务器自己添加
	def delete_assets_class(self,assets_list=[]):
		########传递一个list [] ，后端逐个删除,asset_list，元素是ID
		source_list=self.get_assets_class()
		dynamic_assets=json.loads(self.REDIS.get("assets.conf"))
		for id in assets_list:	#######遍历全部的自定义资产分类
			try:
				try:
					del dynamic_assets[id]
					print "删除 成功"
				except Exception,e:
					print e,"删除失败"
					pass
				del source_list[id]	#######删除指定的自定义资产分类
			except KeyError:
				pass
		dynamic_assets=json.dumps(dynamic_assets,encoding="utf8",ensure_ascii=False)
		self.REDIS.set("assets.conf",dynamic_assets)
		self.set_assets_class(source_list)
		return True
	def get_assets_class(self):
		source_list=self.REDIS.get(self.custom_assets_class_list)
		source_list=msgpack.unpackb(source_list)	########反序列化为json
		return source_list ##########{}
	def set_assets_class(self,v):
		v=msgpack.packb(v)			#######序列化为二进制
		self.REDIS.set(self.custom_assets_class_list,v)
		return True
		
		
if __name__=='__main__':
	cheungssh=custom_assets()
	cheungssh.increate_assets_class({"地区":{"city":"广州","contry":"中国"}})
	#print cheungssh.get_assets_class()
	############动态生成的资产类，如果有command 的，就去调用cmd接口实现
