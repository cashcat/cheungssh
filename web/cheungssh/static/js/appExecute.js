/**
 * Created by 张其川 on 2016/7/23.
 */


function getAppList(){
	//从后台服务器加载数据
	jQuery.ajax({
		"url":getAppListURL,
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			responseCheck(data);
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			else{
				//创建每一行
				var content=data.content;
				for (var i=0;i<content.length;i++){
					var data=content[i];
					createAppLine(data);
				}
			}
		}
	});
}


function createUserList() {
    //绑定用户归属选择
    var owner = document.getElementById("appOwner");
    for (var i = 0; i < window.userList.length; i++) {
        var username = window.userList[i];
        var option = document.createElement("option");
        option.value=username;
        option.textContent=username;
        if(window.whoami==username){
            //默认是当前用户
            option.setAttribute("selected","selected");
        }
        owner.appendChild(option);
    }
}


function showServers(){
    $("#showAppHost").show("fast");
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
    var appHostTbody = document.getElementById("appHostTbody");
    $(appHostTbody).children().remove();//删除上次的重复
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
                        $(appHostTbody).find(".glyphicon-check").each(function(){///选中了当前，就要取消其他的服务器
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
        appHostTbody.appendChild(tr);
    }
}


function createAppLine(data){
    //创建每一行
    var tbody=document.getElementById("appTbody");
    var tr=document.createElement("tr");
    //服务器
    var td=document.createElement("td");
    td.textContent=data.alias;
    tr.appendChild(td);

    //应用名
    var td=document.createElement("td");
    td.textContent=data.app_name;
    tr.appendChild(td);

    //状态
    var td=document.createElement("td");
    var label=document.createElement("label");
    label.textContent=data.status;
    if(data.status==="新建"){
        label.className="label label-default";
    }
    else if(data.status==="成功"){
        label.className="label label-success";
    }
    else if(data.status==="失败"){
        label.className="label label-danger";
    }
    else if(data.status==="执行中"){
        label.className="label label-warning";
    }
    td.appendChild(label);
    tr.appendChild(td);

    /*
    //命令
    var td=document.createElement("td");
    td.textContent=data.app_command;
    tr.appendChild(td);


    //检查命令
    var td=document.createElement("td");
    td.textContent=data.app_check_command;
    tr.appendChild(td);
    */

    //归属
    var td=document.createElement("td");
    td.textContent=data.owner;
    tr.appendChild(td);
    //操作时间
    var td=document.createElement("td");
    td.textContent=data.time;
    tr.appendChild(td);
    /*
    //消息
    var td=document.createElement("td");
    td.textContent=data.content;
    tr.appendChild(td);
    */

    //执行
    var td=document.createElement("td");
    var startButton=document.createElement("button");
    startButton.setAttribute("tid",data.id);
    startButton.onclick=function(){
        window.currentStartAppButton=this;
        startApp(this);

    }
    startButton.className="btn btn-success btn-xs ";
    var span=document.createElement("span");
    span.className="glyphicon glyphicon-play-circle";

    startButton.appendChild(span);
    //把参数设置给按钮
    startButton.setAttribute("tid",data.id);
    td.appendChild(startButton);

    //创建详情按钮
    var viewButton=document.createElement("button");
    viewButton.onclick=function(){
        showAppDetail(this);
    }
    viewButton.className="btn btn-primary btn-xs glyphicon glyphicon-eye-open viewAppDetail";//viewAppDetail用来更新执行后的信息
    viewButton.style.marginLeft="3px";
    viewButton.setAttribute("alias",data.alias);
    viewButton.setAttribute("appName",data.app_name);
    viewButton.setAttribute("appStatus",data.status);
    viewButton.setAttribute("appCommand",data.app_command);
    viewButton.setAttribute("appCheckCommand",data.app_check_command);
    viewButton.setAttribute("appOwner",data.owner);
    viewButton.setAttribute("appTime",data.time);
    viewButton.setAttribute("appContent",data.content);
    td.appendChild(viewButton);





    var editButton=document.createElement("button");
    editButton.onclick=function(){
        window.currentEditApp=this;//当前编辑的app
        editApp(this);

    };
    editButton.style.marginLeft="3px";
    editButton.className="btn btn-info btn-xs glyphicon glyphicon-edit"
    editButton.setAttribute("tid",data.id);
    editButton.setAttribute("sid",data.sid);
    editButton.setAttribute("alias",data.alias);
    editButton.setAttribute("appName",data.app_name);
    editButton.setAttribute("appCommand",data.app_command);
    editButton.setAttribute("appCheckCommand",data.app_check_command);
    editButton.setAttribute("appOwner",data.owner);
    editButton.setAttribute("content",data.content);
    td.appendChild(editButton);
    tr.appendChild(td);


    //删除按钮
    var deleteButton=document.createElement("button");
    deleteButton.style.marginLeft="3px";
    deleteButton.setAttribute("tid",data.id);
    deleteButton.className="btn btn-danger btn-xs glyphicon glyphicon-trash"
    deleteButton.onclick=function(){
        deleteApp(this);
    }
    td.appendChild(deleteButton);
    tbody.appendChild(tr);



}


function deleteApp(deleteButton){
    //deleteButton是删除按钮
    var appid=deleteButton.getAttribute("tid");
    jQuery.ajax({
        "url":deleteAppURL,
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "data":{"appid":appid},
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                $(deleteButton).parent().parent().remove();//删除行
                showSuccessNotic();
            }
        }
    })


}
function startApp(button){
    //button是点击的button，tid是应用的id,viewButton用来点击详情的更新数据
    var appid=button.getAttribute("tid");//获取应用的id
    var tr=button.parentNode.parentNode;
    $(tr).find("label").removeClass("label-default label-success label-danger").addClass("label-warning").text("执行中");//修改标签提示
    $(button).children().removeClass("glyphicon glyphicon-play-circle").addClass("fa fa-spin fa-refresh");//修改加载动态图标

    jQuery.ajax({
        "url":executeAppURL,
        "data":{"appid":appid},
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){

            responseCheck(data);
            //包含 time,status,content三个字段
            //停止加载图标
            $(button).children().removeClass("  fa fa-spin fa-refresh ").addClass(" glyphicon glyphicon-play-circle ");
            //修改表格中的时间
            $(tr).children().eq(4).text(data.time);
            //更新button按钮的属性，在点击详情按钮的时候，可以获取值
            var viewButton=$(tr).find(".viewAppDetail")[0];
            viewButton.setAttribute("appTime",data.time);
            viewButton.setAttribute("appContent",data.content);
            viewButton.setAttribute("appStatus",data.status);
            //更新消息显示
            if(data.status==="失败"){
                //修改标签提示为红色失败
                $(tr).find("label").removeClass("label-default label-success label-danger label-warning").addClass("label-danger").text("失败");
                showAppDetail(viewButton);//弹出显示，如果是成功的，就显示提示成功信息
            }
            else{
                //修改标签提示为绿色成功
                $(tr).find("label").removeClass("label-default label-success label-danger label-warning").addClass("label-success").text("成功");
                showSuccessNotic();
            }
        }
    });

}

function showAppDetail(viewButton){
    //viewButton就是按钮本身
    //首先从按钮的属性上面获得全部数据
    var appAlias=viewButton.getAttribute("alias");
    var appName=viewButton.getAttribute("appName");
    var appStatus=viewButton.getAttribute("appStatus");
    var appOwner=viewButton.getAttribute("appOwner");
    var appTime=viewButton.getAttribute("appTime");
    var appCommand=viewButton.getAttribute("appCommand");
    var appCheckCommand=viewButton.getAttribute("appCheckCommand");
    var appContent=viewButton.getAttribute("appContent");

    //更新详情值
    document.getElementById("appDetailServer").innerHTML=appAlias;
    document.getElementById("appDetailName").innerHTML=appName;
    document.getElementById("appDetailStatus").innerHTML=appStatus;
    if(appStatus==="成功"){
        //成功
        $("#appDetailStatus").text(appStatus).removeClass("label-danger label-warning").addClass("label-success");
    }
    else if(appStatus==="执行中"){
        //执行中
        $("#appDetailStatus").text(appStatus).removeClass("label-danger  label-success").addClass("label-warning");

    }
    else if(appStatus==="新建"){
        $("#appDetailStatus").text(appStatus).removeClass("label-warning  label-success label-danger").addClass("label-default");
    }
    else{
        //失败
        $("#appDetailStatus").text(appStatus).removeClass("label-warning  label-success").addClass("label-danger");
    }
    document.getElementById("appDetailTime").innerHTML=appTime;
    document.getElementById("appDetailOwner").innerHTML=appOwner;
    document.getElementById("appDetailCommand").innerHTML=appCommand;
    document.getElementById("appDetailCheckCommand").innerHTML=appCheckCommand;
    document.getElementById("appDetailContent").innerHTML=appContent;
    startShadow();
    $("#showAppDetailInfo").show("fast");


}

function editApp(button){
    var sid=button.getAttribute("tid");
    document.getElementById("confirmCreateApp").setAttribute("tid",sid);//设置tid
    //填写各项值
    var t=document.getElementById("appHost");
    t.setAttribute("sid",button.getAttribute("sid"));
    t.value=button.getAttribute("alias");
    document.getElementById("appName").value=button.getAttribute("appName");
    document.getElementById("appCommand").value=button.getAttribute("appCommand");
    document.getElementById("appCheckCommand").value=button.getAttribute("appCheckCommand");
    //归属
    var owner=button.getAttribute("appOwner");
    var ownerSelect = document.getElementById("appOwner");
    console.log( typeof ownerSelect.options);
    for(var i=0; i<ownerSelect.options.length; i++){
        if(ownerSelect.options[i].textContent == owner){
            ownerSelect.options[i].selected = true;
            break;
        }
    }




    //编辑应用app
    startShadow();
    $("#AppDiv").show("fast");
}

$(function(){
    createUserList();//创建用户下拉
    document.getElementById("appHost").onclick=function(){
        document.getElementById("AppDiv").style.display="none";//关闭应用填写框
        showServers();//显示主机选择表
    }
    //绑定取消选择主机
    document.getElementById("cacelAppHost").onclick=function(){
        $("#showAppHost").hide("fast");//关闭主机选择
        $("#AppDiv").show("fast");//显示应用编辑

    }
    //绑定创建应用按钮
    document.getElementById("createApp").onclick=function(){
        //删除tid
        document.getElementById("confirmCreateApp").removeAttribute("tid");//删除编辑时候生成的tid
        startShadow();
        $("#AppDiv").show("fast");
    }
    //绑定确定选择主机
    document.getElementById("confirmAppHost").onclick=function(){
        var t=$("#appHostTbody").find(".glyphicon-check")[0];//因为只有一个主机可以被选中
        var alias=t.textContent;//获取别名
        var sid=t.getAttribute("value",sid);//获取sid
        var appHost=document.getElementById("appHost");
        appHost.value=alias;//写入选中的别名到界面输入框
        appHost.setAttribute("sid",sid)
        $("#showAppHost").hide("fast");//关闭主机选择
        $("#AppDiv").show("fast");//显示应用编辑

    }
    //取消创建APP
    document.getElementById("cancelApp").onclick=function(){
        $("#AppDiv").hide("fast");//显示应用编辑
        stopShadow();
    }
    //确定创建APP
    document.getElementById("confirmCreateApp").onclick=function(){
        var tid=this.getAttribute("tid");//获取编辑的时候产生的tid，如果没有则判断
        var appHost=document.getElementById("appHost");
        var alias=appHost.value;
        var sid=appHost.getAttribute("sid");

        var appName=document.getElementById("appName").value;
        var appCommand=document.getElementById("appCommand").value;
        var appCheckCommand=document.getElementById("appCheckCommand").value;
        var owner=document.getElementById("appOwner").value;
        if(/^ *$/.test(alias) ||/^ *$/.test(appName) ||/^ *$/.test(appCommand)){
            $("#AppDiv").effect("shake");
            return false;
        }
        else{
            var data={
                "sid":sid,
                "app_name":appName,
                "app_command":appCommand,
                "app_check_command":appCheckCommand,
                "owner":owner,
		        "alias":alias,
            };
            if(tid){
                data["id"]=tid;//更新应用,否色是创建
            }
            data=JSON.stringify(data);

            jQuery.ajax({
                "url":createAppURL,
                "data":{"parameters":data},
                "type":"POST",
                "error":errorAjax,
                "beforeSend":start_load_pic,
                "complete":stop_load_pic,
                "success":function(data){
                    responseCheck(data);
                    data=JSON.parse(data);
                    if(!data.status){
                        showErrorInfo(data.content);
                        return false;
                    }
                    else{
                        $("#AppDiv").hide("fast");//显示应用编辑
                        stopShadow();
			//动态创建
                        if(tid){
                            //修改，否则创建
                            $(window.currentEditApp.parentNode.parentNode).remove();//删除此前的行
                            createAppLine(data.content);
                        }
                        else{
                            createAppLine(data.content);
                        }
                        showSuccessNotic();
                    }
                }
            });
        }


    }
	getAppList();//加载清单
	document.getElementById("refreshApp").onclick=function(){
		$("#showMainContent").load("../html/appExecute.html");
	}
	//绑定关闭应用详情的按钮
    document.getElementById("closeAppDetail").onclick=function(){
        $("#showAppDetailInfo").hide("fast");
        stopShadow();
    }
    $( ".modal-content" ).draggable();//窗口拖动

})
