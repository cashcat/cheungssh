#!/usr/bin/python
#coding:utf8
import os,sys
reload(sys)
sys.setdefaultencoding('utf8')
from redis_to_redis import set_redis_data
import socket,json
def sendinfo(info):
	try:
		s=socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
		s.connect(('localhost',1337))
		s.settimeout(1200)
		s.sendall(info)
		print '消息发送成功'
	except Exception,e:
		#print "无法发送消息",e
		print '消息发送失败',e
	finally:
		s.close()
if __name__=='__main__':
	try:
		info=json.dumps(sys.argv[1],encoding='utf8',ensure_ascii=False)
	except:
		print "使用方法: %s '您要发送的消息'"%sys.argv[0]
		sys.exit(1)
	info="""{"all":%s}"""%info
	print info
	sendinfo(info)
