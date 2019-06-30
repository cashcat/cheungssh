#coding:utf8
#Author: 张其川
import os,sys,json,time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
sys.path.append('/home/cheungssh/mysite')
from django.core.cache import cache
REDIS=cache.master_client
from cheungssh_sshv2 import CheungSSH_SSH
from cheungssh_thread_queue import CheungSSHPool
from cheungssh_modul_controler import CheungSSHControler
from cheungssh_error import CheungSSHError
import threading
class CheungSSHBatchCommand(object):
	shell_list=[]#####存放登录成功的shell
	complete_num=[]
	servers=[]
	@staticmethod
	def request_connect(servers,rid):
		pool=CheungSSHPool()
		CheungSSHBatchCommand.servers=servers
		for sid in servers:
			pool.add_task(CheungSSHBatchCommand.login,{"sid":sid,"rid":rid})
		#####启动命令监听
		a=threading.Thread(target=CheungSSHBatchCommand.listen_command,args=(rid,))
		a.start()
		
	@staticmethod
	def login(sid="",rid=""):
		#####返回的数据格式{sid:{"content":"...","status":True/False}}
		cheungssh_info={"content":"","status":False}
		try:
			config=CheungSSHControler.convert_id_to_ip(sid)
			if not config["status"]:
				raise CheungSSHError(config["content"])
			_config=config["content"]
			ssh=CheungSSH_SSH()
			connect=ssh.login(**_config)
			if connect["status"]:
				CheungSSHBatchCommand.shell_list.append(ssh)#####没有的就不存，等要用的时候，找不到直接忽略不执行execute即可
				cheungssh_info={"content":"已就绪","status":True}
			else:
			
				cheungssh_info={"content":connect["content"],"status":False}
		except Exception,e:
			cheungssh_info={"content":str(e),"status":False}
		print cheungssh_info["content"]
		data={sid:cheungssh_info}
		data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		REDIS.rpush("rid.%s" % rid,data)#####前端根据在这里取走的个数判断这个的lenth长度来确定是否完成
		CheungSSHBatchCommand.complete_num.append(0)#####每完成一个追加一次
		
			
	@staticmethod
	def listen_command(rid):
		while not len(CheungSSHBatchCommand.complete_num)==len(CheungSSHBatchCommand.servers):
			time.sleep(0.5)
		batch_command_rid="batch-command-rid.%s" % rid
		batch_command_rid_check_live="batch-command-rid-check-live.%s" % rid
		timeout=12
		REDIS.set(batch_command_rid_check_live,0,timeout)
		while True:
			print 'wating recv...'
			time.sleep(0.2)
			if not REDIS.exists(batch_command_rid_check_live):
				break
			else:
				cmd=REDIS.lpop(batch_command_rid)
				if not cmd is None:
					print "有命令"
					pool=CheungSSHPool()
					for shell in CheungSSHBatchCommand.shell_list:
						pool.add_task(shell.execute,{"cmd":cmd,"tid":rid,"sid":shell.sid})
					pool.all_complete()
				else:
					print "没有命令"
					
	@staticmethod
	def recv_request_cmd(cmd,rid):
		batch_command_rid="batch-command-rid.%s" % rid
		REDIS.rpush(batch_command_rid,cmd)
		
		
