#!/usr/bin/env python
#coding:utf-8
assets_conf={
				"host_manufacturer":{
							"name":"制造商",
							"command":"/usr/sbin/dmidecode  -s system-manufacturer",
							"type":"string",
							"show":True,
						},
				"host_platform":{
							"name":"运行平台",
							"command":"/usr/sbin/dmidecode  -s system-product-name",
							"type":"string",
							"show":True,
						},
				"cpu_vendor":{
							"name":"CPU厂商",
							"command":"""awk  -F ': '  '/vendor_id/{print $2}' /proc/cpuinfo""",
							"type":"string",
							"show":True,
					},
				"cpu_name":{
							"name":"CPU名称",
							"command":"""awk  -F ': '  '/model name/{print $2}' /proc/cpuinfo""",
							"type":"string",
							"show":True,
					},
				"cpu_rate":{
							"name":"CPU频率",
							"command":"""awk  -F ': '  '/cpu.*Hz/{print $2}' /proc/cpuinfo""",
							"type":"number",
							"unit":"MHz",	#根据实际显示的单位显示
							"show":True,
					},
				"uuid":{
							"name":"UUID",
							"command":"""/usr/sbin/dmidecode  -s system-uuid""",
							"type":"string",
							"show":True,
					},
				"sn":{
							"name":"序列号",
							"command":"""/usr/sbin/dmidecode  -s system-serial-number""",
							"type":"string",
							"show":True,
					},
				"load":{
							"name":"CPU负载",
							"command":"""echo  'import os;print os.getloadavg()[0]'|python""",
							"type":"number",
							"show":True,
					},
				"os_name":{
							"name":"系统名字",
							"command":"""echo  'import platform;print platform.dist()[0]'|python""",
							"type":"string",
							"show":True,
					},
				"os_bit":{
							"name":"系统位数",
							"command":"""echo  'import platform;print platform.architecture()[0][:2],'|python""",
							"type":"number",
							"show":True,
					},
				"gcc_version":{
							"name":"GCC版本",
							"command":"""echo  'import platform;print platform.python_compiler().split()[1].replace(".","")'|python""",
							"type":"number",
							"show":True,
					},
				"python_version":{
							"name":"python版本",
							"command":"""echo  'import platform;print platform.python_version()[:3]'|python""",
							"type":"number",
							"show":True,
					},
				"cpu_count":{
							"name":"逻辑CPU",
							"command":"""grep  'processor'  /proc/cpuinfo |wc -l""",
							"type":"number",
							"unit":"核",
							"show":True,
					},
				"os_version":{
							"name":"系统版本",
							"command":"""echo  'import platform;print platform.dist()[1]'|python""",
							"type":"number",
							"show":True
					},
				"time":{
							"name":"日期",
							"command":"",
							"type":"date",
							"show":True,
					},
				}
	
