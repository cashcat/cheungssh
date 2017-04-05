#coding:utf-8
from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover() 
urlpatterns = patterns('',
	url(r'',include('mysite.cheungssh.urls')),
    	url(r'^cheungssh/admin/', include(admin.site.urls)),
    	url(r'^cheungssh/admin', 'mysite.cheungssh.cheungssh.redirect_admin'),
)
handler404="mysite.cheungssh.cheungssh.http404"
handler500="mysite.cheungssh.cheungssh.http500"
