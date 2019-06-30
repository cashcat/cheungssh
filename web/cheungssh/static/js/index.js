/**
 * Created by 张其川CheungSSH on 2016/11/15.
 */



var menu = [
    {
        "主机配置": {
            "class": "glyphicon glyphicon-globe",
            "id": "loadServers"
        }
    },

    {
        "文件传输": {
            "class": "glyphicon glyphicon-transfer",
            "id": "fileTransfer",
            "subMenu": {

                "上传": {
                    "class": "glyphicon glyphicon-cloud-upload",
                    "id": "fileUploadMenu"
                },
                "下载": {
                    "class": "glyphicon glyphicon-cloud-download",
                    "id": "fileDownloadMenu"
                },

            }
        }
    },
	/*
    {
        "计划任务": {
            "class": "glyphicon glyphicon-time",
            "id": "crontab"
        }
    }, */
    {
        "脚本&批处理": {
            "class": "glyphicon glyphicon-superscript",
            "id": "scriptMenu"

        }
    },
	/*
    {
        "业务操作": {
            "class": "glyphicon glyphicon-briefcase",
            "id": "serviceOperation"

        }
    }, */
	/*
    {
        "操作审计": {
            "class": "glyphicon glyphicon-facetime-video",
            "id": "audit",
            "subMenu": {
                "命令记录": {
                    "class": "glyphicon glyphicon-console",
                    "id": "commandRecord"
                },
                "操作记录": {
                    "class": "glyphicon glyphicon-pencil",
                    "id": "operationRecord"
                },
                "登录记录": {
                    "class": "glyphicon glyphicon-user",
                    "id": "loginRecord"

                }
            }
        }

    },*/
    {
        // "设置": ["命令黑名单", "登录阈值"]
        "命令拦截": {
            "class": "glyphicon glyphicon-cog",
            "id": "settingsMenu",
            "subMenu": {
                "命令黑名单": {
                    "class": "glyphicon glyphicon-eye-open",
                    "id": "commandBlack"
                }
                ,
                "登录阈值": {
                    "class": "glyphicon glyphicon-eye-close",
                    "id": "loginLimit"
                }
            }
        }

    },
    {
        "远程文件": {
            "class": "glyphicon glyphicon-folder-open",
            "id": "remoteFile",
            "subMenu": {
                "文件": {
                    "class": "glyphicon glyphicon-list-alt",
                    "id": "catRemoteFile",
                },
            },
        },
    },/*
    {
        "代码发布": {
            "class": "glyphicon glyphicon-briefcase",
            "id": "appDeploy",
            "subMenu":{
                  "灰度发布":{
 			"class":"glyphicon glyphicon-credit-card",
			"id":"singleMode",
		   },
		   "批量发布":{
			"class":"glyphicon glyphicon-random",
			"id":"batchMode",
			}
            }
        }
    }, */
	/*
    {
        "发布计划": {
            "class": "glyphicon glyphicon-blackboard",
            "id": "deploymentCrontab",
        }
    }, */


];

$(document).on("click","#serviceOperation",function(){
    sectionColor(this);
    $("#showMainContent").load("../html/serviceOperation.html");
})

function showAndCloseSection(div) {
    //关闭点击div下一个兄弟元素
    //加颜色


    var nextDiv = $(div).next();
    if (nextDiv[0].style.display === "none") {
        $(div).parent().find(".fa").removeClass("fa-angle-right").addClass("fa-angle-down")
        $(nextDiv).slideDown("fast");
    }
    else {
        $(nextDiv).slideUp("fast");
        $(this).removeClass("fa-angle-right")
        $(div).parent().find(".fa").removeClass("fa-angle-down").addClass("fa-angle-right")

    }

}

function createMenu() {
    var menuDiv = document.getElementById("menu");
    for (var i = 0; i < menu.length; i++) {
        var section = menu[i];
        for (funcName in section) {
            var icon = section[funcName].class;
            var id = section[funcName].id
            var isSub = section[funcName].subMenu;
            var divFunc = document.createElement("div");
            var divLine = document.createElement("div");


            divLine.style.cssText = 'padding:10px;font-size:12px;cursor:pointer;position:relative'
            divLine.setAttribute("id", id);
            divLine.className = "sectionLine"
            var divPic = document.createElement("span");
            divPic.style.fontSize = "120%";
            divPic.className = icon;

            var divText = document.createElement("span");
            divText.textContent = funcName;
            divText.style.cssText = "font-size: 120%;margin-left: 15px;";


            divLine.appendChild(divPic);
            divLine.appendChild(divText);

            if (isSub) {
                divLine.onclick = function () {
                    showAndCloseSection(this);

                }
                var spanRight = document.createElement("span");
                spanRight.className = "fa fa-angle-right fa-2x ";
                spanRight.style.cssText = "right:10px;position:absolute;"
                divLine.appendChild(spanRight);
            }


            divFunc.appendChild(divLine);


            //子功能
            if (isSub) {
                var divSub = document.createElement("div");
                divSub.style.display = "none";
                for (subSectionName in  isSub) {
                    var id = isSub[subSectionName].id;
                    var icon = isSub[subSectionName].class;

                    var subDivLine = document.createElement("div");
                    subDivLine.style.cssText = 'padding:10px;font-size:12px;cursor:pointer;'
                    subDivLine.className = "sectionLine"
                    subDivLine.setAttribute("id", id);


                    var pic = document.createElement("span");
                    pic.className = icon;
                    pic.style.fontSize = "120%";

                    //字体部分
                    var text = document.createElement("span");
                    text.style.cssText = "font-size: 120%;margin-left: 15px;";
                    text.textContent = subSectionName;
                    text.style.cssText = "font-size: 120%;margin-left: 15px;";
                    subDivLine.appendChild(pic);
                    subDivLine.appendChild(text);
                    divSub.appendChild(subDivLine);


                }

                divFunc.appendChild(divSub);

            }


            menuDiv.appendChild(divFunc);


        }

    }
}


function screenFull() {
    //设置全屏高度
    document.getElementById("allMain").style.height = window.innerHeight + "px";
    //设置子页面和菜单的
    document.getElementById("menuAndSonePage").style.height = window.innerHeight - 50 + "px";
    //设置子页面的宽度
    document.getElementById("showMainContent").style.width = window.innerWidth - 190 + "px";
}

window.onresize = function () {
    screenFull();
}

$(function () {
    screenFull();
    createMenu();
    //绑定菜单关闭
    jQuery1_8("#showMenu").toggle(
        function () {
            $("#menu").animate({
                "left": "-180px",
            }, 300, function () {
                $("#showMainContent").css({
                    "position": "absolute",
                    "width": window.innerWidth + "px",
                })
            });
        }, function () {
            $("#showMainContent").css({
                "position": "relative",
                "width": window.innerWidth - 180 + "px",
            })
            $("#menu").animate({
                "left": "0px",
            }, 300);
        }
    )


})


//老版本js


$(function () {
    $("#powerOff").click(function () {
        CheungSSHLogout();
    });
})


function CheungSSHLogout() {
    jQuery.ajax({
        "url": headURL + logoutURL,
        "type": "get",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            window.location.href = "../html/login.html";
        }
    });
}

function CheungSSHLogin(username, password) {
    jQuery.ajax({
        "url": headURL + loginURL,
        "type": "POST",
        "error": errorAjax,
        "success": responseCheck,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "data": {"username": username, "password": password}
    });
}


function searchValue(input) {

    var searchValue = input.value.toLowerCase();
    var table = $("table").find("tbody tr");
    table.each(
        function () {
            // if(!searchValue)return false;
            var e = jQuery(this);
            var eValue = e.text().toLowerCase();
            if (!eValue.match(searchValue)) {
                e.hide();
            }
            else {
                e.show()
            }
        }
    );

};


function sectionColor(div) {
    //start_load_pic();
    $("#menu").find(".sectionLine").css({"background": ""});
    div.style.background = "#09c"
}
$(document).on("click", "#batchShell", function () {
    sectionColor(this);
    stop_load_pic();
    $("#showMainContent").load("../html/batch_shell.html");
})

$(document).on('keyup', '.searchValue', function () {
    searchValue(this);
});


$(document).on("click", "#loadServers", function () {
    sectionColor(this);
    stop_load_pic();
    loadServersConfigHTML();
})

$(document).on("click", "#home", function () {
    sectionColor(this)

    loadHome();
});
$(document).on("click", "#command", function () {
    sectionColor(this)
    loadCommand()
})

$(document).on("click", "#assetsInfo", function () {
    sectionColor(this)
    loadAssetsDataHTML();

})


$(document).on("click", "#dockerImage", function () {
    sectionColor(this)
    //showErrorInfo("您的当前版本不支持Docker功能，请购买商业版本");
    //return false;
    loadDockerImageHTML();
})

function loadServersConfigHTML() {
    $("#showMainContent").load("../html/servers.html");
}
function loadAssetsDataHTML() {
    $("#showMainContent").load("../html/assetsData.html");
}
function loadDockerImageHTML() {
    $("#showMainContent").load("../html/dockerImage.html");
}


$(document).on("click", "#dockerContainer", function () {
    sectionColor(this)
    //showErrorInfo("您的当前版本不支持Docker功能，请购买商业版本");
    //return false;
    loadDockerContainerHTML();
})

function loadDockerContainerHTML() {
    $("#showMainContent").load("../html/dockerContainer.html")
}


$(document).on("click", "#loginLimit", function () {
    sectionColor(this)
    loadLoginLimitHTML();
})

$(document).on("click", "#commandRecord", function () {
    sectionColor(this)

    loadCommandHistoryList();
})
function loadCommandHistoryList() {
    $("#showMainContent").load("../html/commandHistory.html");
}
function loadLoginLimitHTML() {
    $("#showMainContent").load("../html/loginSafe.html");
}

$(document).on("click", "#commandBlack", function () {
    sectionColor(this)
    loadCommandBlackHTML();
})

function loadCommandBlackHTML() {
    $("#showMainContent").load("../html/commandBlack.html");
}


$(document).on("click", "#assetSettings", function () {
    sectionColor(this)

    loadAssetSettings();
})
function loadAssetSettings() {
    $("#showMainContent").load("../html/assetSettings.html");
}
$(document).on("click", "#crontab", function () {
    sectionColor(this)
    loadCrondLog();
})
$(document).on("click", "#fileDownloadMenu", function () {
    sectionColor(this)
    //文件下载
    loadFileDownHTML();

})
$(document).on("click", "#scriptMenu", function () {
    sectionColor(this)
    //脚本
    loadScriptHTML();
})
$(document).on("click", "#webSSH", function () {
    sectionColor(this)
    loadWebSSHHTML();
})
$(document).on("click", "#catRemoteFile", function () {
    sectionColor(this)
    loadRemoteFileHTML();
});
function loadCrondLog() {
    $("#showMainContent").load("../html/crondLog.html")
}


function loadKeyFileAdminHTML() {
    $("#showMainContent").load("../html/uploadKeyFile.html");
}

function loadScriptHTML() {
    $("#showMainContent").load("../html/script.html");
}


function loadWebSSHHTML() {
    //$("#showMainContent").load(webSSHURL)
    window.open(webSSHURL);

}




function loadNetworkHTML(){
    $("#showMainContent").load("../html/network.html");

}


function loadTrain(){
	$("#showMainContent").load("../html/train.html");
}

$(document).on("click","#train",function(){
	loadTrain();
})

$(document).on("click","#oracle",function(){
	loadOracle();
})

$(document).on("click","#deploymentCrontab",function(){
    sectionColor(this)
	loadDeploymentCrontabHTML();
})
function loadOracle(){
	$("#showMainContent").load("../html/oracle.html");
}

function loadLoginSuccessHTML() {
    $("#showMainContent").load("../html/loginSuccess.html");
}

function loadDeploymentCrontabHTML(){
	$("#showMainContent").load("../html/deployment_crontab.html")
}
function loadCommand() {
    $("#showMainContent").load("../html/command.html");
}
function loadRemoteFileHTML() {
    $("#showMainContent").load("../html/remoteFile.html");
}
function loadFileDownHTML() {
    $("#showMainContent").load("../html/fileDownload.html")
}

function loadHome() {
    $("#showMainContent").load("../html/home.html");
}


function loadDeviceTable(){
    $("#showMainContent").load("../html/addDevice.html");
}

$(document).on("click","#operationRecord",function(){
    sectionColor(this)
    loadOperationRecordHTML();
})
$(document).on("click","#top",function(){
    sectionColor(this)
    loadNetworkHTML();
})


function loadOperationRecordHTML(){
    $("#showMainContent").load("../html/pageAccess.html");

}

$(document).on("click", "#loginRecord", function () {
    sectionColor(this)
    loadLoginSuccessHTML();

})

$(document).on("click", "#singleMode", function () {
    sectionColor(this)
    loadAppDeployHTML();

})


$(document).on("click","#batchMode",function(){
	sectionColor(this);
	loadBatchDeploymentHTML();
})


$(document).on("click", "#fileUploadMenu", function () {
    sectionColor(this)
    loadFileUploadHTML();
})

$(document).on("click","#addDevice",function(){
    sectionColor(this)
    loadDeviceTable();
})

function loadAppDeployHTML() {
    $("#showMainContent").load("../html/deploymentTable.html");
}


function loadBatchDeploymentHTML(){
	$("#showMainContent").load("../html/batchDeploymentTable.html");
}

function loadFileUploadHTML() {
    $("#showMainContent").load("../html/fileUpload.html");
}


//浏览器检查


$(function () {

    var browserInfo = navigator.userAgent.toLowerCase();

    if (!browserInfo.match(/webkit/)) {
        document.getElementById("showWarnContent").innerHTML = "很抱歉,您当前必须使用谷歌内核的浏览器操作CheugnSSH系统！" +
            "<br/> <a   id='showDetail' href='#' style='display:block;color:blue;font-weight: normal;'>详细信息 </a>  <span id='showDetailContent' style='display:none;color:black;font-weight: normal;'>1.支持带有谷歌内核的浏览器<br/>2.360浏览器的极速模式</span>";
        $(".closeDiv").show();

    }


});


$(function () {
    $("#showDetail").click(function () {
        $("#showDetailContent").toggle("slow");

    });


});


function whoami() {
    //获取当前账户名
    jQuery.ajax({
        "url": headURL + whoamiURL,
        "type": "get",
        "dataType": "jsonp",
        "success": showUsername,
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,

    });
}


function showUsername(data) {
    if (responseCheck(data)) {
        document.getElementById("showUsername").innerHTML = data.content + '<span class="caret"></span>';
        window.whoami = data.content;
    }


}


function showSuccessNotic(info) {
    var element = "";
    if (window.innerWidth > 737) {
        var t = document.getElementById("showSuccessNotic");
        if (info !== undefined) {
            //后端额外附加信息
            t.textContent = "操作成功," + info + "!";
        }
        else {
            t.textContent = "操作成功!";
        }
        $("#showSuccessNotic").slideDown("fast");
    }
    else {
        var t = document.getElementById("showSuccessNoticeIphone");
        t.style.display = "block";
    }
    element = t;
    setTimeout(function () {
        //element.style.display = "none"
        $("#showSuccessNotic").slideUp("slow");
    }, 2000)//三秒钟过后，自动消失

}


//必须默认加载服务器清单
function initGetServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        "dataType": "jsonp",
        "success": function (data) {
            if (!responseCheck(data)) {
                showErrorInfo(data.content);
            }
            else {
                window.allServersList = data.content;//全局服务器清单
            }
        },
        "error": errorAjax,
    });
}


function loadUserList() {
    //加载用户列表
    jQuery.ajax({
        "url": userListURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content)
                return false;
            }
            else {
                window.userList = data.content;//["guangzhou","beijing"]
            }
        }
    })


}






function createServerStatusTd(sid, data) {
    //清除td中的label标签
    try {
        $("#" + sid).children().remove();
        var span = document.createElement("span");
        span.setAttribute("time", data.time);
        span.setAttribute("status", data.status);
        span.setAttribute("info", data.content);
        span.setAttribute("alias", data.alias);
        //绑定点击显示详细信息
        span.onclick = function () {
            $("#showServerCheckInfo").show("fast");
            document.getElementById("showCheckHost").textContent = this.getAttribute("alias");
            document.getElementById("showCheckTime").textContent = this.getAttribute("time");
            var status = this.getAttribute("status");
            var showCheckStatus = document.getElementById("showCheckStatus");
            var span = document.createElement("span");
            if (data.status == "success") {
                span.className = "label label-success";
                span.textContent = "正常"
            }
            else {
                span.className = "label label-danger";
                span.textContent = "失败"
            }
            $(showCheckStatus).children().remove();//删除此前的状态，避免重复
            showCheckStatus.appendChild(span);//加入新的状态信息
            document.getElementById("showCheckInfo").textContent = this.getAttribute("info");
            $("#showServerCheckInfo").show("fast");
            startShadow();


        }


        if (data.status == "success") {
            span.textContent = "正常";
            span.className = "label label-success";
            document.getElementById(sid).appendChild(span);
        }
        else if (data.status == "failed") {
            span.textContent = "失败";
            span.className = "label label-danger";
            document.getElementById(sid).appendChild(span);
            $("[data-toggle='tooltip']").tooltip();//绑定信息提示工具
        }
        else if (data.status == "checking") {
            var i = document.createElement("i");
            i.className = "fa-refresh   fa-spin  fa fa-lg  fa-li";
            i.style.position = "static";
            document.getElementById(sid).appendChild(i);

        }
    }
    catch (e) {
        console.log(e, "SSHcheck离开");

    }


}

function sshStatus(sid) {
    //用来从数据库中请求服务状态信息的
    //在请求之前，就把显示图标修改为加载中

    jQuery.ajax({
        "url": sshStatusURL,
        "dataType": "jsonp",
        "data": {"sid": sid},
        "success": function (data) {
            createServerStatusTd(sid, data);//获取消息后，创建html文档
        }
    });
}

function allSSHCheck() {
    for (var i = 0; i < window.allServersList.length; i++) {
        var sid = window.allServersList[i].id;
        sshStatus(sid);
    }
}

//获取操作系统版本类型
function getSystemVersion(){
	jQuery.ajax({
		"url":getSystemVersionURL,
		"error":errorAjax,
		"dataType":"jsonp",
		"type":"GET",
		"success":function(data){
			responseCheck(data)
			if (!data.status){
				showErrrorInfo(data.content);
				return false;
			}
			else{
				content=data.content;
				$("#system").children().remove();//清空
				var system=document.getElementById("system");
				for(var i=0;i<content.length;i++){
					var option=document.createElement("option");
					option.textContent=content[i];
					system.appendChild(option);
				}
				
			}
		}
	})
}

//所有页面加载前，必须加载此区域
function initCheungSSH() {
    whoami();//获取当前账户名
    loadUserList();//加载当前用户列表
    initGetServersList();
    //绑定关闭错误弹窗的按钮事件
    document.getElementById("closeButton").onclick = function () {

        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display = "none";
    }


}


function loginUserNotify() {
    //用户通知
    jQuery.ajax({
        "url": getLoginUserNotifyURL,
        "dataType": "jsonp",
        "data": {"session_index": window.sessionIndex},
        //"error": errorAjax,
        "success": function (data) {
            if (!data.status) {
                //showErrorInfo(data.content);
                return false;
            }
            else {
                var sessionIndex=data.content.session_index;
                window.sessionIndex=sessionIndex;
                var content = data.content.data;//数据格式是[{},{}]
                var loginNotify = document.getElementById("loginNotify");
                if (loginNotify.parentNode.style.display == "block") {
                    //如果当前还在显示中，那么就不删除，继续追加显示
                }
                else {
                    //否则不是在显示中，就删除历史数据
                    $(loginNotify).children().remove();
                }
                for (var i = 0; i < content.length; i++) {
                    //循环每一行
                    //追加信息
                    //用户名

                    //label 用户名
                    var div=document.createElement("div");
                    div.className="input-group clearfix";
                    div.style.cssText="width: 100%;";
                    var label=document.createElement("label");
                    label.className="label control-label col-md-3";
                    label.style.color="black";
                    label.textContent="用户名";
                    div.appendChild(label);
                    //值
                    var valueDiv=document.createElement("div");
                    valueDiv.className="col-md-9";
                    valueDiv.textContent=content[i].owner;
                    div.appendChild(valueDiv);
                    loginNotify.appendChild(div);



                    //lable ip地址
                    var div=document.createElement("div");
                    div.className="input-group clearfix";
                    div.style.cssText="width: 100%;";
                    var label=document.createElement("label");
                    label.style.color="black";
                    label.className="label control-label col-md-3";
                    label.textContent="IP";
                    div.appendChild(label);
                    //值
                    var valueDiv=document.createElement("div");
                    valueDiv.className="col-md-9";
                    valueDiv.textContent=content[i].ip;
                    div.appendChild(valueDiv);
                    loginNotify.appendChild(div);




                    //ip归属地
                    var div=document.createElement("div");
                    div.className="input-group clearfix";
                    div.style.cssText="width: 100%;";
                    var label=document.createElement("label");
                    label.className="label control-label col-md-3";
                    label.style.color="black";
                    label.textContent="地区";
                    div.appendChild(label);
                    //值
                    var valueDiv=document.createElement("div");
                    valueDiv.className="col-md-9";
                    valueDiv.textContent=content[i].ip_locate;
                    div.appendChild(valueDiv);
                    loginNotify.appendChild(div);





                    //时间
                    var div=document.createElement("div");
                    div.className="input-group clearfix";
                    div.style.cssText="border-bottom: 1px solid lightsteelblue;width: 100%;margin-bottom:5px;";
                    var label=document.createElement("label");
                    label.className="label control-label col-md-3";
                    label.style.color="black";
                    label.textContent="时间";
                    div.appendChild(label);
                    //值
                    var valueDiv=document.createElement("div");
                    valueDiv.className="col-md-9";
                    valueDiv.textContent=content[i].time;
                    div.appendChild(valueDiv);
                    loginNotify.appendChild(div);


                }
                //如果有数据，并且当前的通知面板是影藏的，则显示，否则不做处理

		loginNotify.parentNode.scrollTop = loginNotify.parentNode.scrollHeight;//把滚动条设置到最底部
		var t=document.getElementById("loginNotifyParent");
		if(content.length>0  && t.style.display=="none"){
			t.style.display="block";
			$(t).animate({
			"bottom":"0px"
			})
			
                }

            }
        }
    });
}



function loadMasterDeviceList(){
    //加载骨干网络设备
    jQuery.ajax({
        "url":getDeviceURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){
            responseCheck(data)
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                window.allDeviceList=data.content;
            }
        }
    });
}


function  privateTopology(){
    //私有拓扑图
    jQuery.ajax({
        "url":myTopologyURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                window.myTopologyProfile=data.content;
            }
        }
    });
}

$(function () {
    //全局初始化 ,加载需要提前加载的数据
    initCheungSSH();
    //绑定后台登录页面
    document.getElementById("admin").onclick = function () {
        $("#showMainContent").load("/cheungssh/admin/")
    }

    //绑定点击通知面板影藏
    document.getElementById("loginNotifyPannel").onclick=function(){
        $(this.parentNode).animate({
		"bottom":"-200px"
        },function(){
		this.style.display="none";
        })
    }







})


