#coding:utf-8
import json
from django.core.cache import cache
from django.http import HttpResponse
def page_list(request,keyrecord):  ######keyrecord是一个[{}]
        username=request.user.username
        info={'status':'True','content':[]}
        callback=request.GET.get('callback')
        pagenum=request.GET.get('pagenum')
        pagesize=request.GET.get('pagesize')
        key_list=cache.get(keyrecord)
        if  key_list:
                """pagenum=int(pagenum)  #####传入要查看的页数
                pagesize=int(pagesize)  #####传入要查看的每页数量，每次的数量必须一样， 否则乱套
                endpage=pagesize*pagenum+1
                if pagenum==1:
                        startpage=pagesize*(pagenum-1) #####如果是首页，就不用删除重复的，否则需要删除重复的
                        endpage=pagesize*pagenum
                else:
                        endpage=pagesize*pagenum+1   #####
                        startpage=pagesize*(pagenum-1)+1  #####查询光标往后移动一个单位， 否则跟前面的重复了而一次"""
                key_list_all=[]
                for t in key_list:  #######分离所属用户
                        if username==t["owner"] or request.user.is_superuser:
                                key_list_all.append(t)
                #info['content']=key_list_all[startpage:endpage]
                info['content']=key_list_all
                totalnum=len(key_list_all)
        else:
                totalnum=0
        #info['totalnum']=totalnum
        info=json.dumps(info,encoding='utf-8',ensure_ascii=False)
        if callback is None:
                info=info
        else:
                info="%s(%s)"  % (callback,info)
        return HttpResponse(info)
