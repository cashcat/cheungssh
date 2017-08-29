#/usr/bin/python
#coding:utf8
import os,sys,paramiko
import functools
def UploadFile(sdir,ddir,username,password,ip,loginmethod,keyfile,fid,set_progres,port=22,force=True):
	info={'status':True}
	if not ddir.endswith('/'):
		ddir=ddir+"/"
	if not sdir.endswith('/'):
		sdir=sdir+"/"
	if not os.path.isdir(sdir):
		return False,"Local Directory not exists"
	try:
		t=paramiko.Transport((ip,int(port)))
		if loginmethod=="key".upper():
			keyfile=keyfile
			key=paramiko.RSAKey.from_private_key_file(keyfile)
			t.connect(username = username,pkey=key)
		else:
			t.connect(username = username,password = password)
		sftp = paramiko.SFTPClient.from_transport(t)
		try:
			sftp.stat(ddir)
		except Exception,e:
			if e.errno==2 and not force:
				print '-False','远程目录不存在'
				return False,"Remote directory not  exists"
		all_dirs=[]
		all_files=[]
		remote_all_dirs=[]
		for root,dirs,files in os.walk(sdir):
			for dir in dirs:
				local_full_dir=os.path.join(root,dir)
				all_dirs.append(local_full_dir)
				local_sub_dir=local_full_dir.split(sdir)[1]
				remote_full_dir=os.path.join(ddir,local_sub_dir)
				i=1;c=remote_full_dir.split('/')[1:]
				for d in c:
					remote_and_local_dir="/"+'/'.join(c[:i])
					remote_all_dirs.append(remote_and_local_dir)
					i+=1
					try:
						sftp.stat(remote_and_local_dir)
					except Exception,e:
						if e.errno==2:
							sftp.mkdir(remote_and_local_dir)
						else:
							print '-False'
							return False,e
			for file in files:
				local_full_file=os.path.join(root,file)
				all_files.append(local_full_file)
				"""new_remote_full_file=local_full_file.replace(sdir,ddir)
				try:
					sftp.put(local_full_file,new_remote_full_file)
				except Exception,e:
					print '-False'
					return False,e"""
		all_file_num=len(all_files)
		ifile=1
		for local_full_file in all_files:
			new_remote_full_file=local_full_file.replace(sdir,ddir)
			try:
				callback_info = functools.partial(set_progres,fid,all_file_num,ifile,True)
				print 11111111111111111111111111111111111111111
				sftp.put(local_full_file,new_remote_full_file,callback=callback_info)
			except Exception,e:
				print '-False错误aaaaaaaaaaaaaaaaaaaaaa',e
				return False,e
			
			ifile+=1
		print "+True文件传输结束"
		if not all_files:set_progres(fid,1,1,True,1,1)
		return True,"+True"
	except Exception,e:
		print '发生错误',e
		return False,e
def DownloadFile(sdir,ddir,username,password,ip,loginmethod,keyfile,fid,set_progres,port=22,force=True):
	info={'status':True}
	if not ddir.endswith('/'):
		ddir=ddir+"/"
	if not sdir.endswith('/'):
		sdir=sdir+"/"
	if not os.path.isdir(sdir):
		return False,"Remote Directory not exists"
	try:
		t=paramiko.Transport((ip,int(port)))
		if loginmethod=="key".upper():
			keyfile=keyfile
			key=paramiko.RSAKey.from_private_key_file(keyfile)
			t.connect(username = username,pkey=key)
		else:
			t.connect(username = username,password = password)
		sftp = paramiko.SFTPClient.from_transport(t)
		try:
			sftp.stat(sdir)
		except Exception,e:
			if e.errno==2 and not force:
				print '-False','远程目录不存在'
				return False,"Remote directory not  exists"
		all_dirs=[]
		all_files=[]
		remote_all_dirs=[]
		for root,dirs,files in os.walk(sdir):
			for dir in dirs:
				local_full_dir=os.path.join(root,dir)
				all_dirs.append(local_full_dir)
				local_sub_dir=local_full_dir.split(sdir)[1]
				remote_full_dir=os.path.join(ddir,local_sub_dir)
				i=1;c=remote_full_dir.split('/')[1:]
				for d in c:
					remote_and_local_dir="/"+'/'.join(c[:i])
					remote_all_dirs.append(remote_and_local_dir)
					i+=1
					try:
						sftp.stat(remote_and_local_dir)
					except Exception,e:
						if e.errno==2:
							sftp.mkdir(remote_and_local_dir)
						else:
							print '-False'
							return False,e
			for file in files:
				local_full_file=os.path.join(root,file)
				all_files.append(local_full_file)
				"""new_remote_full_file=local_full_file.replace(sdir,ddir)
				try:
					sftp.put(local_full_file,new_remote_full_file)
				except Exception,e:
					print '-False'
					return False,e"""
		all_file_num=len(all_files)
		ifile=1
		for local_full_file in all_files:
			new_remote_full_file=local_full_file.replace(sdir,ddir)
			try:
				callback_info = functools.partial(set_progres,fid,all_file_num,ifile,True)
				print 11111111111111111111111111111111111111111
				sftp.put(local_full_file,new_remote_full_file,callback=callback_info)
			except Exception,e:
				print '-False错误aaaaaaaaaaaaaaaaaaaaaa',e
				return False,e
			
			ifile+=1
		print "+True文件传输结束"
		if not all_files:set_progres(fid,1,1,True,1,1)
		return True,"+True"
	except Exception,e:
		print '发生错误',e
		return False,e
