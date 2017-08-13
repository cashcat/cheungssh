#!/usr/bin/env python
#coding:utf-8

class AutoGetThreadNum:
	def __init__(self):
		
		self.cpu=100
		self.thread=5
	def auto_thread(self):
		if self.cpu>90:
			self.thread=200
		elif self.cpu>80:
			self.thread=150
		elif self.cpu>70:
			self.thread=100
		elif self.cpu>60: 
			self.thread=50
		elif self.cpu>50:
			self.thread=40
		elif self.cpu>30:
			self.thread=20
		elif self.cpu>20:
			self.thread=5
		return self.thread
