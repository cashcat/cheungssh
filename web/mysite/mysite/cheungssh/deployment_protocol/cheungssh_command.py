#!/usr/bin/env python
#coding:utf8
#Author:张其川
import os,sys,commands,json,re
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append("/home/cheungssh/mysite/mysite/cheungssh")
sys.path.append("/home/cheungssh/mysite")
from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_error import CheungSSHError
from cheungssh_sshv2 import CheungSSH_SSH
class CheungSSHCommand(CheungSSH_SSH):
	pass
