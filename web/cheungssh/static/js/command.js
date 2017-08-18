$(function () {
        var divHeight = window.innerHeight;
        //$("#mainCommand").css({"height": divHeight});}
        document.getElementById("mainCommand").style.height = divHeight - 120 + "px";


    }
)


$(function () {
    jQuery1_8("#selectServer").toggle(function () {
            $(this).children().eq(0).removeClass("glyphicon-check");
            $(this).children().eq(0).addClass("glyphicon-unchecked");

        }, function () {
            $(this).children().eq(0).removeClass("glyphicon-unchecked");
            $(this).children().eq(0).addClass("glyphicon-check");


        }
    );
});


//命令搜索

$(function () {
    var cache = {};  //缓存功能
    $("#inputCommand").autocomplete({
        minLength: 1, //最少多少开始搜索
        source: function (request, response) {
            var path = request.term;  //自身携带的是term key
            var requestData = {"path": path};
            if (path in cache) {
                response(cache[path]);
                return;
            }

            $.getJSON(headURL + pathSearchURL, requestData, function (data, status, xhr) { //requestData是组成的数据
                var content = data.content;
                cache[path] = content;
                response(content);
            });
        }
    });
});


//选择服务器  初始化加载
$(function () {
    selectServer();
    //给选择全部服务器绑定点击事件
    jQuery1_8("#selectAllServers").toggle(
        function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );

    //给确认选择主机绑定事件
    document.getElementById("selectedServers").onclick = function () {
        $("#showServersPannel").hide("fast");
        document.getElementById("shadow").style.display = "none";

        //获取选中的主机
        window.currentSelectedServers = [];//重置选中的主机
        $("#selectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
            //获取hostClass是为了读取主机，因为表里面有主机组的标签，用这个区分
            window.currentSelectedServers.push(this.getAttribute("value"));
        })
        createCRTWindow();//创建CRT窗口
    }

    //开启选择主机框事件
    document.getElementById("selectServersFilter").onclick = function () {
        $("#showServersPannel").show("fast");
        document.getElementById("shadow").style.display = "block";

    }

    //初始化选择服务器的弹出框的高度
    if (window.innerHeight < 737) {
        //修改iphone的时候的高度
        document.getElementById("iphoneBody").style.height = window.innerHeight + "px";


    }

})

function selectServer() {
    var hostGroups = [];
    window.currentSelectedServers = [];//存储呗选中的主机
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {  //大于-1标识找到了，否则就是没有找到
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var selectServerTbody = document.getElementById("selectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //循环读取主机组，并且显示对应的主机
        var tr = document.createElement("tr"); //每一行，包含的是主机组和对应的主机
        var td = document.createElement("td"); //用于显示主机组，主机组|主机A，主机B
        var groupSpan = document.createElement("span");//用于显示复选框
        groupSpan.className = "glyphicon glyphicon-check"//默认选中，这个是主机组
        groupSpan.style.cursor = "pointer";
        groupSpan.innerHTML = "&nbsp" + hostGroups[i];//显示值
        groupSpan.setAttribute("value", hostGroups[i]);//把值设置给属性
        //设置点击事件
        groupSpan.onclick = function () {
            if ($(this).hasClass("glyphicon-check")) {
                var td = $(this).parent();//td级别
                var tr = $(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")  //选中tr中所有span
            }
            else {
                var td = $(this).parent();//td级别
                var tr = $(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")

            }
        };
        td.appendChild(groupSpan);//把第span加入td，第一个位置主机组
        tr.appendChild(td);

        td = document.createElement("td");
        //需要循环处理N个主机
        for (h in window.allServersList) {//循环读取所有主机组对应的主机
            if (group === window.allServersList[h].group) {//匹配当前主机组的主机，显示
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-check hostClass"; //增加hostClass便于读取主机
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")

                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML = "&nbsp;" + window.allServersList[h].alias;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value", window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                td.appendChild(hostSpan);
                window.currentSelectedServers.push(window.allServersList[h]["id"]);
            }
        }
        tr.appendChild(td);
        selectServerTbody.appendChild(tr);
    }
    createCRTWindow();
}


//创建CRT窗口
function createCRTWindow() {
    var showCRTWindow = document.getElementById("showCRTWindow");
    showCRTWindow.innerHTML = ""//清空CRT窗口，避免重复显示
    var CRTWindowExample = document.getElementById("CRTWindowExample");
    for (var i = 0; i < window.currentSelectedServers.length; i++) {
        var id = window.currentSelectedServers[i];//取得ID
        for (var s = 0; s < window.allServersList.length; s++) {
            //获取对应的别名
            if (id == window.allServersList[s]["id"]) {
                var alias = window.allServersList[s]["alias"];
                break;
            }
        }
        //创建CRT
        var t = CRTWindowExample.cloneNode(true);
        t.setAttribute("id", id);//ajax访问后端的时候，需要使用这个sid
        $(t).addClass("CRT");//增加类，有js通过这个CRT类控制修改窗口大小
        $(t).find("h4")[0].textContent = alias;//表头修改为别名
        //t.removeAttribute("id");//删除样本HTML的id
        t.style.display = "block";
        showCRTWindow.appendChild(t);


    }
}


function loadCrond(team) {
    if (window.currentSelectedServers.length === 0) {
        showErrorInfo("请选择主机!");
        return false;
    }
    if (team.style.cursor === "not-allowed") {
        return false;//如果是禁用的情况下，则不执行
    }
    else {
        $("#CrondDiv").load("../html/crond.html").css({"display": "block"});  //command.html中的div需要显示，默认不显示，因为挡住了div层
        document.getElementById("shadow").style.display = "block";
    }
}


function enableCrond(team) {
    var addCrond = document.getElementById("addCrond");
    if (team.value.length > 0) {
        addCrond.style.cursor = "pointer";
    }
    else {
        addCrond.style.cursor = "not-allowed";

    }
}


function createMyCommandHistory(command) {
    var showCommandHistory = document.getElementById("showCommandHistory");
    //增加命令记录
    var label = document.createElement("label");
    label.className = "pull-left  label label-success";           //可以根据命令返回的状态生成绿色或者红色
    label.textContent = command;
    label.style.cssText = "position: relative;cursor:pointer;border-radius:5px;margin-left:5px;";
    label.onclick = function () {
        var inputCommand = document.getElementById("inputCommand");
        inputCommand.value = this.textContent;
        document.getElementById("inputCommand").focus();//输入框获取光标

    }

    showCommandHistory.appendChild(label);
}


function loadMyCommandHistory() {
    jQuery.ajax({
        "url": myCommandHistoryURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (data.status) {
                var content = data.content;
                for (var i = 0; i < content.length; i++) {
                    createMyCommandHistory(content[i]);
                }

            }
        }
    });
}


function processProgress(sid, content) {
    //显示命令结果
    try {


        if (content.content === "") {
            return false;
        }
        var crt = document.getElementById(sid);
        var pre = $(crt).find("pre")[0];
        var newPre = document.createElement("pre");
        newPre.style.background = "black";
        newPre.style.color = "white";
        newPre.style.border = "none";
        newPre.style.borderRadius = "0px;";
        newPre.style.padding = "0px";
        newPre.innerHTML = content.content;
        if (content.status == false) {
            newPre.style.color = "red";
        }
        if (window.currentCommand.match("^ *top")) {
            pre.innerHTML = "";
        }
        pre.appendChild(newPre);
        pre.scrollTop = pre.scrollHeight;//把滚动条设置到最底部，这样有更新的效果，跟CRT一样
    }
    catch (e) {
        console.log(e, "发生错误");
    }

}


//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getCommandResult(tid, sid) {
    return function () {
        //访问真正的目标函数
        getCommandResult(tid, sid);
    }
}


function getCommandResult(tid, sid) {
    var data = {"tid": tid, "sid": sid};
    jQuery.ajax({
        "url": getCommandResultURL,
        "dataType": "jsonp",
        "data": data,
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (data.status) {
                var progress = document.getElementById("commandProgress").style.width = data.progress + "%";    //显示进度
                var showProgress = document.getElementById("showCommandProgress").textContent = data.progress + "%";
                //if (data.content.stage === "running") {  //stage是running或者done
                if (data.progress <100) {  //stage是running或者done
                    //当前函数的阶段没有完成，继续获取
                    setTimeout(_getCommandResult(tid, sid), 1000);
                }

                if (data.progress == 100) {
                    $("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");
                    //$("#commandProgress").removeClass("active");  //进度条不要动画
                    document.getElementById("commandProgress").style.width = "0%";
                    document.getElementById("showCommandProgress").textContent = "0%";
                    document.getElementById("inputCommand").removeAttribute("disabled");
                    $("#execute").find("button")[0].removeAttribute("disabled");
                    document.getElementById("inputCommand").focus();
                    showSuccessNotic();
                }
                processProgress(sid, data.content);//显示消息
            }

        }
    });


}

function executeCommand(command, force) {


    //force是否强制执行
    var servers = window.currentSelectedServers;
    var data = {"cmd": command, "servers": servers};
    data["force"] = force;
    data["task_type"] = "cmd";
    data["multi_thread"] = true;

    document.getElementById("inputCommand").setAttribute("disabled", "disabled");   //命令未完成，禁用输入框
    $("#execute").find("button")[0].setAttribute("disabled", "disabled");   //命令未完成，禁用输入框
    //清除进度条
    try {
        document.getElementById("commandProgress").style.width = "0.1";
        document.getElementById("showCommandProgress").textContent = "0%";
        $("#commandProgress").addClass("active");
    }
    catch (e) {

    }
    //记录当前运行的命令
    window.currentCommand = command;
    data = JSON.stringify(data);
    window.ajax = jQuery.ajax({
        "url": executeCommandURL,
        "dataType": "jsonp",
        "data": {"parameters": data},
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                document.getElementById("inputCommand").removeAttribute("disabled");
                $("#execute").find("button")[0].removeAttribute("disabled");
                $("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");//动画
                showErrorInfo(data.content);
                return false;
            }
            //如果是命令拒绝
            if (data.ask) {
                //有交互提示
                startShadow();
                $("#confirmCommandDiv").show("fast");
                document.getElementById("showCommandWarn").innerHTML = data.content;
                return false;

            }
            if (data.status) {
                //增加之前先删除头一个，只记录5个
                if ($("#showCommandHistory").children().length >= 5) {
                    $("#showCommandHistory").children().eq(0).remove();
                }
                createMyCommandHistory(command);//增加显示命令历史

                var tid = data.content;

                for (var i = 0; i < window.currentSelectedServers.length; i++) {
                    getCommandResult(tid, window.currentSelectedServers[i]);
                }


            }


        }
    });

}


function startCommand() {
    //执行命令
    //给执行按钮换图标
    commandInput = document.getElementById("inputCommand");
    enableCrond(commandInput);
    command = commandInput.value;
    command = command.replace("\n", "");
    window.currentCommand = command;//用于记录当前执行的命令，主要使用在强制交互的地方
    commandInput.value = "";
    commandInput.focus();
    if (window.currentSelectedServers.length === 0) {
        showErrorInfo("您尚未选择服务器，请选择后再执行命令！")
        return false;
    }
    if (command == "clear") {
        document.getElementById("showCommandResult").innerHTML = "";
        return true;
    }
    else if (/^ *$/.test(command)) {
        showErrorInfo("请输入命令后执行!")
        return false
    }
    else if (/^ *(vi|vim|\/usr\/bin\/vim|\/bin\/vim|\/bin\/vi)/.test(command)){
        showErrorInfo(window.vimInfo);
	return false;
    }
    else if (/^ *(vi|vim|cd|\/usr\/bin\/vim|\/bin\/vim)/.test(command)){
        showErrorInfo(window.refuseInfo);
        return false;
    }

    else {
        if (command.match(/^ *top/)) {
            command = command + " -b";
        }
        $("#showExecuteRefresh").text("").addClass("fa-refresh fa fa-spin");//动画
        executeCommand(command, false);

    }


}
function _checkRequestConnect(rid) {
    return function () {
        //访问真正的目标函数
       checkRequestConnect(rid)
	}
}

function checkRequestConnect(rid){
	jQuery.ajax({
		"url":checkRequestConnectURL,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"data":{"rid":rid},
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var content=data.content;
				if (window.currentSelectedServers.length!==content.length){
					setTimeout(_checkRequestConnect(rid), 1000);
				}
				else{
					//所有链接已经完成
					document.getElementById("inputCommand").removeAttribute("disabled")
					
				}
			}
		}
	})
}

$(function () {
    //给点击计划任务绑定点击事件

    document.getElementById("addCrond").onclick = function () {
        loadCrond(this);
    }
    //计划任务按钮默认是禁用的

    //绑定命令清除按钮的点击事件


    //点击执行按钮
    document.getElementById("execute").onclick = function () {
        startCommand();

    }
    //命令输入框绑定事件
    //处理输入框
    document.getElementById("inputCommand").onkeyup = function () {
        if (event.keyCode === 13) {
            startCommand(this);
        }
    }


    //加载命令历史
    loadMyCommandHistory();

    //绑定命令确认框的关闭按钮
    document.getElementById("closeConfirmCommandButton").onclick = function () {
        stopShadow();
        $("#confirmCommandDiv").hide("fast");
        document.getElementById("shadow").style.display = "none";
        document.getElementById("inputCommand").removeAttribute("disabled");
        $("#execute").find("button")[0].removeAttribute("disabled");
        $("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");//动画
    }
    //绑定强制执行命令按钮
    document.getElementById("forceExecuteCommand").onclick = function () {
        stopShadow();
        command = document.getElementById("inputCommand").value;

        executeCommand(window.currentCommand, true);
        $("#confirmCommandDiv").hide("fast");

    }

    //处理CRT窗口的尺寸
    if (window.innerWidth < 737) {

        var CRT = document.getElementsByClassName("CRT");
        for (var i = 0; i < CRT.length; i++) {
            CRT[i].style.width = "98%";
        }

    }

    //绑定CRT全屏点击事件
    jQuery1_8("#fullScrenCRT").toggle(
        function () {
            //全屏
            $(".CRT").css({
                "width": "98%",
            })


        }, function () {
            //还原尺寸

            if (window.innerWidth > 737) {
                //半个屏幕
                $(".CRT").css({
                    "width": "48%",
                })
            }
            else {
                //手机是全屏
                $(".CRT").css({
                    "width": "98%",
                })
            }

        }
    );

    //输入框焦点


})
