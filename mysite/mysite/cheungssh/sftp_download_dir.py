import paramiko,os,sys
#coding:utf8
import os,sys,functools,time
from stat import S_ISDIR
def cheungssh_sftp(fid,ip,username,remotepath,localpath,set_progres,port=22,loginmethod='KEY',password='',keyfile=''):
	###########print '目录',remotepath,localpath
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
			l_d=d.replace(remotepath,localpath)
			os.makedirs(l_d)
		except Exception,e:
			pass
	#########print '开始判断...'
	if not os.path.isdir(localpath):
		#########print '创建本地'
		try:
			os.mkdir(localpath)
			##########print '已经创建'
		except Exception,e:
			########print '创建发生错误。。。',e
			raise IOError(e)
	##################print '本地目录存在，开始'
	######下载文件
	ifile=0
	all_file_num=len(remote_full_path_file)
	for f in remote_full_path_file:
		ifile+=1
		local_full_path_file=f.replace(remotepath,localpath)
		callback_info = functools.partial(set_progres,fid,all_file_num,ifile,True)
		try:
			sftp.get(f,"%s.%s"%(local_full_path_file,ip),callback=callback_info)
		except Exception,e:
			print '下载发生错误',e
	if not remote_full_path_file:set_progres(fid,1,1,True,1,1)
		
	
	
	
	
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
	cheungssh_sftp(1,'localhost','root','/tmp','/test/',22,'KEY','','/root/.ssh/id_rsa')
