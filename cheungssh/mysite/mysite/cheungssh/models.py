#coding:utf-8
# Create your models here.
from django.db import models


class Main_Conf(models.Model):
	runmod_choices=(("M","多线程"),("S","单线程"))
	RunMode=models.CharField(max_length=1,choices=runmod_choices)
	TimeOut=models.IntegerField(max_length=5)
class ServerConf(models.Model):
	sudo_choices=( ("Y","使用sudo登陆"),("N","普通登陆")    )
	su_choices=( ("Y","su - root 登陆"),("N","普通登陆")    )
	login_type=(   ("KEY","使用PublickKey登陆"),("PASSWORD","使用密码登陆")  )
	IP=models.CharField(max_length=200)
	HostName=models.CharField(max_length=100,null=False,blank=False)
	Port=models.IntegerField(max_length=5)
	Group=models.CharField(max_length=200,null=False,verbose_name="主机组")   
	Username=models.CharField(max_length=200,null=False)
	Password=models.CharField(('password'),max_length=128)
	KeyFile=models.CharField(max_length=100,default="N")
	Sudo=models.CharField(max_length=1,choices=sudo_choices,default="N")
	SudoPassword=models.CharField(max_length=2000,null=True,blank=True)
	Su=models.CharField(max_length=1,choices=su_choices,null=True,blank=True,default="N")
	SuPassword=models.CharField(max_length=2000,null=True,blank=True,default="N")
	LoginMethod=models.CharField(max_length=10,choices=login_type,null=True,blank=True,default="N")
	class Meta:
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
		return self.IP
	
class ServerInfo(models.Model):
	IP=models.OneToOneField(ServerConf)  
	Position=models.TextField(null=True,blank=True)
	Description=models.TextField(null=True,blank=True,default="请在这里写一个对服务器的描述")
	CPU=models.CharField(max_length=20,default="暂无",null=True,blank=True)
	CPU_process_must=models.CharField(max_length=10,default="暂无",null=True,blank=True)
	MEM_process_must=models.CharField(max_length=10,default="暂无",null=True,blank=True)
	Use_CPU=models.CharField(max_length=20,default="暂无",null=True,blank=True)
	uSE_MEM=models.CharField(max_length=20,default="暂无",null=True,blank=True)
	MEM=models.CharField(max_length=20,default="暂无",null=True,blank=True)
	IO=models.CharField(max_length=200,default="暂无",null=True,blank=True)
	Platform=models.CharField(max_length=200,default="暂无",blank=True)
	System=models.CharField(max_length=200,default="暂无",blank=True)
	InBankWidth=models.IntegerField(max_length=20,null=True,blank=True)
	OutBankWidth=models.IntegerField(max_length=20,null=True,blank=True)
	CurrentUser=models.IntegerField(max_length=10,null=True,blank=True)
	def __unicode__(self):
		return self.Position
	
	
	
	





"""class BBS(models.Model):
	title=models.CharField(max_length=64)
	summary=models.CharField(max_length=256,null=True,null=True) 
	content=models.TextField()
	author=models.ForeignKey('BBS_user')
	view_count=models.IntegerField()
	ranking=models.IntegerField()
	created_at=models.DateTimeField()
	choices_show=(  ("N","不显示"),("Y","显示")  )
	show_is=models.CharField(max_length=2,choices=choices_show)
	def  __unicode__(self):
		return self.title  
		
	class Admin:
		pass
class Gategory(models.Model):
	name=models.CharField(max_length=32,unique=True)  
	administrator=models.ForeignKey('BBS_user')
class BBS_user(models.Model):
	
	user=models.OneToOneField(User)
	singnature=models.CharField(max_length=128,default="太懒了，什么都没写")
	photo=models.ImageField(upload_to="imgs",default="default.png")
	def __unicode__(self):
		return self.user.username
		return self.user #注意，下面这种返回方式是错误的，否则会遇到User Fond的错误"""

