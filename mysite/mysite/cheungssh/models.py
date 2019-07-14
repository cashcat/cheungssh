#coding:utf-8
# Create your models here.
from django.db import models

class SoftwareList(models.Model):
	name =        models.CharField(max_length=888)
	script_name =        models.CharField(max_length=888)
	env =        models.CharField(max_length=888)
	create_time = models.CharField(max_length=888)
	description = models.CharField(max_length=888,default="",null=True)
	username =    models.CharField(max_length=888)
	class Meta:
		app_label = 'cheungssh'
	
class ServiceOperationList(models.Model):
	name = models.CharField(max_length=5800,null = True)
	create_time = models.CharField(max_length=200,null=False)
	description = models.CharField(max_length=200)
	list = models.TextField(max_length=20000)
	class Meta:
		app_label = 'cheungssh'

class UserWithBlackListGroup(models.Model):
	uid = models.IntegerField(max_length=58,null = True)
	black_list_group_id = models.CharField(max_length=5800,null = True)
	create_time = models.CharField(max_length=200,null=False)
	class Meta:
		app_label = 'cheungssh'
class BlackListList(models.Model):
	name = models.CharField(max_length=200,null=False)
	owner = models.CharField(max_length=200,null=False)
	create_time = models.CharField(max_length=200,null=False)
	expression = models.TextField(max_length=500000,)
	description = models.CharField(max_length=1600,null=True)
	class Meta:
		app_label = 'cheungssh'
	
class BlackListGroup(models.Model):
	name = models.CharField(max_length=200,null=False)
	list =  models.CharField(max_length=2000,null=False)
	owner = models.CharField(max_length=200,null=False)
	create_time = models.CharField(max_length=200,null=False)
	description = models.CharField(max_length=1600,null=True)
	default = models.CharField(max_length=10,null=False)
	class Meta:
		app_label = 'cheungssh'

class BatchShellList(models.Model):
	name = models.CharField(max_length=200,null=False)
	group = models.CharField(max_length=200,null=False)
	create_time = models.CharField(max_length=200,null=False)
	username = models.CharField(max_length=160,null=False)
	command = models.TextField(max_length=500000,default="'[]'")
	description = models.CharField(max_length=1600,null=False)
	parameters = models.CharField(max_length=1600,default = '[]')
	os_type = models.CharField(max_length=2000,default="'[]'")
	class Meta:
		app_label = 'cheungssh'

class RemoteFileHistoryVersion(models.Model):
	create_time = models.CharField(max_length=200,null=False)
	ip = models.CharField(max_length=16,null=False)
	username = models.CharField(max_length=160,null=False)
	path = models.CharField(max_length=160,null=False)
	remote_file_id = models.IntegerField(max_length=58,null = True)
	class Meta:
		app_label = 'cheungssh'

class RemoteFile(models.Model):
	path = models.CharField(max_length=2000,null=False)
	sid = models.IntegerField(max_length=58,null = False)
	tid = models.IntegerField(max_length=58,null = False)
	alias = models.CharField(max_length=200,null=False)
	description = models.CharField(max_length=160,null=False)
	class Meta:
		app_label = 'cheungssh'
	
class ScriptsHistoricVersion(models.Model):
	sid = models.IntegerField(max_length=5,null = False)
	path = models.CharField(max_length=2000,null=False)
	create_time = models.CharField(max_length=200,null=False)
	owner = models.CharField(max_length=20,null=False)
	active = models.BooleanField(null=False)
	parameters = models.TextField(max_length=50000,default="'[]'")
	version = models.CharField(max_length=50,null=False)
	comment = models.CharField(max_length=20,default="新建")
	class Meta:
		app_label = 'cheungssh'

class ScriptsList(models.Model):
	script_name = models.CharField(max_length=200)
	type = models.CharField(max_length=20,null=False)
	script_group = models.CharField(max_length=20)
	description = models.TextField(max_length=2000,default="")
	os_type = models.CharField(max_length=2000,default="'[]'")
	active_version = models.IntegerField(max_length=5,null=False)
	executable = models.BooleanField(default=False,null=False)
	class Meta:
		app_label = 'cheungssh'
class ServersList(models.Model):
	sudo_choices=( ("Y","使用sudo登陆"),("N","普通登陆")    )
	su_choices=( ("Y","su - root 登陆"),("N","普通登陆")    )
	ip=models.CharField(max_length=200)
	owner=models.CharField(max_length=100,null=True,blank="")
	hostname=models.CharField(max_length=100,null=True,blank="")
	port=models.IntegerField(max_length=5,default=22)
	group=models.CharField(max_length=200,null=False,verbose_name="主机组")   #######verbose_name 显示成中文
	username=models.CharField(max_length=20)
	alias=models.CharField(max_length=20)
	status=models.CharField(max_length=20)
	password=models.CharField(('password'),max_length=128)
	os_type=models.CharField(('os_type'),max_length=128)
	sudo=models.CharField(max_length=1,default="N")
	sudo_password=models.CharField(max_length=2000,null=True,default="")
	su=models.CharField(max_length=1,default="N")
	su_password=models.CharField(max_length=2000,null=True,default="")
	description=models.TextField(max_length=2000,null=True,default="")
	class Meta:
		app_label = 'cheungssh'
		permissions=(
				("create_server","创建服务器"),
				("modify_server","修改服务器"),			
				("delete_server","删除服务器"),			
				("execute_command","执行命令"),			
				("remote_file_upload","远程文件上传"),			
				("remote_file_download","远程文件下载"),			
				("delete_keyfile","秘钥删除"),			
				("create_script","创建和更新脚本"),			
				("show_script_content","查看脚本内容"),			
				("show_script_list","查看脚本清单"),			
				("execute_script","脚本执行"),			
				("command_history","命令历史"),			
				("access_history","访问记录"),			
				("login_success_history","登录记录"),			
				("command_black_create","命令黑名单添加"),			
				("command_black_list","命令黑名单查看"),			
				("command_black_delete","命令黑名单删除"),			
				("login_fail_list","登录失败清单"),
				("login_limit_set","登录阈值设置"),
				("unlock_ip","IP解锁"),
				("remote_file_admin_create","远程文件管理创建"),
				("remote_file_admin_list","远程文件管理列表"),
				("remote_file_admin_content_show","远程文件内容查看"),
				("remote_file_admin_content_update","远程文件内容更新"),
				("custom_assets_list","自定义资产项查看"),
				("custom_assets_create","自定义资产创建/修改"),
				("custom_assets_delete","自定义资产删除"),
				("assets_list","查看资产信息"),
				("view_app","查看App应用列表"),
				("create_app","创建和修改App应用"),
				("delete_app","删除App应用"),
				("execute_app","执行App应用"),
				("deployment_list","部署清单查看"),
				("deployment_create","创建/修改部署任务"),
				("deployment_delete","删除部署任务"),
				("deployment_progress","部署进度查看"),
				("deployment_execute","执行部署任务"),
				("docker_image_list","Docker镜像清单查看"),
				("docker_image_create","Docker镜像下载"),
				("docker_image_delete","Docker镜像删除"),
				("docker_containner_list","Docker容器清单查看"),
				("docker_create_containner","Docker创建容器"),
				("docker_containner_delete","Docker删除容器"),
				("docker_containner_start","Docker启动容器"),
				("docker_containner_stop","Dokcer关闭容器"),
				("docker_containner_save","Docker容器保存为镜像"),
				("create_device","创建网络设备节点"),
				("get_device","查看网络拓扑图"),
				("save_topology","保存拓扑布局"),
				("active_ssh","单独登录SSH"),
				("get_crontab_list","查看Linux计划任务列表"),
				("delete_crontab_list","删除Linux计划任务列表"),
				("create_or_modify_crontab","创建/修改Linux计划任务列表"),


			)
	def __unicode__(self):
		return self.ip
	


########from django.contrib.auth.models import User   #这个是用外键关联django自带的User表
"""class BBS(models.Model):
	title=models.CharField(max_length=64)
	summary=models.CharField(max_length=256,null=True,null=True) ####### 表里为空是null=True
	content=models.TextField()
	author=models.ForeignKey('BBS_user')
	view_count=models.IntegerField()
	ranking=models.IntegerField()
	created_at=models.DateTimeField()
	choices_show=(  ("N","不显示"),("Y","显示")  )
	show_is=models.CharField(max_length=2,choices=choices_show)
	def  __unicode__(self):
		return self.title  ########这里返回的字段多少咩有任何影响，在做前台显示的时候， 这个是没有影响的一样可以通过  [.字段名]的形式返回值
		####### 这里的return只是一个默认的字段而已， 在django中，可以用这个这样的方式访问该表里面的其他字段，比如 title.content
	class Admin:
		pass
class Gategory(models.Model):
	name=models.CharField(max_length=32,unique=True)  #######unique表示不重复
	administrator=models.ForeignKey('BBS_user')
class BBS_user(models.Model):
	#######user=models.CharField(max_length=20)
	user=models.OneToOneField(User)
	singnature=models.CharField(max_length=128,default="太懒了，什么都没写")
	photo=models.ImageField(upload_to="imgs",default="default.png")
	def __unicode__(self):
		return self.user.username
		return self.user #注意，下面这种返回方式是错误的，否则会遇到User Fond的错误"""

