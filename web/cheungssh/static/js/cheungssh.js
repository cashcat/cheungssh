

$(function(){
    //全局初始化 ,加载需要提前加载的数据
    initCheungSSH();

})






$(function () {
    $("#powerOff").click(function () {
        CheungSSHLogout();
        window.location.href = "static/html/login.html";
    });
})


function CheungSSHLogout() {
    jQuery.ajax({
        "url": headURL + logoutURL,
        "type": "get",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
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


$(function () {
    $("#loginButton").click(function () {

        document.getElementById("loginButton").textContent = "登录中...";
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        CheungSSHLogin(username, password);
        document.getElementById("loginButton").textContent = "登录";


    });

});


function searchServers() {
    var table = $("table").find("tbody tr");
    table.each(
        function () {
            var searchValue = document.getElementById("searchServers").value.toLowerCase();
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


$(document).on('keyup', '#searchServers', function () {
    searchServers();
});


$(document).on("click", "#loadServers", function () {
    loadServersConfigHTML();
})

$(document).on("click", "#home", function () {

    loadHome();
});
$(document).on("click","#command",function(){
    loadCommand()
})

$(document).on("click","#assetsInfo",function(){
    loadAssetsDataHTML();

})


$(document).on("click","#dockerImage",function(){
    loadDockerImageHTML();
})

function loadServersConfigHTML(){
    $("#showMainContent").load("static/html/servers.html");
}
function loadAssetsDataHTML(){
    $("#showMainContent").load("static/html/assetsData.html");
}
function loadDockerImageHTML(){
    $("#showMainContent").load("static/html/dockerImage.html");
}


$(document).on("click","#dockerContainer",function(){
    loadDockerContainerHTML();
})

function loadDockerContainerHTML(){
    $("#showMainContent").load("static/html/dockerContainer.html")
}


$(document).on("click","#loginLimit",function(){
    loadLoginLimitHTML();
})

$(document).on("click","#commandRecord",function(){

    loadCommandHistoryList();
})
function loadCommandHistoryList(){
    $("#showMainContent").load("static/html/commandHistory.html");
}
function loadLoginLimitHTML(){
    $("#showMainContent").load("static/html/loginSafe.html");
}

$(document).on("click","#commandBlack",function(){
    loadCommandBlackHTML();
})

function loadCommandBlackHTML(){
    $("#showMainContent").load("static/html/commandBlack.html");
}


$(document).on("click","#assetSettings",function(){

    loadAssetSettings();
})
function loadAssetSettings(){
    $("#showMainContent").load("static/html/assetSettings.html");
}
$(document).on("click","#crontab",function(){
    loadCrondLog();
})
$(document).on("click","#appExecute",function(){
    loadAppExecute();

})
$(document).on("click","#fileDownloadMenu",function(){
    //文件下载
    loadFileDownHTML();

})
$(document).on("click","#scriptMenu",function(){
    //脚本
    loadScriptHTML();
})
$(document).on("click","#webSSH",function(){
    loadWebSSHHTML();
})
$(document).on("click","#catRemoteFile",function(){
    loadRemoteFileHTML();
});
function loadAppExecute(){
    $("#showMainContent").load("static/html/appExecute.html");
}
function loadCrondLog(){
    $("#showMainContent").load("static/html/crondLog.html")
}








function loadScriptHTML(){
    $("#showMainContent").load("static/html/script.html");
}


function loadWebSSHHTML(){
    //$("#showMainContent").load(webSSHURL)
    window.open(webSSHURL);

}

function loadTrain(){
    $("#showMainContent").load("static/html/train.html");
}

function loadCommand(){
    $("#showMainContent").load("static/html/command.html");
}
function loadRemoteFileHTML(){
    $("#showMainContent").load("static/html/remoteFile.html");
}
function loadFileDownHTML(){
    $("#showMainContent").load("static/html/fileDownload.html")
}

function loadHome() {
    $("#showMainContent").load("static/html/home.html");
}


$(document).on("click","#appDeploy",function(){
    loadAppDeployHTML();
})

$(document).on("click","#train",function(){
	console.log(11111)
	loadTrain()
})

$(document).on("click","#oracle",function(){
	loadOracle();
})

function loadOracle(){
	$("#showMainCOntent").load("static/html/oracle.html")
}


$(document).on("click","#fileUploadMenu",function(){
    loadFileUploadHTML();
})
function loadAppDeployHTML(){
    $("#showMainContent").load("static/html/deploymentTable.html");
}


function loadFileUploadHTML(){
    $("#showMainContent").load("static/html/fileUpload.html");
}









//浏览器检查


$(function () {

	alert(1)
    var browserInfo = navigator.userAgent.toLowerCase();
	console.log(browserInfo)

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




function logoCheck() {
    //iphone 6p 最大是450
    if (window.innerWidth > 736) {
        cheungsshAnimate()

    }


}

//CheungSSH动画
setInterval(logoCheck, 3000);


$(function () {
    $("#profile").click(function () {
        $("#showMainContent").load("static/html/profile.html");
    });

});


function whoami(){
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
        document.getElementById("showUsername").innerHTML = data.content;
        window.whoami = data.content;
    }


}

//判断是否要显示logo
$(function () {
        if (window.innerWidth < 450) {
            document.getElementById("logo").style.display = "none";
            var sidebar = document.getElementById("sidebar");
            sidebar.style.display = "none";
            var mainContent = document.getElementById("showMainContent");
            mainContent.style.position = "absolute";
            mainContent.style.left = "0";


        }
    }
)

$(function () {
    var t = document.getElementById("profileMenu");
    jQuery1_8("#showProfileMenu").toggle(
        function () {
            t.style.display = "block";

        }, function () {
            t.style.display = "none";
        }
    );

})






function showSuccessNotic() {
    var element = "";

    if (window.innerWidth > 737) {
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


$(function () {
    jQuery1_8("#advanceOption").toggle(
        function () {
            if (window.innerWidth > 737) {
                $("#showEditListTail").slideDown("fast");
            }
            else {
                document.getElementById("showEditListTail").style.display = "block";//因为手机端反应慢，所以取消动画
            }
        }, function () {
            if (window.innerWidth > 737) {
                $("#showEditListTail").slideUp("fast");
            }
            else {
                document.getElementById("showEditListTail").style.display = "none";//因为手机端反应慢，所以取消动画

            }

        }
    );
});




















//必须默认加载服务器清单
function initGetServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        "dataType": "jsonp",
        "success": function(data){
            if (!responseCheck(data)){
                showErrorInfo(data.content);
            }
            else{
                window.allServersList=data.content;//全局服务器清单
            }
        },
        "error": errorAjax,
    });
}




function loadUserList(){
    //加载用户列表
    jQuery.ajax({
        "url":userListURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content)
                return false;
            }
            else{
                window.userList=data.content;//["guangzhou","beijing"]
            }
        }
    })


}

function createServerStatusTd(sid,data){
    //清除td中的label标签
    $("#"+sid).children().remove();
    var span=document.createElement("span");
    span.setAttribute("time",data.time);
    span.setAttribute("status",data.status);
    span.setAttribute("info",data.content);
    span.setAttribute("alias",data.alias);
    //绑定点击显示详细信息
    span.onclick=function(){
        $("#showServerCheckInfo").show("fast");
        document.getElementById("showCheckHost").textContent=this.getAttribute("alias");
        document.getElementById("showCheckTime").textContent=this.getAttribute("time");
        var status=this.getAttribute("status");
        var showCheckStatus= document.getElementById("showCheckStatus");
        var span=document.createElement("span");
        if(data.status=="success"){
            span.className="label label-success";
            span.textContent="正常"
        }
        else{
            span.className="label label-danger";
            span.textContent="失败"
        }
        $(showCheckStatus).children().remove();//删除此前的状态，避免重复
        showCheckStatus.appendChild(span);//加入新的状态信息
        document.getElementById("showCheckInfo").textContent=this.getAttribute("info");
        $("#showServerCheckInfo").show("fast");
        startShadow();


    }


    if(data.status=="success"){
        span.textContent="正常";
        span.className="label label-success";
        document.getElementById(sid).appendChild(span);
    }
    else if(data.status=="failed"){
        span.textContent="失败";
        span.className="label label-danger";
        document.getElementById(sid).appendChild(span);
        $("[data-toggle='tooltip']").tooltip();//绑定信息提示工具
    }
    else if(data.status=="checking"){
        var i=document.createElement("i");
        i.className="fa-refresh   fa-spin  fa fa-lg  fa-li";
        i.style.position="static";
        document.getElementById(sid).appendChild(i);

    }

}

function sshStatus(sid){
    //用来从数据库中请求服务状态信息的
    //在请求之前，就把显示图标修改为加载中

    jQuery.ajax({
        "url":sshStatusURL,
        "dataType":"jsonp",
        "data":{"sid":sid},
        "success":function(data){
            createServerStatusTd(sid,data);//获取消息后，创建html文档
        }
    });
}

function allSSHCheck(){
    for(var i=0;i<window.allServersList.length;i++){
        var sid=window.allServersList[i].id;
        sshStatus(sid);
    }
}


function mainContent(){
    //获取导航栏的高度
    //显示区域
    var navDivHeight=document.getElementById("header-dark").offsetHeight;
    var scrrenHeight=window.innerHeight;
    var showMainContent=document.getElementById("showMainContent");
    showMainContent.style.height=scrrenHeight-navDivHeight+"px";   //设置Main区域的高度为屏幕减去导航栏后的高度，全屏
}

window.onresize=function(){
    mainContent();
}




//所有页面加载前，必须加载此区域
function initCheungSSH(){
    whoami();//获取当前账户名
    loadUserList();//加载当前用户列表
    initGetServersList();
    //绑定关闭错误弹窗的按钮事件
    document.getElementById("closeButton").onclick=function(){

        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display="none";
    }
    mainContent();

    //绑定关闭按钮
    //背景图片高度
    var t = window.innerHeight-63;
    document.getElementById("showMainContent").style.height = t + "px";
    //后台守护，十分钟请求一次状态


}

