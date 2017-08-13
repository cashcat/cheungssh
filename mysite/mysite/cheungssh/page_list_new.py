#coding:utf-8


def pagelist(request,datalist):
	info={"status":False}
	username=request.user.username
	pagenum=request.GET.get('pagenum')
	pagesize=request.GET.get('pagesize')
	try:
		if not  type([])==type(datalist):raise IOError("Redis数据格式错误")
		if  datalist:
			pagenum=int(pagenum)  
			pagesize=int(pagesize)  
			endpage=pagesize*pagenum+1
			if pagenum==1:
				startpage=pagesize*(pagenum-1) 
				endpage=pagesize*pagenum
			else:
				endpage=pagesize*pagenum+1   
				startpage=pagesize*(pagenum-1)+1  
			
			datalist_all=[]
			for t in datalist:  
				try:
					t=eval(t)
				except Exception,e:
					pass
				Tusername=''
				if t.has_key('user'):
					Tusername='user'
				else:
					Tusername='username'
				if username==t[Tusername] or request.user.is_superuser:  
					datalist_all.append(t)
			
			datalist_sub=datalist_all[startpage:endpage]
			#datalist_all.reverse()
			info['content']=datalist_sub
			totalnum=len(datalist_all)
		else:
			totalnum=0
		info["totalnum"]=totalnum
		info["status"]=True
	except Exception,e:
		info["content"]=str(e)
	return info
