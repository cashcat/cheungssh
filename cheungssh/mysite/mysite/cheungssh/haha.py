import paramiko,os,sys
files=[]
folders=[] 
for f in self.sftp.listdir_attr('/tmp/'):
	if S_ISDIR(f.st_mode):
		folders.append(f.filename)
	else:
		files.append(f.filename)
print path,folders,files
