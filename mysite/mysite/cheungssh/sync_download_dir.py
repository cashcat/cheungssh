import paramiko,os,sys
#coding:utf8
import os,sys
from stat import S_ISDIR
def cheungssh_sftp(ip,username,remotepath,localpath,port=22,loginmethod='KEY',password='',keyfile=''):
	t=paramiko.Transport((ip,int(port)))
	if loginmethod=='KEY':
		key=paramiko.RSAKey.from_private_key_file(keyfile)
		t.connect(username = 'root',pkey=key)
	else:
		t.connect(username = username,password = password)
	sftp = paramiko.SFTPClient.from_transport(t)
	remote_full_path_dir=[]
	remote_full_path_file=[]
	for a in find_dir_file(remotepath,sftp):
		for sd in a[1]:
			remote_full_path_dir.append(os.path.join(a[0],sd))
		for f in a[2]:
			remote_full_path_file.append(os.path.join(a[0],f))
	######创建本地目录
	if not remotepath.endswith('/'):remotepath+='/'
	if not localpath.endswith('/'):localpath+='/'
	for d in remote_full_path_dir:
		try:
			os.makedirs(d.replace(remotepath,localpath))
		except Exception,e:
			pass
	######下载文件
	for f in remote_full_path_file:
		local_full_path_file=f.replace(remotepath,localpath)
		try:
			#sftp.get(f,"%s.%s"%(local_full_path_file,ip))
			sftp.get(f,local_full_path_file)
		except Exception,e:
			print '下载发生错误',e
		
	
	
	
	
def find_dir_file(remotepath,sftp):
	files=[]
	folders=[] 
	for f in sftp.listdir_attr(remotepath):
		if S_ISDIR(f.st_mode):
			folders.append(f.filename)
		else:
			files.append(f.filename)
	yield remotepath,folders,files 
	for folder in folders:
		new_path=os.path.join(remotepath,folder)
		for x in find_dir_file(new_path,sftp):
			yield x 
if __name__=="__main__":
	cheungssh_sftp('localhost','root','/tmp','/test/',22,'KEY','','/root/.ssh/id_rsa')
