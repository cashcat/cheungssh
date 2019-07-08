#coding:utf-8
from django.conf.urls import patterns, include, url
import mysite
urlpatterns = patterns('',
	url(r'^/$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),##########不采用缓存， 有的时候会发生redis的错误
	url(r'^$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),##########不采用缓存， 有的时候会发生redis的错误
	url(r'^cheungssh/$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),##########不采用缓存， 有的时候会发生redis的错误
	url(r'^cheungssh$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),##########不采用缓存， 有的时候会发生redis的错误
	url(r"^cheungssh/get_login_progress/$","mysite.cheungssh.cheungssh.get_login_progress"),
	url(r'^cheungssh/login/$','mysite.cheungssh.cheungssh.cheungssh_login'),
	url(r'^cheungssh/login_success_log/$','mysite.cheungssh.cheungssh.login_success_log'),
	url(r'^cheungssh/logout/$','mysite.cheungssh.cheungssh.cheungssh_logout'),
	########url(r'^cheungssh/test/$',mysite.cheungssh.cheungssh.test.as_view()), ########类视图
	url(r'^cheungssh/ssh_status/$','mysite.cheungssh.cheungssh.ssh_status'),
	url(r'^cheungssh/execute_command/$','mysite.cheungssh.cheungssh.execute_command'),
	url(r'^cheungssh/login_server_request/$','mysite.cheungssh.cheungssh.login_server_request'),
	url(r'^cheungssh/get_command_result/$','mysite.cheungssh.cheungssh.get_command_result'),
	url(r'^cheungssh/command_history/$','mysite.cheungssh.cheungssh.command_history'),#####命令操作日志
	url(r'^cheungssh/my_command_history/?$','mysite.cheungssh.cheungssh.my_command_history'),
	url(r'^cheungssh/upload/test/$','mysite.cheungssh.cheungssh.upload_file_test'),
	url(r'^cheungssh/get_my_file_list/$','mysite.cheungssh.cheungssh.get_my_file_list'),#####获取自己上传过的文件清单
	url(r'^cheungssh/pathsearch/$','mysite.cheungssh.cheungssh.pathsearch'),
	url(r'^cheungssh/config_del/$','mysite.cheungssh.cheungssh.config_del'),
	url(r'^cheungssh/config_add/$','mysite.cheungssh.cheungssh.config_add'),
	url(r'^cheungssh/config_modify/$','mysite.cheungssh.cheungssh.config_modify'),
	url(r'^cheungssh/load_servers_list/$','mysite.cheungssh.cheungssh.load_servers_list'),
	#url(r'^cheungssh/operationrecord/$','mysite.cheungssh.cheungssh.operation_record'),
	url(r'^cheungssh/add_black_command/$','mysite.cheungssh.cheungssh.add_black_command'),
	url(r'^cheungssh/del_black_command/$','mysite.cheungssh.cheungssh.del_black_command'),
	url(r'^cheungssh/list_black_command/$','mysite.cheungssh.cheungssh.list_black_command'),
	url(r'^cheungssh/showsignrecord/$','mysite.cheungssh.cheungssh.show_sign_record'),
	url(r'^cheungssh/getalluser/$','mysite.cheungssh.cheungssh.getalluser'),
	url(r"^cheungssh/setthreshold/$","mysite.cheungssh.cheungssh.set_threshold"),
	url(r"^cheungssh/showiplimit/$","mysite.cheungssh.cheungssh.show_ip_limit"),
	url(r"^cheungssh/showipthreshold/$","mysite.cheungssh.cheungssh.show_ip_threshold"),
	url(r"^cheungssh/deliplimit/$","mysite.cheungssh.cheungssh.del_ip_limit"),
	url(r"^cheungssh/modify_iplimit/$","mysite.cheungssh.cheungssh.modify_ip_limit"),#####设置安全登录阈值
	url(r'^cheungssh/updatefile/$',"mysite.cheungssh.cheungssh.up_file_content"),
	url(r"^cheungssh/catfilelist/$","mysite.cheungssh.cheungssh.catfilelist"),
	url(r"^cheungssh/setfilelist/$","mysite.cheungssh.cheungssh.setfilelist"),
	url(r"^cheungssh/whoami/","mysite.cheungssh.cheungssh.whoami"),
	url(r"^cheungssh/dashboard/","mysite.cheungssh.cheungssh.get_dashboard"),
	url(r"^cheungssh/execute_app/$","mysite.cheungssh.cheungssh.execute_app"),#######执行app
	url(r"^cheungssh/delete_app/$","mysite.cheungssh.cheungssh.delete_app"),#######删除app
	url(r"^cheungssh/create_app/$","mysite.cheungssh.cheungssh.create_app"),#######创建和修改APP
	url(r"^cheungssh/get_app_list/$","mysite.cheungssh.cheungssh.get_app_list"),#######获取app清单
	url(r"^cheungssh/custom_assets_class/$","mysite.cheungssh.cheungssh.custom_assets_class"),
	url(r"^cheungssh/custom_increate_asset/$","mysite.cheungssh.cheungssh.increate_asset"),
	url(r"^cheungssh/load_assets_list/$","mysite.cheungssh.cheungssh.load_assets_list"),
	url(r"^cheungssh/delete_assets/$","mysite.cheungssh.cheungssh.delete_asset_list"),
	url(r"^cheungssh/docker_images_list/$","mysite.cheungssh.cheungssh.docker_images_list"),
	#####url(r"^cheungssh/docker_images_history/$","mysite.cheungssh.cheungssh.docker_image_count"),######好像没用
	url(r"^cheungssh/docker_containers_list/$","mysite.cheungssh.cheungssh.docker_containers_list"),
	url(r"^cheungssh/docker_containers_history/$","mysite.cheungssh.cheungssh.docker_container_count"),
	url(r"^cheungssh/docker_container_start/$","mysite.cheungssh.cheungssh.docker_container_start"),
	url(r"^cheungssh/docker_container_progress/$","mysite.cheungssh.cheungssh.get_docker_container_progress"),
	url(r"^cheungssh/get_current_assets_data/$","mysite.cheungssh.cheungssh.get_current_assets_data"),
	url(r"^cheungssh/get_current_assets_data_export/$","mysite.cheungssh.cheungssh.get_current_assets_data_export"),
	url(r"^cheungssh/get_history_assets_data/$","mysite.cheungssh.cheungssh.get_history_assets_data"),
	url(r"^cheungssh/get_assets_conf/$","mysite.cheungssh.cheungssh.get_assets_conf"),
	url(r"^cheungssh/filetrans/upload/$","mysite.cheungssh.cheungssh.filetrans_upload"),
	url(r"^cheungssh/filetrans/download/$","mysite.cheungssh.cheungssh.remote_download"),
	url(r"^cheungssh/get_filetrans_progress/$","mysite.cheungssh.cheungssh.get_filetrans_progress"),
	url(r"^cheungssh/create_tgz_pack/$","mysite.cheungssh.cheungssh.create_tgz_pack"),
	url(r"^cheungssh/upload_script/$","mysite.cheungssh.cheungssh.upload_script"),
	url(r"^cheungssh/scripts_list/$","mysite.cheungssh.cheungssh.scripts_list"),
	url(r"^cheungssh/delete_script/$","mysite.cheungssh.cheungssh.delete_script"),
	url(r"^cheungssh/get_script_content/$","mysite.cheungssh.cheungssh.get_script_content"),
	url(r"^cheungssh/write_script_content/$","mysite.cheungssh.cheungssh.write_script_content"),
	url(r"^cheungssh/rewrite_script_content/$","mysite.cheungssh.cheungssh.rewrite_script_content"),
	#url(r"^cheungssh/delete_keyfile/$","mysite.cheungssh.cheungssh.delete_keyfile"),
	url(r"^cheungssh/init_script/$","mysite.cheungssh.cheungssh.init_script"),
	#url(r"^cheungssh/write_remote_file_opt/$","mysite.cheungssh.cheungssh.write_remote_file_opt"),
	url(r"^cheungssh/create_deployment_task/$","mysite.cheungssh.cheungssh.create_deployment_task"),
	url(r"^cheungssh/batch_create_deployment_task/$","mysite.cheungssh.cheungssh.batch_create_deployment_task"),
	url(r"^cheungssh/get_deployment_task/$","mysite.cheungssh.cheungssh.get_deployment_task"),
	url(r"^cheungssh/get_batch_deployment_task/$","mysite.cheungssh.cheungssh.get_batch_deployment_task"),
	url(r"^cheungssh/delete_deployment_task/$","mysite.cheungssh.cheungssh.delete_deployment_task"),
	url(r"^cheungssh/delete_batch_deployment_task/$","mysite.cheungssh.cheungssh.delete_batch_deployment_task"),
	url(r"^cheungssh/start_deployment_task/$","mysite.cheungssh.cheungssh.start_deployment_task"),
	url(r"^cheungssh/start_batch_deployment_task/","mysite.cheungssh.cheungssh.start_batch_deployment_task"),
	url(r"^cheungssh/get_deployment_progress/$","mysite.cheungssh.cheungssh.get_deployment_progress"),
	url(r"^cheungssh/batch_create_servers/$","mysite.cheungssh.cheungssh.batch_create_servers"),#####批量创建服务器
	url(r"^cheungssh/get_login_user_list/$","mysite.cheungssh.cheungssh.get_login_user_list"),#######获取登录用户
	url(r"^cheungssh/page_access_history/$","mysite.cheungssh.cheungssh.page_access_history"),#####页面访问记录
	url(r"^cheungssh/add_device/$","mysite.cheungssh.cheungssh.add_device"),#####添加网络设备
	url(r"^cheungssh/get_device/$","mysite.cheungssh.cheungssh.get_device"),#####获取网络设备
	url(r"^cheungssh/save_topology/$","mysite.cheungssh.cheungssh.save_topology"),#####保存网络拓扑
	url(r"^cheungssh/my_topology/$","mysite.cheungssh.cheungssh.my_topology"),#####保存网络拓扑
	url(r"^cheungssh/ssh/$","mysite.cheungssh.cheungssh.active_ssh"),#####单个执行命令
	url(r"^cheungssh/get_active_ssh_result/$","mysite.cheungssh.cheungssh.get_active_ssh_result"),#####单个执行命令
	url(r"^cheungssh/add_active_ssh_command/$","mysite.cheungssh.cheungssh.add_active_ssh_command"),#####添加单独执行命令
	#######计划任务
	url(r"^cheungssh/get_crontab_list/$","mysite.cheungssh.cheungssh.get_crontab_list"),#####访问计划任务列表
	url(r"^cheungssh/delete_crontab_list/$","mysite.cheungssh.cheungssh.delete_crontab_list"),######删除计划任务列表
	url(r"^cheungssh/modify_crontab_list/$","mysite.cheungssh.cheungssh.modify_crontab_list"),#####把计划任务保存到远程服务器
	url(r"^cheungssh/upload_analysis_logfile/$","mysite.cheungssh.cheungssh.upload_log_file"),#####上传分析日志文件
	url(r"^cheungssh/local_analysis_log/$","mysite.cheungssh.cheungssh.local_analysis_log"),#####分析日志
	url(r"^cheungssh/get_date_analysis_log/$","mysite.cheungssh.cheungssh.get_date_analysis_log"),#####获取日志文件的日期
	url(r"^cheungssh/add_remote_analysis_logfile/","mysite.cheungssh.cheungssh.add_remote_analysis_logfile"),#####创建访问远程日志分析路径
	url(r"^cheungssh/get_remote_analysis_logfile_info/","mysite.cheungssh.cheungssh.get_remote_analysis_logfile_info"),#####加载远程日志分析路径
	url(r"^cheungssh/delete_remote_analysis_logfile_info/","mysite.cheungssh.cheungssh.delete_remote_analysis_logfile_info"),#####删除远程日志分析路径
	url(r"^cheungssh/get_to_web_middleware_info/$","mysite.cheungssh.cheungssh.get_to_web_middleware_info"),#####获取中间件信息
	url(r"^cheungssh/get_os_type/$","mysite.cheungssh.cheungssh.get_os_type"),#####获取操作系统的固定类型
	url(r"^cheungssh/save_deployment_crontab/$","mysite.cheungssh.cheungssh.save_deployment_crontab"),#######保存部署计划
	url(r"^cheungssh/get_deployment_crontab_list/$","mysite.cheungssh.cheungssh.get_deployment_crontab"),######获取部署任务的计划任务表
	url(r"^cheungssh/delete_deployment_crontab/$","mysite.cheungssh.cheungssh.delete_deployment_crontab"),######删除部署任务的计划任务表
	url(r"^cheungssh/mark_ssh_as_active/$","mysite.cheungssh.cheungssh.mark_ssh_as_active"),
	#url(r"^cheungssh/break_command/$","mysite.cheungssh.cheungssh.break_command"),
	url(r"^cheungssh/get_scripts_historic_list/$","mysite.cheungssh.cheungssh.get_scripts_historic_list"),
	url(r"^cheungssh/set_script_active_version/$","mysite.cheungssh.cheungssh.set_script_active_version"),
	url(r"^cheungssh/get_script_historic_content/$","mysite.cheungssh.cheungssh.get_script_historic_content"),
	url(r"^cheungssh/get_script_historic_parameters/$","mysite.cheungssh.cheungssh.get_script_historic_parameters"),
	url(r"^cheungssh/change_executable_status/$","mysite.cheungssh.cheungssh.change_executable_status"),
	url(r"^cheungssh/get_server_groups/$","mysite.cheungssh.cheungssh.get_server_groups"),
	url(r"^cheungssh/get_script_parameter/$","mysite.cheungssh.cheungssh.get_script_parameter"),
	url(r"^cheungssh/get_script_init_progress/$","mysite.cheungssh.cheungssh.get_script_init_progress"),
	url(r"^cheungssh/get_server_alias/$","mysite.cheungssh.cheungssh.get_server_alias"),
	url(r"^cheungssh/get_remote_file_content/$","mysite.cheungssh.cheungssh.get_remote_file_content"), ##### 获取远程文件的内容
	url(r"^cheungssh/add_remote_file/$","mysite.cheungssh.cheungssh.add_remote_file_path"), ##### 添加远程文件路径
	url(r"^cheungssh/get_remote_file_list/$","mysite.cheungssh.cheungssh.get_remote_file_list"), ##### 获取远程文件列表
	url(r"^cheungssh/write_remote_file_content/$","mysite.cheungssh.cheungssh.write_remote_file_content"), 
	url(r"^cheungssh/get_remote_file_historic_list/$","mysite.cheungssh.cheungssh.get_remote_file_historic_list"), ###### 获取历史清单
	url(r"^cheungssh/enable_remote_file_history_version/$","mysite.cheungssh.cheungssh.enable_remote_file_history_version"), ##### 启用历史文件
	url(r"^cheungssh/get_remote_file_historic_content/$","mysite.cheungssh.cheungssh.get_remote_file_historic_content"),###### 取得历史版本文件的内容
	url(r"^cheungssh/change_file_permission/$","mysite.cheungssh.cheungssh.change_file_permission"),
	url(r"^cheungssh/delete_remote_file_list/$","mysite.cheungssh.cheungssh.delete_remote_file_list"),
	url(r"^cheungssh/save_batch_shell_configuration/$","mysite.cheungssh.cheungssh.save_batch_shell_configuration"),###### 保存批量命令配置
	url(r"^cheungssh/get_batch_shell_list/$","mysite.cheungssh.cheungssh.get_batch_shell_list"),###### 查看批量命令配置
	url(r"^cheungssh/del_batch_shell/$","mysite.cheungssh.cheungssh.del_batch_shell"),###### 删除批量命令配置
	##### 黑名单部分
	url(r"^cheungssh/save_black_list/$","mysite.cheungssh.cheungssh.save_black_list"),
	url(r"^cheungssh/get_black_list/$","mysite.cheungssh.cheungssh.get_black_list"),
	url(r"^cheungssh/del_black_list/$","mysite.cheungssh.cheungssh.del_black_list"),
	##### 黑名单组部分
	url(r"^cheungssh/save_black_list_group/$","mysite.cheungssh.cheungssh.save_black_list_group"),
	url(r"^cheungssh/get_black_list_group/$","mysite.cheungssh.cheungssh.get_black_list_group"),
	url(r"^cheungssh/del_black_list_group/$","mysite.cheungssh.cheungssh.del_black_list_group"),
	url(r"^cheungssh/get_user_and_black_list_group/$","mysite.cheungssh.cheungssh.get_user_and_black_list_group"),
	url(r"^cheungssh/save_user_with_black_list_group/$","mysite.cheungssh.cheungssh.save_user_with_black_list_group"),
	url(r"^cheungssh/get_user_with_black_list_group/$","mysite.cheungssh.cheungssh.get_user_with_black_list_group"),
	url(r"^cheungssh/del_user_with_black_list_group/$","mysite.cheungssh.cheungssh.del_user_with_black_list_group"),
	##### 业务操作部分
	url(r"^cheungssh/save_service_operation/$","mysite.cheungssh.cheungssh.save_service_operation"),
	url(r"^cheungssh/get_service_operation/$","mysite.cheungssh.cheungssh.get_service_operation"),
	url(r"^cheungssh/del_service_operation/$","mysite.cheungssh.cheungssh.del_service_operation"),
	url(r"^cheungssh/init_script_for_service_operation/$","mysite.cheungssh.cheungssh.init_script_for_service_operation"),
	)

