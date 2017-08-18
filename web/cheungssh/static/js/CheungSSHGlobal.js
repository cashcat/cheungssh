//全局变量
var serverOption = ["", "IP", "别名", "端口", "主机组", "用户名", "登录方式", "秘钥文件", "密码", "归属用户", "sudo", "sudo密码", "su", "su密码", "状态", "备注"];

var serverOptionEN = ["", "ip", "alieas", "port", "group", "username", "login_method", "key_file", "password", "owner", "sudo", "sudo_password", "su", "su_password", "status", "description"];

var serverIP = window.location.host;
var version = "run"; //标识开发版本和正式版本
var headURL = version === "dev" ? "http://192.168.1.103:800/" : "/";
var webSSHURL = version === "dev" ? "https://192.168.1.103:4200" : serverIP + ":4200";
window.version=version;
window.vimInfo="CheungSSH已经给您提供了更好的文件编辑功能，请您转到【远程日志】-> 【文件】 功能中使用，不必使用vi命令。"
window.refuseInfo="抱歉，这里是批量操作，如果您要执行交互动作，请您转到【网络拓扑】-> 【拓扑布局】中，双击一个设备登录服务器执行！如果有疑问或者更多想法，请您联系本软件作者！QQ群：585393390";




//window.currentCommand=command;//用于记录当前执行的命令，主要使用在强制交互的地方
//指定创建/修改资产的动作类型
//window.assetAction="create" /modify

//记录当前运行的命令
//window.currentCommand="";
//window.assetsConf;存储资产类key;资产英文名
//window.assetsConfName;存储资产类Name，资产中文名
/*
 window.uploadFileModel="fast/advance";//上传文件模式
 window.currentfileUploadSelectedServers //文件上传选择的服务器
 window.fileUploadLocalFileName=file.name;//拖动上传的文件名;
 window.currentLocalUploadFileInput=div1;//记录当前上传的input空间，在拖动上传完成后，把值写入input中
 window.currentfileDownloadSelectedServers=[];//重置下载选中的主机
 window.currentDownloadServerTotal=0;//当前下载服务器的数量
 window.userList;//["cheungssh","admin"];
 window.currentEditServerModel="edit";//记录当前的编辑模式，有edit/create
 window.currentEditTr=tr;//当前最的编辑行
 window.runScriptServers.length//选中的要运行脚本的服务器
 window.currentRunScriptName=this.getAttribute("filename");//当前需要运行的脚本名字
 window.successScriptInit={};//[{"sid":111,"dfile":dfile}] 存储脚本初始化成功的服务器和对应的脚本名
 window.runScriptInitServerNum=0;//记录需要运行脚本初始化的主机数量
 window.failedScriptInitNum=0;//脚本初始化失败的个数
 window.currentRemoteFileModel="edit";//当前编辑远程文件清单的模式edit/create
 window.currentRemoteFileButton=this;//当前编辑的button按钮
 window.currentRemoteFileViewButton=this;//远程文件更新时需要
 window.allUploadFileList=data.content;//记录了当前用户所有上传过的文件列表
 window.currentSelectDeploymentServer=this;//记录当前选择的部署服务器框
 window.alldDeploymentTaskList=data.content;//记录全部的部署任务清单
 window.deploymentOPTMode="create";//记录当前编辑模式
 window.deploymentEditTid=false;//清除此前编辑的任务id
 window.currentDeploymentTaskId;//当前要显示部署详情的ID
 window.demoLoad=true;//标记是后台加载就不要显示加载图标
 window.currentEditAppTr=this.getAttribute("tid");//当前编辑的app 的表格行












 */


/*
 必须首先加载：服务器信息
 */


var modifyURL = headURL + "cheungssh/config_modify/";
var loginURL = "cheungssh/login/";
var loadServerListURL = headURL + "cheungssh/load_servers_list/";
var logoutURL = "cheungssh/logout/";
var whoamiURL = "cheungssh/whoami/";
var groupInfo = "cheungssh/groupinfo/";
var parameterURL = "cheungssh/parameter/";
var userListURL = headURL + "cheungssh/getalluser/";
var dashboardURL = "cheungssh/dashboard/";
var deleteServerURL = headURL + "cheungssh/config_del/";
var keyAdminURL = headURL + "cheungssh/show_keyfile_list/";
var createServerURL = headURL + "cheungssh/config_add/";
var pathSearchURL = "cheungssh/pathsearch/";
var createAppURL = headURL + "cheungssh/create_app/";
var getAppListURL = headURL + "cheungssh/get_app_list/";
var commandBlackListURL = headURL + "cheungssh/list_black_command/";
var deleteCommandBlackURL = headURL + "cheungssh/del_black_command/";
var addCommandBlackURL = headURL + "cheungssh/add_black_command/";
var ipLimitThresholdURL = headURL + "cheungssh/showipthreshold/";
var modifyLimitThresholdURL = headURL + "cheungssh/modify_iplimit/";
var showIPLimitList = headURL + "cheungssh/showiplimit/";
var deleteIPLimitURL = headURL + "cheungssh/deliplimit/";
var commandHistoryURL = headURL + "cheungssh/command_history/";
var myCommandHistoryURL = headURL + "cheungssh/my_command_history/";
var customAssetsClassURL = headURL + "cheungssh/custom_assets_class/";
var customCreateAssetURL = headURL + "cheungssh/custom_increate_asset/";
var loadCustomAssetsOptionURL = headURL + "cheungssh/load_assets_list/";
var deleteAssetURL = headURL + "cheungssh/delete_assets/";
var executeCommandURL = headURL + "cheungssh/execute_command/";
var getCommandResultURL = headURL + "cheungssh/get_command_result/";
var dockerImageListURL = headURL + "cheungssh/docker_images_list/";
var dockerContainerListURL = headURL + "cheungssh/docker_containers_list/";
var dockerContainerRunURL = headURL + "cheungssh/docker_container_start/";
var dockerContainerProgressURL = headURL + "cheungssh/docker_container_progress/";
var getCurrentAssetsDataURL = headURL + "cheungssh/get_current_assets_data/";
var getHistoryAssetsDataURL = headURL + "cheungssh/get_history_assets_data/";
var getAssetsConfURL = headURL + "cheungssh/get_assets_conf/";
var getFileTransProgressURL = headURL + "cheungssh/get_filetrans_progress/";
var fileTransURL = headURL + "cheungssh/filetrans/upload/";
var uploadFileToCheungSSH = headURL + "cheungssh/upload/test/";
var remoteDownloadFileURL = headURL + "cheungssh/filetrans/download/";
var createTGZPackURL = headURL + "cheungssh/create_tgz_pack/";
var uploadKeyFileURL = headURL + "cheungssh/upload_keyfile/";
var deleteKeyFileURL = headURL + "cheungssh/delete_keyfile/";
var sshStatusURL = headURL + "cheungssh/ssh_status/";//用来获取状态
var sshCheckURL = headURL + "cheungssh/ssh_check/";//用来请求服务器检查，最后返回服务器状态
var uploadScriptToCheungSSH = headURL + "cheungssh/upload_script/";
var scriptListURL = headURL + "cheungssh/scripts_list/";
var deleteScriptURL = headURL + "cheungssh/delete_script/";
var getScriptContentURL = headURL + "cheungssh/get_script_content/";
var writeScriptContentURL = headURL + "cheungssh/write_script_content/";
var scriptInitURL = headURL + "cheungssh/script_init/";
var addRemoteFileURL = headURL + "cheungssh/add_remote_file/";
var getRemoteFileListURL = headURL + "cheungssh/get_remote_file_list/";
var deleteRemoteFileListURL = headURL + "cheungssh/delete_remote_file_list/";
var getRemoteFileContentURL = headURL + "cheungssh/get_remote_file_opt/";
var writeRemoteFileContentURL = headURL + "cheungssh/write_remote_file_opt/";
var getUploadFileList = headURL + "cheungssh/get_my_file_list/";
var createDeploymentTask = headURL + "cheungssh/create_deployment_task/";
var getDeploymentTaskURL = headURL + "cheungssh/get_deployment_task/";
var deleteDeploymentTaskURL = headURL + "cheungssh/delete_deployment_task/";
var startDeploymentTaskURL = headURL + "cheungssh/start_deployment_task/";
var getDeploymentProgressURL = headURL + "cheungssh/get_deployment_progress/";
var loginSuccessLogURL = headURL + "cheungssh/login_success_log/";
var batchCreateServersURL = headURL + "cheungssh/batch_create_servers/";
var executeAppURL = headURL + "cheungssh/execute_app/";
var deleteAppURL = headURL + "cheungssh/delete_app/";
var commandLogURL = headURL + "cheungssh/command_history/";
var getLoginUserNotifyURL=headURL+"cheungssh/get_login_user_list/";
var getPageAccessURL=headURL+"cheungssh/page_access_history/";
var addDeviceURL=headURL+"cheungssh/add_device/";
var getDeviceURL=headURL+"cheungssh/get_device/";
var saveTopologyURL=headURL+"cheungssh/save_topology/";
var myTopologyURL=headURL+"cheungssh/my_topology/";
var activeSSHURL=headURL+"cheungssh/ssh/";
var addActiveSSHCommand=headURL+"cheungssh/add_active_ssh_command/"
var getActiveSSHResultURL=headURL+"cheungssh/get_active_ssh_result/";
var getCrondListURL=headURL+"cheungssh/get_crontab_list/";
var deleteCrondListURL=headURL+"cheungssh/delete_crontab_list/";
var saveCrondToServerURL =headURL+"cheungssh/save_crontab_to_server/";
var uploadAnalysisLogfileURL=headURL+"cheungssh/upload_analysis_logfile/";
var getAnalysisLogResultURL=headURL+"cheungssh/local_analysis_log/";
var getLogDateURL=headURL+"cheungssh/get_date_analysis_log/";
var addRemoteAanalysisLogfileURL=headURL+"cheungssh/add_remote_analysis_logfile/";
var getRemoteAanalysisLogfileInfoURL=headURL+"cheungssh/get_remote_analysis_logfile_info/";
var delRemoteAanalysisLogfileInfoURL=headURL+"cheungssh/delete_remote_analysis_logfile_info/";
var getMiddleWareInfoURL=headURL+"cheungssh/get_to_web_middleware_info/";
var getCurrentAssetsDataExportURL=headURL+"cheungssh/get_current_assets_data_export/";
var getSystemVersionURL=headURL+"cheungssh/get_os_type/";

/*
 iphone6s plus屏幕尺寸  高度   736px  414px
 document.body.offsetWidth //浏览器的的宽
 document.body.offsetHeight //浏览器的高
 */



//全局变量


function start_load_pic() {
    document.getElementById("loadPic").style.display = "block";
    //document.getElementById("shadow").style.display = "block";

}

function stop_load_pic() {
    document.getElementById("loadPic").style.display = "none";
    //document.getElementById("shadow").style.display = "none";


}


var controlShowUL = true;

function responseCheck(data) {
    try {
        data = JSON.parse(data);

    }
    catch (e) {
        //
    }

    // document.getElementById("loadPic").style.display = "none";
    if (data.status === "login") {
        //window.location.href="static/html/login.html";
        if (version === "dev") {
            alert("请登录");
        }
        else {
            window.location.href = "login.html";
        }
    }
    if (data.status === true) {
        return true;

    }
}


function errorAjax(XMLHttpRequest, textStatus, errorThrown) {
    status_code = XMLHttpRequest.status;
    var content = XMLHttpRequest.responseText || "";
    var mysqlSock = content.match("\/.*sock");
    if (content.match("Can.*connect to local.*server through socket")) {
        content = "CheungSSH内部系统错误，代码:CHB-R1000000027";
    }
    else if (content.match("Access.*denied")) {
        content = "CheungSSH内部系统错误，代码:CHB-R1000000028";
    }
    else if (/Error 111 connecting to.*Connection refused/.test(content)) {
        content = "CheungSSH内部系统错误，代码:CHB-R1000000026";
    }
    else {
        content = "CheungSSH已经响应,但是出现意外的错误，请联系您的管理员";
    }
    showErrorInfo(content);
}


function showErrorInfo(info) {
    document.getElementById("loadPic").style.display = "none";
    $("#showErrorInfoDIV").show("fast");
    var showWarnContent = document.getElementById("showWarnContent");
    showWarnContent.innerHTML = info;
    document.getElementById("shadow").style.display = "block";
}


function startShadow() {
    document.getElementById("shadow").style.display = "block";
}
function stopShadow() {
    document.getElementById("shadow").style.display = "none"

}
