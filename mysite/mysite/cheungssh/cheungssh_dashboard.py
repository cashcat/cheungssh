#!/usr/bin/env python
#coding:utf-8
import commands,re,os,time
class CheungSSHDashboard:
	def __init__(self):
		pass
	def collect(self):
		#####"""调用这里"""
		self.home_dashboard=self.set_commands()
		return self.home_dashboard
	def set_commands(self):
		self.commands={
				"io":"top  -d  1 -n 3 -b|awk  -F '[, %]' '/[0-9]+\.[0-9]+%wa,/{io=$18} END{print io}'",
				"cpu":"""top  -d  1 -n 3  -b|awk   -F '[, %]' '/^Cpu/{surplus=$14} END{printf  "%0.2f",100-surplus}'""",
				"load":"uptime|awk -F '[:,]' '{print $7}'",
				"mem":{"used":"free -m|awk '$1~/Mem/{surplus=$4+$5+$6+$7;total=$2} END{print total-surplus}' ","surplus":"free -m|awk '$1~/Mem/{surplus=$4+$5+$6+$7;print surplus}'"},
				"root_disk":{
						"used":"""df  |awk  '$NF=="/"{printf  ("%0.2f"), $3/1048576}'""",  #######单位GB
						"surplus":"""df  |awk  '$NF=="/"{printf  ("%0.2f"), $4/1048576}'"""
						
						}
				}
		self.results={}
		for section in self.commands.keys():
			if type(self.commands[section])==type({}):
				self.results[section]={}
				for t in self.commands[section].keys():
					_result=commands.getoutput(self.commands[section][t])
					self.results[section][t]=_result
			else:
				self.results[section]=commands.getoutput(self.commands[section])
		now_time=time.strftime("%Y-%m-%d %H:%M")
		_io_value=self.results["io"]
		_cpu_value=self.results["cpu"]
		self.results["io"]={}	#####重写数据结构，新增时间key
		self.results["cpu"]={}	#####重写数据结构，新增时间key
		self.results["io"]["time"]=now_time
		self.results["io"]["value"]=_io_value
		self.results["cpu"]["time"]=now_time
		self.results["cpu"]["value"]=_cpu_value
		return self.results
		
