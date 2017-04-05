#!/usr/bin/env python
#coding:utf-8
#Author:张其川
import re
import libxml2
import dmidecode
class HardWare(object):
	def __init__(self):
		self.result={
				"host_manufacturer":{
							"name":"主机制造商",
							"value":"",
							"type":"string",
						},
				"host_platform":{
							"name":"主机平台",
							"value":"",
							"type":"string",
						},
				"cpu_vendor":{
							"name":"CPU制造商",
							"value":"",
							"type":"string",
					},
				"cpu_name":{
							"name":"CPU名称",
							"value":"",
							"type":"string",
					},
				"cpu_rate":{
							"name":"CPU频率",
							"value":"",
							"type":"number",
							"unit":"",	#根据实际显示的单位显示
					},
				"uuid":{
							"name":"UUID",
							"value":"",
							"type":"string",
					},
				"sn":{
							"name":"SN序列号",
							"value":"",
							"type":"string",
					},
				}
		pass
	def get_host(self):
		info=dmidecode.system()
		info_keys=info.keys()
		for i in range(len(info_keys)):
			   if info[info_keys[i]]['dmi_type'] == 1 :
				self.result["host_manufacturer"]["value"]=info[info_keys[i]]['data']['Manufacturer']
				self.result["host_platform"]["value"]=info[info_keys[i]]['data']['Product Name']
				self.result["uuid"]["value"]=info[info_keys[i]]['data']['UUID']
				self.result["sn"]["value"]=info[info_keys[i]]['data']['Serial Number']
	def get_cpu(self):
		with open('/proc/cpuinfo') as f:
			info=f.readlines()
		for _line in info:
			line=_line.strip()
			tmp=line.split(":")
			if re.search("vendor_id",tmp[0]):
				self.result['cpu_vendor']["value"]=tmp[1].strip(' ')
			if re.search("model name",tmp[0]):
				self.result['cpu_name']["value"]=tmp[1].strip(' ')
			if re.search("cpu.*Hz",tmp[0]):
				self.result['cpu_rate']["value"]=tmp[1].strip(' ')
				self.result['cpu_rate']["unit"]=tmp[0].split()[1].strip(' ')
	def run(self):
		self.get_host()
		self.get_cpu()
		return self.result
				
			
			
				
			
if __name__=='__main__'	:
	a=HardWare()
	print a.run()
