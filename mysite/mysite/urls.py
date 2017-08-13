#coding:utf-8
from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover() #####后台管理必须开启这里
urlpatterns = patterns('',
	url(r'',include('mysite.cheungssh.urls')),
    	url(r'^cheungssh/admin/', include(admin.site.urls)),
    	url(r'^cheungssh/admin', 'mysite.cheungssh.cheungssh.redirect_admin'),
)
handler404="mysite.cheungssh.cheungssh.http404"##########这个是404和 500的重定向， 只有在这里， 不能在app里面， 否则无法识别 ,同事需要开启settings.py的DEBUG=False 关闭调试模式才能有效果
handler500="mysite.cheungssh.cheungssh.http500"
