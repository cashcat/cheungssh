





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

$(document).on("click",".createServerStep",function(){
    //新增每一个步骤
    var showAllStep=$(this).siblings()[0];//这个HTM下面显示所有的步骤第一步，第二部。。。按钮和这个是兄弟关系
    //newStep=$(showAllStep).find(".createEveryOneStep")[0].cloneNode(true);
    var newStep=$(".everyOneServer").find(".createEveryOneStep")[0].cloneNode(true);
    newStep.style.display="block";
    showAllStep.appendChild(newStep);
    //在按钮的上一个位置插入新HTML
    //处理步骤数字
    var step=0;//因为这是复制而来的，所以是1
    $(showAllStep).find(".showStep").each(function(){
	if(this.parentNode.style.display==="block"){
        step+=1;
        this.textContent="第 "+ step +" 步";
        this.setAttribute("step",step);
	}
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
    var step=0;
    $(p).find(".showStep").each(function(){
        this.textContent="第 "+ step +" 步";
        step+=1;

    });
})
 




function batchDeploymentSelectServer() {
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
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                     /*   $(DeploymentSelectServerTbody).find(".glyphicon-check").each(function(){///选中了当前，就要取消其他的服务器
                            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                        });*/
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")//选中自己


                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML =  window.allServersList[h].alias;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value", window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                hostSpan.className = "glyphicon glyphicon-unchecked"; //默认不选中
		//重新选择时，恢复上次勾选的
		var chooseSidList=document.getElementById("batchDeploymentServer").getAttribute("sid");
		if (chooseSidList){
			chooseSidList=JSON.parse(chooseSidList);
			for (_index in chooseSidList){
				var _sid=chooseSidList[_index];
				if(window.allServersList[h]["id"]==_sid){
                			hostSpan.className = "glyphicon glyphicon-check"; //如果此前被选中的，这里恢复
				}
				
			}
		}
		//重新选择时，恢复上次勾选的
                td.appendChild(hostSpan);
            }
        }
        tr.appendChild(td);
        DeploymentSelectServerTbody.appendChild(tr);
    }
}





function confirmBatchSelectServerDeployment(){
    //确认选中的服务器，修改服务器框的alias和sid
    var t=$("#showBatchDeploymentHost").find(".glyphicon-check");
    if(t.length===0){
        showErrorInfo("请选择一个服务器！")
        return false;
    }
    //window.currentBatchSelectDeploymentServer.value=t.textContent;
    //window.currentBatchSelectDeploymentServer.setAttribute("sid",t.getAttribute("value"));
        window.currentBatchSelectDeploymentServer.setAttribute("sid",'');
	window.currentBatchSelectDeploymentServer.innerHTML="";//清空此前选中的
	var sidList=[];
	$(t).each(function(){
		var alias=this.textContent;
		//window.currentBatchSelectDeploymentServer.value+=alias+" , ";
		var span=document.createElement("span");
		span.className="label label-success";
		span.textContent=alias;
		span.style.marginLeft="3px";
		window.currentBatchSelectDeploymentServer.appendChild(span);
		sidList.push(this.getAttribute("value"));
	})
		sidList=JSON.stringify(sidList);
		window.currentBatchSelectDeploymentServer.setAttribute("sid",sidList);
    stopShadow();
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




function saveBatchDeploymentTask(){
	    //保存部署任务
    dataStatus=true;//下面是each循环，需要记录是否中断退出
    //deploymentTaskServers={"description":"","servers":[]};//记录当前任务的数据格式{"servers":[],"description"}
    batchDeploymentTaskServers={
		"app_name":"",
		"description":"",
		"steps":[],//[{}]
		"servers":{},//{"sid":"alias"}
	}
    var appName=document.getElementById("taskAppName").value;
    if(/^ *$/.test(appName)){
	showErrorInfo("请填写应用名！")
        return false;
    }
	batchDeploymentTaskServers["app_name"]=appName;


	
    var description=document.getElementById("description").value;
	batchDeploymentTaskServers["description"]=description;
	var servers=[];
	$("#batchDeploymentServer").find("span").each(function(){
		var alias=this.textContent;
		servers.push(alias);
	})
	var tmp=document.getElementById("batchDeploymentServer").getAttribute("sid")
	if(!tmp){
		showErrorInfo("请您选择至少一个主机！")
		return false;
	}


	if(window.batchDeploymentOPTMode==="edit"){
        	batchDeploymentTaskServers["tid"]=window.batchDeploymentEditTid;
    	}



	tmp=JSON.parse(tmp);
	var sid_and_alias={};
	for(i in tmp){
		var sid=tmp[i];
		var _alias=servers[i];
		sid_and_alias[sid]=_alias;
	}
	batchDeploymentTaskServers["servers"]=sid_and_alias;
	isExit=false;
	$(".createEveryOneStep").each(function(){
		if(this.style.display==="block"){
			var stepNum=$(this).find(".showStep")[0].getAttribute("step")
			var stepName=$(this).find(".stepName")[0].value;
			if(/^ *$/.test(stepName)){
				showErrorInfo("请填写步骤名称!");
				isExit=true;
				return false;
			}
		var taskType=$(this).find(".taskModulType")[0].value;
		if(taskType==="command"){
                    var command=$(this).find(".commandModul").find("input")[0].value;
                    if(/^ *$/.test(command)){
			showErrorInfo("请填写命令！")
                        dataStatus=false;
				isExit=true;
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
			showErrorInfo("请填写备份的源路径和目标路径！")
                        dataStatus=false;
				isExit=true;
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
				isExit=true;
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
				isExit=true;
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
				isExit=true;
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
				isExit=true;
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
				isExit=true;
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
				isExit=true;
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
                //serverTask.push(data);//[{},{},{}]
                batchDeploymentTaskServers.steps.push(data)

	}
	})
	if (dataStatus==false){
		return false;
	}
	batchDeploymentTaskServers=JSON.stringify(batchDeploymentTaskServers);
	jQuery.ajax({
		"url":batchDeploymentTaskServersURL,
		"data":{"data":batchDeploymentTaskServers},
		"type":"POST",
		//"dataType":"jsonp",
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
				showSuccessNotic();			
				loadBatchDeploymentHTML();
			}
		}
	})
	
	




}



function getBatchDeploymentTaskConf(){
    //加载一个部署任务详情
    if( window.batchDeploymentOPTMode==="edit"){
    //当前是编辑模式，不是创建模式
        var taskid=window.batchDeploymentEditTid;
        var content=window.alldBatchDeploymentTaskList[taskid];
        console.log(content);
        document.getElementById("taskAppName").value=content.app_name;//应用名
        document.getElementById("description").value=content.description;//描述
	var batchDeploymentServer=document.getElementById("batchDeploymentServer");
	var sidList=[]
        for(sid in content.servers){
            var alias=content.servers[sid];
            //console.log(everyServer);
            var span=document.createElement("span");
		span.className="label label-success";
		span.textContent=alias;
		span.style.marginLeft="3px";
		batchDeploymentServer.appendChild(span);
		sidList.push(sid);
		
	}
	sidList=JSON.stringify(sidList);
	batchDeploymentServer.setAttribute("sid",sidList);


	var steps=content.steps;
	var showAllSteps=document.getElementById("showAllStep")
	for (var _i=1 ;_i<steps.length;_i++){
		//此前已经复制了一个
		var lineTask=steps[_i];
		var newStep=$(".everyOneServer").find(".createEveryOneStep")[0].cloneNode(true);
		newStep.style.display="block";
		showAllSteps.appendChild(newStep);
		
		
		
	}
	var _i=0;
	$(showAllSteps).find(".createEveryOneStep").each(function(){
		if (this.style.display==="block"){
			var stepName= steps[_i].step_name;
			var taskModul=steps[_i].task_modul;
                var taskModulType=$(this).find(".taskModulType")[0];
                taskModulType.value=taskModul;
                showTaskModul(taskModulType);
			$(this).find(".stepName")[0].value=stepName;
        	        if(taskModul==="command"){
                	    var hah=$(this).find(".commandModul").find("input")[0].value=steps[_i].command;
			}
                else if(taskModul==="commandBak"){
                    $(this).find(".commandBakModul").find(".sourceDir")[0].value=steps[_i].source_dir;
                    $(this).find(".commandBakModul").find(".bakDir")[0].value=steps[_i].bak_dir;

                }
                else if(taskModul==="svn"){
                    $(this).find(".svnModul").find(".svnURL")[0].value=steps[_i].svn_url;
                    $(this).find(".svnModul").find(".svnUsername")[0].value=steps[_i].svn_username;
                    $(this).find(".svnModul").find(".svnPassword")[0].value=steps[_i].svn_password;
                    $(this).find(".svnModul").find(".svnDir")[0].value=steps[_i].svn_dir;

                }
                else if(taskModul==="git"){
                    $(this).find(".gitModul").find(".gitURL")[0].value=steps[_i].git_url;
                    $(this).find(".gitModul").find(".gitDir")[0].value=steps[_i].git_dir;
                }
                else if(taskModul==="script"){
                    var scriptFile=steps[_i].script_name;
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
                    scriptParameter.value=steps[_i].script_parameter;

                }
                else if(taskModul==="owner"){
                    $(this).find(".ownerModul").find(".ownerPath")[0].value=steps[_i].path;
                    $(this).find(".ownerModul").find(".owner")[0].value=steps[_i].owner;
                    var recursion=steps[_i].recursion;
                    if(recursion){
                        $(this).find(".ownerModul").find(".recursionDir").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
                    }
                    else{
                        $(this).find(".ownerModul").find(".recursionDir").removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                    }


                }
                else if(taskModul==="permission"){

                    $(this).find(".permissionModul").find(".permissionPath")[0].value=steps[_i].path;
                    $(this).find(".permissionModul").find(".permission")[0].value=steps[_i].code;
                    var recursion=steps[_i].recursion;
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
                    $(this).find(".localUploadModul").find(".remotePath")[0].value=steps[_i].remote_path;
                   //上传文件的本地路径
                    var local_path=steps[_i].local_path;//远程路径
                        var localPathControl = $(this).find(".localUploadModul").find(".localPath")[0];//远程路径的控件
                        //下面循环显示上传路径的本地参数，一个列表定位
                        for(var _ti=0; _ti<localPathControl.options.length; _ti++){
                                if(localPathControl.options[_ti].textContent == local_path){
                                        localPathControl.options[_ti].selected = true;
                                        break;
                                }
                        }







            	}

			_i+=1

		}
		
		
	})
	var _step=0;
	$("#showAllStep").find(".createEveryOneStep").each(function(){
		var h=$(this).find(".showStep")[0];
		h.setAttribute("step",_step);
		h.textContent="第 " + _step + " 步"
		_step+=1;
	})
	return false
        for(sid in content.servers){
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


        //首先显示编写页面
        var moduleHTML=document.getElementsByClassName("createEveryOneStep")[0].cloneNode(true);
	moduleHTML.style.display="block";
	document.getElementById("showAllStep").appendChild(moduleHTML);

	//绑定服务器选择框
	document.getElementById("batchDeploymentServer").onclick=function(){
		window.currentBatchSelectDeploymentServer=this;//记录当前选择的部署服务器框
		$("#showBatchDeploymentHost").show("fast");
		startShadow();
		batchDeploymentSelectServer();
	}
	//取消选择服务器
	document.getElementById("cancelDeploymentSelect").onclick=function(){
		$("#showBatchDeploymentHost").hide("fast");
		stopShadow();
	}
	//确定批量选择服务器
	document.getElementById("confirmBatachDeploymentSelect").onclick=function(){
		confirmBatchSelectServerDeployment();	
		stopShadow();
		$("#showBatchDeploymentHost").hide("fast");
	}
	document.getElementById("saveBatchDeploymentTask").onclick=function(){
		        saveBatchDeploymentTask();		
	}
	document.getElementById("closeEditBatchDeployment").onclick=function(){
		loadBatchDeploymentHTML();
	}
	getBatchDeploymentTaskConf();
})
