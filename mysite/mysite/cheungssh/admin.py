#coding:utf-8
from django.contrib import admin
from mysite.cheungssh.models import *   ########导出数据库表


#####class ServerConf_admin(admin.ModelAdmin):   #########这个实在admin页面显示的
#####	list_display=('IP','Port','Group','Username','Password','Su')
#####class ServerInfo_admin(admin.ModelAdmin):
#####	list_display=('IP','Description',)
#####admin.site.register(ServerConf,ServerConf_admin) 
#####admin.site.register(ServerInfo,ServerInfo_admin)
