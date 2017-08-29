#!/usr/bin/evn python
#coding:utf-8
import json
from models import ServerConf
from django.core.cache import cache
def db_to_redis(id):
	Data=ServerConf.objects.all()
 	hostinfo={"status":"host","content":[]}
	for a in Data:
		if not str(a.id)==str(id):
			continue
		t_host={
			"id":a.id,
			"ip":a.IP,
			"group":a.Group,
			"port":a.Port,
			"username":a.Username,
			"password":a.Password,
			"keyfile":a.KeyFile, 
			"sudo":a.Sudo,
			"sudopassword":a.SudoPassword,
			"su":a.Su,
			"supassword":a.SuPassword,
			"loginmethod":a.LoginMethod,
			}
		try:
			cache.set("host:%s"% (a.id),t_host,3600000)
			return t_host
		except Exception,e:
			return False
	return False
	
	
