#coding:utf-8
import os
from django.core.cache import cache
keyfiledir="/home/cheungssh/keyfile/"
def key_resolv(keyid,cache=cache):
	keyfilelog=cache.get('keyfilelog')
	try:
		keyfile=keyfilelog[keyid]['filename']  #######数据格式是  { id: { name : ....}}
		keyfile=os.path.join(keyfiledir,keyfile)
	except Exception,e:
		return str(e)
	return keyfile
	
