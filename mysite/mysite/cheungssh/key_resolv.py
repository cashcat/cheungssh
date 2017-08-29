#coding:utf-8
import os
from django.core.cache import cache
keyfiledir="/home/cheungssh/keyfile/"
def key_resolv(keyid,cache=cache):
	keyfilelog=cache.get('keyfilelog')
	try:
		keyfile=keyfilelog[keyid]['filename']  
		keyfile=os.path.join(keyfiledir,keyfile)
	except Exception,e:
		return str(e)
	return keyfile
	
