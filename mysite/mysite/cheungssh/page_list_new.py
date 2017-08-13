#coding:utf-8


def pagelist(request,datalist):#############传入request和一个数据list
	info={"status":False}
	username=request.user.username
	pagenum=request.GET.get('pagenum')
	pagesize=request.GET.get('pagesize')
	try:
		if not  type([])==type(datalist):raise IOError("Redis数据格式错误")
		if  datalist:
			pagenum=int(pagenum)  #####传入要查看的页数
			pagesize=int(pagesize)  #####传入要查看的每页数量，每次的数量必须一样， 否则乱套
			endpage=pagesize*pagenum+1
			if pagenum==1:
				startpage=pagesize*(pagenum-1) #####如果是首页，就不用删除重复的，否则需要删除重复的
				endpage=pagesize*pagenum
			else:
				endpage=pagesize*pagenum+1   #####
				startpage=pagesize*(pagenum-1)+1  #####查询光标往后移动一个单位， 否则跟前面的重复了而一次
			############
			datalist_all=[]######符合权限的所有记录
			for t in datalist:  #######分离所属用户
				try:
					t=eval(t)###############有些情况t是一个string
				except Exception,e:
					pass
				Tusername=''##########有的可能是user，有的是username
				if t.has_key('user'):
					Tusername='user'
				else:
					Tusername='username'
				if username==t[Tusername] or request.user.is_superuser:  #######普通用户只能看自己的登录记录
					datalist_all.append(t)
			########返回查询的部分结果
			datalist_sub=datalist_all[startpage:endpage]
			#datalist_all.reverse()#########反转排序， 是对读取的所有数据进行排序， 不是对redis中的数据进行排序， 应为redis是单个数据， 不是一个集合
			info['content']=datalist_sub
			totalnum=len(datalist_all)
		else:
			totalnum=0
		info["totalnum"]=totalnum
		info["status"]=True
	except Exception,e:
		info["content"]=str(e)
	return info
