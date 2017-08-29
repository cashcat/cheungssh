/**
 * Created by 张其川 on 2016/10/20.
 */

//递归复选框
$(document).on("click",".recursionDir",function(){
    if($(this).hasClass("glyphicon-check")){
        //如果点击之前是被选中的，那么就取消选中
        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        return true;
    }
    else{
        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
        return true;

    }
})


function createTaskServer(){
    //创建人物流程的每一个服务器
    var allTask=document.getElementById("allTask");
    var div=document.getElementsByClassName("everyOneServer")[0];
    var newDiv=div.cloneNode(true);
    newDiv.style.display="block";
    allTask.appendChild(newDiv);
    return newDiv;
}

function copyTaskServer(copyButton){
    //复制服务器步骤按钮的爷爷级元素

    var allTask=document.getElementById("allTask");
    var a=copyButton.parentNode.parentNode;
    a.style.background="white";
    var html=a.cloneNode(true);
    //需要对应已经填写的模块
    var t= $(a).find(".taskModulType")[0].value;
                    var commandSelect =$(html).find(".taskModulType")[0];
                    for(var h=0; h<commandSelect.options.length; h++){
                        if(commandSelect.options[h].getAttribute("value") == t){
                            commandSelect.options[h].selected = true;
                            break;
                        }
                    }
    //在文件上传和脚本两个有子下拉框
    var areaName= $(a).find(".taskModulType")[0].value;//上传文件下拉框
    if (areaName==="script"){
                    var localUploadSelect =$(html).find(".scriptName")[0];
                    var scriptFileName =$(a).find(".scriptName")[0].value;
                    for(var h=0; h<localUploadSelect.options.length; h++){
                        if(localUploadSelect.options[h].textContent == scriptFileName){
                            localUploadSelect.options[h].selected = true;
                            break;
                        }
                    }

    }
    if (areaName==="localUpload"){
                    var localUploadSelect =$(html).find(".localPath")[0];
                    var uploadFileName =$(a).find(".localPath")[0].value;
                    for(var h=0; h<localUploadSelect.options.length; h++){
                        if(localUploadSelect.options[h].textContent == uploadFileName){
                            localUploadSelect.options[h].selected = true;
                            break;
                        }
                    }

    }
    allTask.appendChild(html);

}

function removeTaskServer(deleteButton){
    //删除 删除服务器按钮的爷爷级元素
    var a=deleteButton.parentNode.parentNode;
    $(a).remove();

}

$(document).on("click",".removeTaskServer",function(){
    //删除服务器
    removeTaskServer(this);
})
$(document).on("mouseover",".removeTaskServer",function(){
    //删除服务器按钮，鼠标经过背景变黑
    this.parentNode.parentNode.style.background="black";
})

$(document).on("mouseout",".removeTaskServer",function(){
    //删除服务器按钮，鼠标经过背景变黑
    this.parentNode.parentNode.style.background="none";
})



$(document).on("click",".copyTaskServer",function(){
    //复制服务器步骤
    copyTaskServer(this);
})
$(document).on("mouseover",".copyTaskServer",function(){
    //复制服务器按钮，鼠标经过背景变黑
    this.parentNode.parentNode.style.background="black";
})

$(document).on("mouseout",".copyTaskServer",function(){
    //复制服务器按钮，鼠标经过背景变黑
    this.parentNode.parentNode.style.background="none";
})







$(document).on("click",".createServerStep",function(){
    //新增每一个步骤
    var showAllStep=$(this).siblings()[0];//这个HTM下面显示所有的步骤第一步，第二部。。。按钮和这个是兄弟关系
    //newStep=$(showAllStep).find(".createEveryOneStep")[0].cloneNode(true);
    var newStep=$(".everyOneServer").find(".createEveryOneStep")[0].cloneNode(true);
    showAllStep.appendChild(newStep);
    //在按钮的上一个位置插入新HTML
    //处理步骤数字
    var step=1;
    $(showAllStep).find(".showStep").each(function(){
        this.textContent="第 "+ step +" 步";
        this.setAttribute("step",step);
        step+=1;
    });

})

$(document).on("mouseover",".removeServerStep",function(){
    //鼠标经过删除步骤按钮的事件，让背景变黑
    var a=this.parentNode.parentNode;//按钮的上三级级元素
    a.style.background="black";
});
$(document).on("mouseout",".removeServerStep",function(){
    //鼠标经过删除步骤按钮的事件，让背景恢复
    var a=this.parentNode.parentNode;//按钮的上两级级元素
    a.style.background="none";
});

$(document).on("click",".removeServerStep",function(){

    //删除步骤
    var a=this.parentNode.parentNode;//按钮的上两级级元素
    //删除之前先得到上三级元素，否则删除后，this就失效了
    var p=a.parentNode;
    $(a).remove();//删除
    //重新排序处理步骤数字
    var step=1;
    console.log(this);
    $(p).find(".showStep").each(function(){
        console.log(step)
        this.textContent="第 "+ step +" 步";
        step+=1;

    });
})



function initFileDropZ() {
    var dropz = new Dropzone("#uploadFileDropz", {
        url: uploadFileToCheungSSH,
	clickable:false,//取消点击
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        startShadow();
        $("#showDeploymentUploadFileProgresiv").slideDown("fast");
    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var showDeploymentUploadFileProgressText = document.getElementById("showDeploymentUploadFileProgressText");
        progress = parseInt(progress);
        if (isNaN(progress)) {
            //表示上传失败
            showErrorInfo("不能连接到服务器");
            $("#showDeploymentUploadFileProgresiv").slideUp("fast");
            return false;
        }
        showDeploymentUploadFileProgressText.innerText = progress + "%";
        showDeploymentUploadFileProgressText.style.width = progress + "%";
    });
    dropz.on("success", function (file, data) {
        //上传成功,data是服务器返回的消息
        stopShadow();
        $("#showDeploymentUploadFileProgresiv").slideUp("fast");//关闭进度显示
        data = JSON.parse(data);
        responseCheck(data);
        if (!data.status) {
            showErrorInfo(data.content);
            return false;
        }
        else{
            var filename=file.name;
            if( !window.allUploadFileList.indexOf(filename)>-1){
                //不存在，那么就加入select列表中，并且更新内存记录，如果存在就不做了
                window.allUploadFileList.push(filename);
                increateUploadListToSelect(filename);
            }
            showSuccessNotic();
        }

    })
    //https://www.renfei.org/blog/dropzone-js-introduction.html
}

function loadUploadFileList(){
    //加载上传过的文件清单
    jQuery.ajax({
        "url":getUploadFileList,
        "dataType":"jsonp",
        async:false,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                window.allUploadFileList=data.content;//只记录上传的清单，这里不处理HTML，因为在过程中会有动态上传的文件，所以在动态上传的时候再去天添加新的额select HTML
                $(".sftpFileName").each(function(){
                    for(var i=0;i<data.content.length;i++){
                        var filename=data.content[i];
                        var option=document.createElement("option");
                        option.value=filename;
                        option.textContent=filename;
                        this.appendChild(option);
                    }
                });



            }
        }

    });
}

function increateUploadListToSelect(filename){
    //新增的文件加入所有的select中，动态上传的
    $(".sftpFileName").each(function(){
        //界面中可能存在多个，那么就每一个都添加
        var option=document.createElement("option");
        option.value=filename;
        option.textContent=filename;
        this.appendChild(option);
    })
}

function loadScriptList() {
    $.ajax({
        "url": scriptListURL,
        "dataType": "jsonp",
        "error": errorAjax,
        async:false,
        "success": function (data) {
           // responseCheck(data);
            //data是一个dict
            if (!data.status) {
                showErrorInfo(data.content);
            }
            else {
                var scripts = data.content;
                //var scriptSelect=document.getElementsByClassName("scriptName")[0];
                $(".scriptName").each(function(){
                    //为了给所有的脚本添加，否则如果异步加载不成功导致有些列表没有
                    for (var filename in scripts) {
                        var line = scripts[filename];
                        var script=line.script;
                        var  option=document.createElement("option");
                        option.value=script;
                        option.textContent=script;
                        this.appendChild(option);
                    }
                })

            }
        }
    });



}



function showTaskModul(modul){
    var taskModulType=modul.value;//任务类型
    var p=modul.parentNode.parentNode;//上两级元素，该元素下面是所有的任务模块
    $(p).find(".taskModul").each(function(){
        //每一个拥有taskModul的任务类型，也就是全部的任务类型了
        this.style.display="none";//影藏全部
    })
    if(taskModulType=="command"){
        $(p).find(".commandModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="commandBak"){
        $(p).find(".commandBakModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="svn"){
        $(p).find(".svnModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="git"){
        $(p).find(".gitModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="localUpload"){
        $(p).find(".localUploadModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="script"){
        $(p).find(".scriptModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="owner"){
        $(p).find(".ownerModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="permission"){
        $(p).find(".permissionModul")[0].style.display="";//显示指定的模块
    }
    if(taskModulType=="upload"){
        $(p).find(".uploadModul")[0].style.display="";//显示指定的模块
    }
}


//绑定选择模块事件
$(document).on("change",".taskModulType",function(){
    showTaskModul(this);//处理模块的显示与否
});

function DeploymentSelectServer() {
    startShadow();
    $("#showDeploymentHost").show("fast");
    $("#DeploymentSelectServerTbody").children().remove();//删除上次创建的HTML，避免重复
    var hostGroups = [];
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {  //大于-1标识找到了，否则就是没有找到
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var DeploymentSelectServerTbody = document.getElementById("DeploymentSelectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //循环读取主机组，并且显示对应的主机
        var tr = document.createElement("tr"); //每一行，包含的是主机组和对应的主机
        var td = document.createElement("td"); //用于显示主机组，主机组|主机A，主机B
        var groupSpan = document.createElement("span");//用于显示复选框
        groupSpan.innerHTML  =hostGroups[i];//显示值
        groupSpan.setAttribute("value", hostGroups[i]);//把值设置给属性
        //设置点击事件

        td.appendChild(groupSpan);//把第span加入td，第一个位置主机组
        tr.appendChild(td);

        td = document.createElement("td");
        //需要循环处理N个主机
        for (h in window.allServersList) {//循环读取所有主机组对应的主机
            if (group === window.allServersList[h].group) {//匹配当前主机组的主机，显示
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-unchecked"; //默认不选中
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(DeploymentSelectServerTbody).find(".glyphicon-check").each(function(){///选中了当前，就要取消其他的服务器
                            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                        });
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")//选中自己


                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML =  window.allServersList[h].alias;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value", window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                td.appendChild(hostSpan);
            }
        }
        tr.appendChild(td);
        DeploymentSelectServerTbody.appendChild(tr);
    }
}

$(document).on("click",".deploymentServer",function(){
    window.currentSelectDeploymentServer=this;//记录当前选择的部署服务器框
    DeploymentSelectServer();//当点击服务器框的时候，就显示服务器DIV
})




function confirmSelectServerDeployment(){
    //确认选中的服务器，修改服务器框的alias和sid
    var t=$("#showDeploymentHost").find(".glyphicon-check")[0];
    if(!t){
        showErrorInfo("请选择一个服务器！")
        return false;
    }
    window.currentSelectDeploymentServer.value=t.textContent;
    window.currentSelectDeploymentServer.setAttribute("sid",t.getAttribute("value"));
    $("#showDeploymentHost").slideUp("fast");//
    stopShadow();
}

function saveDeploymentTask(){
    //保存部署任务
    dataStatus=true;//下面是each循环，需要记录是否中断退出
    deploymentTaskServers={"description":"","servers":[]};//记录当前任务的数据格式{"servers":[],"description"}
    var appName=document.getElementById("taskAppName").value;
    if(/^ *$/.test(appName)){
        $($("#taskAppName").parent()).effect("shake");
        return false;
    }
    var description=document.getElementById("description").value;
    if(/^ *$/.test(description)){
        $($("#description").parent()).effect("shake");
        return false;
    }
    deploymentTaskServers["description"]=description;
    deploymentTaskServers["app_name"]=appName;
    $(".everyOneServer").each(function(){
        //每一个服务器
        if(this.style.display==="block"){
            //模板服务器,跳过
            var host=$(this).find(".deploymentServer")[0];
            var alias=host.value;
            var sid=host.getAttribute("sid");
            if(/^ *$/.test(alias)){
                $($(this).find(".deploymentServer")[0]).effect("shake");
                dataStatus=false;
                return false;
            }
            //console.log(this);
            serverTask=[];//存放一个服务器的所有步骤[{},{},{}]
            $(this).find(".createEveryOneStep").each(function(){
                //这里是每一个步骤的信息
                //console.log(this);
                var taskType=$(this).find(".taskModulType")[0].value;
                var h2=$(this).find("h2")[0];
                var step=h2.getAttribute("step");
                var stepName=$(this).find("input")[0].value;
                if(/^ *$/.test(stepName)){
                    $($(this).find("input")[0]).effect("shake");
                    dataStatus=false;
                    return false;
                }
                if(taskType==="command"){
                    var command=$(this).find(".commandModul").find("input")[0].value;
                    if(/^ *$/.test(command)){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"command",
                        "command":command,
                    };
                }
                else if(taskType==="commandBak"){
                    var sourceDir=$(this).find(".sourceDir")[0].value;
                    var bakDir=$(this).find(".bakDir")[0].value;
                    if(/^ *$/.test(sourceDir) || /^ *$/.test(bakDir)){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"commandBak",
                        "source_dir":sourceDir,
                        "bak_dir":bakDir,
                    };


                }
                else if(taskType==="svn"){
                    var svnURL=$(this).find(".svnURL")[0].value;
                    var svnUsername=$(this).find(".svnUsername")[0].value;
                    var svnPassword=$(this).find(".svnPassword")[0].value;
                    var svnDir=$(this).find(".svnDir")[0].value;
                    if(/^ *$/.test(svnURL) || /^ *$/.test(svnDir)){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"svn",
                        "svn_username":svnUsername,
                        "svn_password":svnPassword,
                        "svn_url":svnURL,
                        "svn_dir":svnDir,
                    };
                }
                else if(taskType==="git"){
                    var gitURL=$(this).find(".gitURL")[0].value;
                    var gitDir=$(this).find(".gitDir")[0].value;
                    if(/^ *$/.test(gitURL) ||  /^ *$/.test(gitDir) ){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"git",
                        "git_url":gitURL,
                        "git_dir":gitDir,
                    };
                }
                else if(taskType==="script"){
                    var  scriptName=$(this).find(".scriptName")[0].value;
                    var scriptParameter=$(this).find(".scriptParameter")[0].value;
                    console.log(scriptName,scriptParameter);
                    if(/^ *$/.test(scriptName)){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"script",
                        "script_name":scriptName,
                        "script_parameter":scriptParameter,
                        "owner":window.whoami,
                    };
                }
                else if(taskType==="owner"){
                    var path=$(this).find(".ownerPath")[0].value;
                    var owner=$(this).find(".owner")[0].value;
                    if($($(this).find(".recursionDir")[0]).hasClass("glyphicon-check")){
                        var recursion=true;
                    }
                    else{
                        var recursion=false;
                    }
                    if(/^ *$/.test(path) || /^ *$/.test(owner) ){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"owner",
                        "owner":owner,
                        "path":path,
                        "recursion":recursion,
                    };
                }
                else if(taskType==="permission"){
                    var path=$(this).find(".permissionPath")[0].value;
                    var code=$(this).find(".permission")[0].value;

                    if($($(this).find(".permissionModul").find(".recursionDir")[0]).hasClass("glyphicon-check")){
                        var recursion=true;
                    }
                    else{
                        var recursion=false;
                    }
                    if(/^ *$/.test(path)){
                        $(this).effect("shake");
                        dataStatus=false;
                        return false;
                    }
                    if( /[0-1][0-7]{3}/.test(code)  &&  code.length==4){
                        //权限代码正确
                        var data={
                            "task_modul":"permission",
                            "code":code,
                            "path":path,
                            "recursion":recursion,
                        };
                    }
                    else{
                        $(this).effect("shake");
                        showErrorInfo("权限代码错误!")
                        dataStatus=false;
                        return false;

                    }
                }
                else if(taskType==="sftp"){
                    alert("暂时不支持");
                    dataStatus=false;
                    return false;
                }
                else if(taskType==="localUpload"){
                    var localPath=$(this).find(".localPath")[0].value;
                    var remotePath=$(this).find(".remotePath")[0].value;
                    if(/^ *$/.test(localPath) || (/^ *$/.test(remotePath))){
                        showErrorInfo("请填写远程路径和本地路径!")
                        dataStatus=false;
                        return false;
                    }
                    var data={
                        "task_modul":"localUpload",
                        "remote_path":remotePath,
                        "local_path":localPath,
                        "owner":window.whoami,
                    }
                }
                data["step_name"]=stepName;
                serverTask.push(data);//[{},{},{}]

            });
            var info={"steps":serverTask,"server":sid,"alias":alias};
            deploymentTaskServers.servers.push(info);
        }

    });


    if(!dataStatus){
        return false;
    }

    console.log(deploymentTaskServers);
    if(deploymentTaskServers.servers.length==0){
        showErrorInfo("请最少添加一个服务器！");
        return false;
    }
    if(window.deploymentOPTMode==="edit"){
        deploymentTaskServers["tid"]=window.deploymentEditTid;
    }
    data=JSON.stringify(deploymentTaskServers);
    jQuery.ajax({
        "url":createDeploymentTask,
        "data":{"data":data},
        "type":"POST",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            data=JSON.parse(data);
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                loadAppDeployHTML();
                showSuccessNotic();
            }
        }
    });

}


function getDeploymentTaskConf(){
    //加载一个部署任务详情
    if( window.deploymentOPTMode==="edit"){
    //当前是编辑模式，不是创建模式
        var taskid=window.deploymentEditTid;
        var content=window.alldDeploymentTaskList[taskid];
        console.log(content);
        document.getElementById("taskAppName").value=content.app_name;//应用名
        document.getElementById("description").value=content.description;//描述
        for(var i=0;i<content.servers.length;i++){
            var everyServer=createTaskServer();// 创建一个服务器
            var sid=content.servers[i].server;
            var alias=content.servers[i].alias;
            console.log(everyServer);
            var inputServer=$(everyServer).find(".deploymentServer")[0]
            inputServer.value=alias;//每一个服务器的别名
            inputServer.setAttribute("sid",sid);//每一个服务器的别名

            var showAllStep=$(everyServer).find(".showAllStep")[0];
            for(var t=0;t<content.servers[i].steps.length-1;t++){
                //一个服务器的全部步骤
                var newStep=$(".everyOneServer").find(".createEveryOneStep")[0].cloneNode(true);
                //恢复一个服务器的全部步骤
                showAllStep.appendChild(newStep);
            }
            //恢复每一个步骤的数据
            var g=0
            $(everyServer).find(".createEveryOneStep").each(function(){
                //一个服务器的全部步骤
                //步骤名
                var stepName=content.servers[i].steps[g].step_name;
                $(this).find(".stepName")[0].value=stepName;
                var taskModul=content.servers[i].steps[g].task_modul;
                console.log(taskModul);
                var taskModulType=$(this).find(".taskModulType")[0];
                taskModulType.value=taskModul;
                showTaskModul(taskModulType);


                if(taskModul==="command"){
                    var hah=$(this).find(".commandModul").find("input")[0].value=content.servers[i].steps[g].command;;
                }
                else if(taskModul==="commandBak"){
                    $(this).find(".commandBakModul").find(".sourceDir")[0].value=content.servers[i].steps[g].source_dir;
                    $(this).find(".commandBakModul").find(".bakDir")[0].value=content.servers[i].steps[g].bak_dir;

                }
                else if(taskModul==="svn"){
                    $(this).find(".svnModul").find(".svnURL")[0].value=content.servers[i].steps[g].svn_url;
                    $(this).find(".svnModul").find(".svnUsername")[0].value=content.servers[i].steps[g].svn_username;
                    $(this).find(".svnModul").find(".svnPassword")[0].value=content.servers[i].steps[g].svn_password;
                    $(this).find(".svnModul").find(".svnDir")[0].value=content.servers[i].steps[g].svn_dir;

                }
                else if(taskModul==="git"){
                    $(this).find(".gitModul").find(".gitURL")[0].value=content.servers[i].steps[g].git_url;
                    $(this).find(".gitModul").find(".gitDir")[0].value=content.servers[i].steps[g].git_dir;
                }
                else if(taskModul==="script"){
                    var scriptFile=content.servers[i].steps[g].script_name;
                    //脚本文件
                   var scriptSelect =$(this).find(".scriptModul").find(".scriptName")[0];
                    //console.log("历史记录",scriptSelect,scriptSelect.options,scriptSelect.options.length);
                    for(var h=0; h<scriptSelect.options.length; h++){
                        if(scriptSelect.options[h].textContent == scriptFile){
                            scriptSelect.options[h].selected = true;
                            break;
                        }
                    }
                    //脚本参数和

                    var scriptParameter =$(this).find(".scriptModul").find(".scriptParameter")[0];
                    scriptParameter.value=content.servers[i].steps[g].script_parameter;

                }
                else if(taskModul==="owner"){
                    $(this).find(".ownerModul").find(".ownerPath")[0].value=content.servers[i].steps[g].path;
                    $(this).find(".ownerModul").find(".owner")[0].value=content.servers[i].steps[g].owner;
                    var recursion=content.servers[i].steps[g].recursion;
                    if(recursion){
                        $(this).find(".ownerModul").find(".recursionDir").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
                    }
                    else{
                        $(this).find(".ownerModul").find(".recursionDir").removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                    }


                }
                else if(taskModul==="permission"){

                    $(this).find(".permissionModul").find(".permissionPath")[0].value=content.servers[i].steps[g].path;
                    $(this).find(".permissionModul").find(".permission")[0].value=content.servers[i].steps[g].code;
                    var recursion=content.servers[i].steps[g].recursion;
                    if(recursion){
                        $(this).find(".permissionModul").find(".recursionDir").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
                    }
                    else{
                        $(this).find(".permissionModul").find(".recursionDir").removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                    }
                }

                else if(taskModul==="localUpload"){
                    //$(this).find(".localUploadModul").find(".localPath")[0].value=content.servers[i].steps[g].;
                    //上传文件的远程路径
                    $(this).find(".localUploadModul").find(".remotePath")[0].value=content.servers[i].steps[g].remote_path;
		   //上传文件的本地路径
                    var local_path=content.servers[i].steps[g].local_path;//远程路径
		        var localPathControl = $(this).find(".localUploadModul").find(".localPath")[0];//远程路径的控件
                        //下面循环显示上传路径的本地参数，一个列表定位
    			for(var _ti=0; _ti<localPathControl.options.length; _ti++){
				if(localPathControl.options[_ti].textContent == local_path){
					localPathControl.options[_ti].selected = true;
					break;
				}
			}






                   // var localUploadSelect =$(this).find(".localUploadModul").find(".scriptName")[0];
                    //console.log(localUploadSelect);

                    //console.log("历史记录",scriptSelect,scriptSelect.options,scriptSelect.options.length);
                    /*for(var h=0; h<scriptSelect.options.length; h++){
                        if(scriptSelect.options[h].textContent == scriptFile){
                            scriptSelect.options[h].selected = true;
                            break;
                        }
                    }*/


                }

                //步骤模块
                g+=1;

            });


            //重新显示步骤名称
            var step=1;
            $(showAllStep).find(".showStep").each(function(){
                this.textContent="第 "+ step +" 步";
                this.setAttribute("step",step);
                step+=1;
            });






        }



    }
}




$(function(){
    //绑定创建服务器按钮
    document.getElementById("createTaskServer").onclick=function(){
        createTaskServer();
    }
    loadScriptList();//加载脚本清单
    initFileDropZ();//绑定拖动上传
    loadUploadFileList();//加载上传过的文件清单
    //绑定关闭选择服务器按钮
    document.getElementById("cancelDeploymentSelect").onclick=function(){
        $("#showDeploymentHost").slideUp("fast");//
        stopShadow();
    }
    //绑定确认选择服务器按钮
    document.getElementById("confirmDeploymentSelect").onclick=function(){
        confirmSelectServerDeployment();
    }
    //绑定取消按钮
    document.getElementById("closeEditDeployment").onclick=function(){
        $("#showMainContent").load("../html/deploymentTable.html");
    }
    //绑定保存按钮
    document.getElementById("saveDeploymentTask").onclick=function(){
        //保存配置
        saveDeploymentTask();
    }
    //绑定加入计划任务按钮
    document.getElementById("deploymentAddCrond").onclick=function(){
        showErrorInfo("当前版本不支持该功能，请购买商业版本！");
        return false;
    }
    getDeploymentTaskConf();//加载任务详情，里面有判断是否加载






})

