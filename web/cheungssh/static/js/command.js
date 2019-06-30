function getKey(key) {
    // 获取URL中?之后的字符  
    var str = location.search;
    str = str.substring(1,str.length);

    // 以&分隔字符串，获得类似name=123这样的元素数组  
    var arr = str.split("&");
    var obj = new Object();

    // 将每一个数组元素以=分隔并赋给obj对象      
    for(var i = 0; i < arr.length; i++) {
        var tmp_arr = arr[i].split("=");
        obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
    }
    return obj[key];
}


//命令搜索
/*
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

*/

//创建CRT窗口
function createCRTWindow(data) {
    var showCRTWindow = document.getElementById("showCRTWindow");
    var CRTWindowExample = document.getElementById("CRTWindowExample");
    var serverList=getKey("serverList")
    serverList = JSON.parse(serverList)
    for (var i = 0; i < serverList.length; i++) {
	//取得ID
	var sid = serverList[i]["sid"];
	var username = serverList[i]["username"];
	var alias = serverList[i]["alias"];
        //创建CRT
        var t = CRTWindowExample.cloneNode(true);
        t.setAttribute("id", sid);//ajax访问后端的时候，需要使用这个sid
        t.setAttribute("tid", data.tid);//ajax访问后端的时候，需要使用这个sid
        $(t).addClass("CRT");//增加类，有js通过这个CRT类控制修改窗口大小
        $(t).find(".title")[0].textContent = username + "@" + alias;//表头修改为别名
        //t.removeAttribute("id");//删除样本HTML的id
        t.style.display = "block";
	$(t).find("pre").html(data.content[data.tid  + "." + sid]["content"])
	if (data.content[data.tid + "." +sid]["status"] === false){
		$(t).find("pre").css({"color":"red"})
		t.setAttribute("status",false)
	}
	else{
		t.setAttribute("status",true)
	}
        showCRTWindow.appendChild(t);
    }
    	showSuccessNotice("已就绪,可以执行命令。");
	document.getElementById("inputCommand").removeAttribute("disabled")
	document.getElementById("inputCommand").focus()
	var cmd = getKey("cmd")
	if (cmd !== undefined){
		startCommand(cmd)
	}
}



function createMyCommandHistory(command) {
    var showCommandHistory = document.getElementById("showCommandHistory");
    //增加命令记录
    var label = document.createElement("label");
    label.className = "pull-left  label label-success";           //可以根据命令返回的状态生成绿色或者红色
    label.textContent = command;
    label.style.cssText = "position: relative;cursor:pointer;border-radius:5px";
    label.onclick = function () {
        var inputCommand = document.getElementById("inputCommand");
        inputCommand.value = this.textContent;
        document.getElementById("inputCommand").focus();//输入框获取光标

    }

    showCommandHistory.appendChild(label);
    var i=0;
    $("#showCommandHistory").find("label").each(function(){
	i += 1
	if( i >1 ){
		this.style.marginLeft="5px"
	}
    })
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


function processProgress(sid, content,stage) {
    //显示命令结果
    try {
        if (content.content === "") {
            return false;
        }
        var crt = document.getElementById(sid);
        var pre = $(crt).find("pre")[0];
	var length=window.currentCommand.split(" ")[0].split("/").length-1
        if (window.currentCommand.split(" ")[0].split("/")[length] === "top" && content.status !== false) {
		//上述不包括top|grep Sw,但是包括 top |  grep Sw
		//接收到的新消息
		var recvContent = (window.topContentMemory[sid] + content.content).split(/top \- /)
		var recvContentLength = recvContent.length;
		//用内存记录下剩余的收到的数据，一次显示一页
		window.topContentMemory[sid] = recvContent.slice(1,recvContentLength).join("\r\n")
		if (recvContent[0].match(/^[0-9]{2}:[0-9]{2}:[0-9]{2} up/)){
			//处理
		}
		else{
			//断页,留待下一次显示
			return false;
		}
		if (window.currentCommand.match(/top[ a-zA-Z0-9\-]{0,}\|/)){
			//存在过滤,页面补充
			pre.innerHTML = pre.innerHTML + content.content;
		}
		else{
				pre.innerHTML = "top - " + recvContent[0]
		}
        }
	else{
        	if (content.status == false) {
			var html = "<span style='color:red'>" +  content.content + '</span>'
		}
		else{
			var html = content.content;
		}
		pre.innerHTML += html
	}
        if (window.currentCommand.split(" ")[0].split("/")[length] === "top") {
		pre.scrollTop = pre.scrollTop;//把滚动条设置到最顶部部，这样有更新的效果，跟CRT一样
	}
	else{
		pre.scrollTop = pre.scrollHeight;//把滚动条设置到最底部，这样有更新的效果，跟CRT一样
	}
    }
    catch (e) {
        console.log(e, "发生错误");
    }

}


function _markSSHAsActive() {
    return function () {
        //访问真正的目标函数
        markSSHAsActive();
    }
}

function markSSHAsActive(){
	var serversList = []
	var CRT = $(".CRT").each(function(){
		if (this.getAttribute("status") === "true"){
			serversList.push(this.getAttribute("tid")+ "." + this.getAttribute("id"))
		}
	})
	if (serversList.length === 0){
		//无服务器有效
		return false;
	}
	jQuery.ajax({
		"url":markSSHAsActiveURL,
		"data":{"hosts":JSON.stringify(serversList)},
		"dataType":"jsonp",
		"success":function(data){
			if(data.status){
				setTimeout(_markSSHAsActive(),800000)
			}
		}
	})
}

//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getCommandResult(tid) {
    return function () {
        //访问真正的目标函数
        getCommandResult(tid);
    }
}


function getCommandResult(tid) {
    jQuery.ajax({
        "url": getCommandResultURL,
        "dataType": "jsonp",
        "data": {"tid":tid},
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (data.status) {
                var progress = document.getElementById("commandProgress").style.width = data.progress + "%";    //显示进度
                var showProgress = document.getElementById("showCommandProgress").textContent = data.progress + "%";
                //if (data.content.stage === "running") {  //stage是running或者done
                for(sid in data.content){
			var content=data.content[sid]
			var stage = data.content[sid].stage
                	//processProgress(sid, data.content,data.content.stage);//显示消息
                	processProgress(sid, content,stage);//显示消息
		}
                if (data.progress == 100) {
                    //$("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");
                    //$("#commandProgress").removeClass("active");  //进度条不要动画
                    //document.getElementById("inputCommand").removeAttribute("disabled");
                    //$("#execute").find("button")[0].removeAttribute("disabled");
                    document.getElementById("inputCommand").focus();
                   // showSuccessNotice("所有机器已执行完毕");
                }
                else{  //stage是running或者done
                    //当前函数的阶段没有完成，继续获取
                    setTimeout(_getCommandResult(tid), 1000);
                }
            }
            else{
			showErrorInfo(data.content)
			return false;
	    }
        }
    });


}
function _getLoginProgress(tid) {
    return function () {
        //访问真正的目标函数
        getLoginProgress(tid);
    }
}

function getLoginProgress(tid) {
	jQuery.ajax({
		"url":getLoginProgressURL,
		"data":{"tid":tid},
		"error":errorAjax,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			if(data.progress<100){
				var info = "已完成" + data.progress + "%"
				start_load_pic(info)
                    		setTimeout(_getLoginProgress(tid), 1000);
			}
			else{
				stop_load_pic()
				window.loginServerRquestId = tid
				createCRTWindow({"content":data.content,"tid":tid})
				setTimeout(_markSSHAsActive(),800000) //后端900秒
			}
		}
	})


}
function loginServerRequest() {
	var serverList=getKey("serverList");
	var data= {}
	serverList=JSON.parse(serverList)
	var servers=[];
	for (var i=0;i<serverList.length;i++){
		servers.push(serverList[i]["sid"])
	}
	data["multi_thread"] = true;
	data["request_type"] = "login"
	data["hosts"] = servers
	data = JSON.stringify(data)
    jQuery.ajax({
        "url": loginServerRquestURL,
	"type":"GET",
	"dataType":"jsonp",
        "data": {"parameters": data},
	"beforeSend":start_load_pic,
	"complete":stop_load_pic,
	"error":errorAjax,
        "success": function (data) {
		responseCheck(data);
		if (!data.status) {
			showErrorInfo(data.content);
			return false;
            	}
		getLoginProgress(data.tid)

        }
    });

}

function executeCommand(command, force) {
	document.getElementById("commandProgress").style.width = "5%";
	document.getElementById("showCommandProgress").textContent = "0%";
	var serversList = []
	var CRT = $(".CRT").each(function(){
		if (this.getAttribute("status") === "true"){
			serversList.push(this.getAttribute("id"))
		}
	})
	if (serversList.length === 0){
		showErrorInfo("主机不可用，您可以尝试刷新页面以再次登录。")
		return false;
	}
	var data = {"cmd": command, "hosts": serversList,"request_type":"cmd",tid: window.loginServerRquestId};
	//force是否强制执行
	data["force"] = force;
	data["task_type"] = "cmd";
	data["multi_thread"] = true;

    //document.getElementById("inputCommand").setAttribute("disabled", "disabled");   //命令未完成，禁用输入框
    //$("#execute").find("button")[0].setAttribute("disabled", "disabled");   //命令未完成，禁用输入框
    //清除进度条
    /*try {
        document.getElementById("commandProgress").style.width = "0.1";
        document.getElementById("showCommandProgress").textContent = "0%";
        $("#commandProgress").addClass("active");
    }
    catch (e) {

    }*/
    //记录当前运行的命令
    window.currentCommand = command;
    data = JSON.stringify(data);
    window.ajax = jQuery.ajax({
        "url": executeCommandURL,
        "dataType": "jsonp",
        "data": {"parameters": data},
	"error":errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                document.getElementById("inputCommand").removeAttribute("disabled");
                //$("#execute").find("button")[0].removeAttribute("disabled");
                //$("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");//动画
                showErrorInfo(data.content);
                return false;
            }
            //如果是命令拒绝
            if (data.ask  ===  true) {
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

 		getCommandResult(window.loginServerRquestId);


            }


        }
    });

}


function startCommand(command) {
    //执行命令
    //给执行按钮换图标
    if(command===null){
	    commandInput = document.getElementById("inputCommand");
	    //enableCrond(commandInput);
	    command = commandInput.value;
	    command = command.replace("\n", "");
	    command = command.replace(/^ */, "");
    		commandInput.value = "";
    		commandInput.focus();
    }
    window.currentCommand = command;//用于记录当前执行的命令，主要使用在强制交互的地方
    if (command == "clear") {
        $(".CRT").each(function(){
		if(this.getAttribute("status") === "true"){
			$(this).find("pre").html("")
		}
	})
        return true;
    }
    else if (/^ *$/.test(command)) {
        return false
    }
    var tmp = command.split(" ")
    var t = tmp[0]
    var t = t.split("/")
    if(t[(t.length-1)] === "vim" || t[t.length-1] === "vi"){
    	var serverList=getKey("serverList")
    	serverList = JSON.parse(serverList)
	window.opener.$("#showMainContent").load("../html/remoteFile.html")
	window.opener.document.getElementById("remoteFile").click()
	window.opener.$("#menu").find(".sectionLine").css({"background": ""});
	window.opener.document.getElementById("catRemoteFile").style.background = "#09c"
	if (serverList.length===1){
		if (tmp.length===1){
			return false;
		}
		var path = tmp[1]
		if(path.match(/^ *$/)){
			showErrorInfo("路径不能为空！")
			return false;
		}
		var s= JSON.parse(getKey("serverList"))[0]
		var server = s.sid
		var alias = s.alias
		window.opener.getRemoteFileSetValue(path,server,alias,"")
	}
	else{
		//
	}
	window.opener.welcome()
	return false;
    }

 	//$("#showExecuteRefresh").text("").addClass("fa-refresh fa fa-spin");//动画
	var length=command.split(" ")[0].split("/").length-1
        if (command.split(" ")[0].split("/")[length] === "top") {
		//$("#showCRTWindow").find("pre").html("")
		$(".CRT").each(function(){
			if(this.getAttribute("status") === "true"){
				$(this).find("pre").html("")
			}
		})
		serverList=JSON.parse(getKey("serverList"))
		//存储已接收到的所有消息
		window.topContentMemory=[]
		for (var i=0;i<serverList.length;i++){
			//给每一个服务器开辟出一个空的空间存储所有top内容
			window.topContentMemory[serverList[i]["sid"]] = ""
		}
	}
	executeCommand(command, false);


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
function breakCommand(){
	var serversList = []
	var CRT = $(".CRT").each(function(){
		if (this.getAttribute("status") === "true"){
			serversList.push(this.getAttribute("id"))
		}
	})
	if (serversList.length === 0){
		return false;
	}
	var data = {"cmd": "BREAK-COMMAND", "hosts": serversList,"request_type":"break",tid: window.loginServerRquestId};
    data = JSON.stringify(data);
    window.ajax = jQuery.ajax({
        "url": executeCommandURL,
        "dataType": "jsonp",
        "data": {"parameters": data},
	"error":errorAjax,
	"beforeSend":start_load_pic,
	"complete":stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                document.getElementById("inputCommand").removeAttribute("disabled");
                showErrorInfo(data.content);
                return false;
            }
            if (data.status) {
		showSuccessNotice("已中断执行")
            }
        }
    });
}

//点击执行按钮
document.getElementById("execute").onclick = function () {
	startCommand(null);
}

document.getElementById("inputCommand").onkeyup = function () {
	if (event.keyCode === 13) {
		startCommand(null);
	}
}
document.getElementById("break").onclick=function(){
	breakCommand()
}
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
$(function () {
	document.getElementById("inputCommand").focus();
    	//加载命令历史
    	//loadMyCommandHistory();
	loginServerRequest()
})
