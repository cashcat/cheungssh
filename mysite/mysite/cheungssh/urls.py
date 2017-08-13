#coding:utf-8
from django.conf.urls import patterns, include, url
import mysite
urlpatterns = patterns('',
	url(r'^/$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),
	url(r'^$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),
	url(r'^cheungssh/$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),
	url(r'^cheungssh$',"mysite.cheungssh.cheungssh.cheungssh_redirect"),
	url(r'^cheungssh/login/$','mysite.cheungssh.cheungssh.cheungssh_login'),
	url(r'^cheungssh/login_success_log/$','mysite.cheungssh.cheungssh.login_success_log'),
	url(r'^cheungssh/logout/$','mysite.cheungssh.cheungssh.cheungssh_logout'),
	
	url(r'^cheungssh/ssh_status/$','mysite.cheungssh.cheungssh.ssh_status'),
	url(r'^cheungssh/ssh_check/$','mysite.cheungssh.cheungssh.ssh_check'),
	url(r'^cheungssh/execute_command/$','mysite.cheungssh.cheungssh.execute_command'),
	url(r'^cheungssh/get_command_result/$','mysite.cheungssh.cheungssh.get_command_result'),
	url(r'^cheungssh/command_history/$','mysite.cheungssh.cheungssh.command_history'),
	url(r'^cheungssh/my_command_history/?$','mysite.cheungssh.cheungssh.my_command_history'),
	url(r'^cheungssh/upload/test/$','mysite.cheungssh.cheungssh.upload_file_test'),
	url(r'^cheungssh/get_my_file_list/$','mysite.cheungssh.cheungssh.get_my_file_list'),
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
	url(r"^cheungssh/modify_iplimit/$","mysite.cheungssh.cheungssh.modify_ip_limit"),
	url(r'^cheungssh/updatefile/$',"mysite.cheungssh.cheungssh.up_file_content"),
	url(r"^cheungssh/catfilelist/$","mysite.cheungssh.cheungssh.catfilelist"),
	url(r"^cheungssh/setfilelist/$","mysite.cheungssh.cheungssh.setfilelist"),
	url(r"^cheungssh/whoami/","mysite.cheungssh.cheungssh.whoami"),
	url(r"^cheungssh/dashboard/","mysite.cheungssh.cheungssh.get_dashboard"),
	url(r"^cheungssh/execute_app/$","mysite.cheungssh.cheungssh.execute_app"),
	url(r"^cheungssh/delete_app/$","mysite.cheungssh.cheungssh.delete_app"),
	url(r"^cheungssh/create_app/$","mysite.cheungssh.cheungssh.create_app"),
	url(r"^cheungssh/get_app_list/$","mysite.cheungssh.cheungssh.get_app_list"),
	url(r"^cheungssh/custom_assets_class/$","mysite.cheungssh.cheungssh.custom_assets_class"),
	url(r"^cheungssh/custom_increate_asset/$","mysite.cheungssh.cheungssh.increate_asset"),
	url(r"^cheungssh/load_assets_list/$","mysite.cheungssh.cheungssh.load_assets_list"),
	url(r"^cheungssh/delete_assets/$","mysite.cheungssh.cheungssh.delete_asset_list"),
	url(r"^cheungssh/docker_images_list/$","mysite.cheungssh.cheungssh.docker_images_list"),
	
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
	url(r"^cheungssh/upload_keyfile/$","mysite.cheungssh.cheungssh.upload_keyfile"),
	url(r"^cheungssh/upload_script/$","mysite.cheungssh.cheungssh.upload_script"),
	url(r"^cheungssh/scripts_list/$","mysite.cheungssh.cheungssh.scripts_list"),
	url(r"^cheungssh/show_keyfile_list/$","mysite.cheungssh.cheungssh.show_keyfile_list"),
	url(r"^cheungssh/delete_script/$","mysite.cheungssh.cheungssh.delete_script"),
	url(r"^cheungssh/get_script_content/$","mysite.cheungssh.cheungssh.get_script_content"),
	url(r"^cheungssh/write_script_content/$","mysite.cheungssh.cheungssh.write_script_content"),
	url(r"^cheungssh/delete_keyfile/$","mysite.cheungssh.cheungssh.delete_keyfile"),
	url(r"^cheungssh/script_init/$","mysite.cheungssh.cheungssh.script_init"),
	url(r"^cheungssh/add_remote_file/$","mysite.cheungssh.cheungssh.add_remote_file"),
	url(r"^cheungssh/get_remote_file_list/$","mysite.cheungssh.cheungssh.get_remote_file_list"),
	url(r"^cheungssh/delete_remote_file_list/$","mysite.cheungssh.cheungssh.delete_remote_file_list"),
	url(r"^cheungssh/get_remote_file_opt/$","mysite.cheungssh.cheungssh.get_remote_file_opt"),
	url(r"^cheungssh/write_remote_file_opt/$","mysite.cheungssh.cheungssh.write_remote_file_opt"),
	url(r"^cheungssh/create_deployment_task/$","mysite.cheungssh.cheungssh.create_deployment_task"),
	url(r"^cheungssh/get_deployment_task/$","mysite.cheungssh.cheungssh.get_deployment_task"),
	url(r"^cheungssh/delete_deployment_task/$","mysite.cheungssh.cheungssh.delete_deployment_task"),
	url(r"^cheungssh/start_deployment_task/$","mysite.cheungssh.cheungssh.start_deployment_task"),
	url(r"^cheungssh/get_deployment_progress/$","mysite.cheungssh.cheungssh.get_deployment_progress"),
	url(r"^cheungssh/batch_create_servers/$","mysite.cheungssh.cheungssh.batch_create_servers"),
	url(r"^cheungssh/get_login_user_list/$","mysite.cheungssh.cheungssh.get_login_user_list"),
	url(r"^cheungssh/page_access_history/$","mysite.cheungssh.cheungssh.page_access_history"),
	url(r"^cheungssh/add_device/$","mysite.cheungssh.cheungssh.add_device"),
	url(r"^cheungssh/get_device/$","mysite.cheungssh.cheungssh.get_device"),
	url(r"^cheungssh/save_topology/$","mysite.cheungssh.cheungssh.save_topology"),
	url(r"^cheungssh/my_topology/$","mysite.cheungssh.cheungssh.my_topology"),
	url(r"^cheungssh/ssh/$","mysite.cheungssh.cheungssh.active_ssh"),
	url(r"^cheungssh/get_active_ssh_result/$","mysite.cheungssh.cheungssh.get_active_ssh_result"),
	url(r"^cheungssh/add_active_ssh_command/$","mysite.cheungssh.cheungssh.add_active_ssh_command"),
	url(r"^cheungssh/get_crontab_list/$","mysite.cheungssh.cheungssh.get_crontab_list"),
	url(r"^cheungssh/delete_crontab_list/$","mysite.cheungssh.cheungssh.delete_crontab_list"),
	url(r"^cheungssh/save_crontab_to_server/$","mysite.cheungssh.cheungssh.save_crontab_to_server"),
	url(r"^cheungssh/upload_analysis_logfile/$","mysite.cheungssh.cheungssh.upload_log_file"),
	url(r"^cheungssh/local_analysis_log/$","mysite.cheungssh.cheungssh.local_analysis_log"),
	url(r"^cheungssh/get_date_analysis_log/$","mysite.cheungssh.cheungssh.get_date_analysis_log"),
	url(r"^cheungssh/add_remote_analysis_logfile/","mysite.cheungssh.cheungssh.add_remote_analysis_logfile"),
	url(r"^cheungssh/get_remote_analysis_logfile_info/","mysite.cheungssh.cheungssh.get_remote_analysis_logfile_info"),
	url(r"^cheungssh/delete_remote_analysis_logfile_info/","mysite.cheungssh.cheungssh.delete_remote_analysis_logfile_info"),
	url(r"^cheungssh/get_to_web_middleware_info/$","mysite.cheungssh.cheungssh.get_to_web_middleware_info"),
	url(r"^cheungssh/get_os_type/$","mysite.cheungssh.cheungssh.get_os_type"),
	)

