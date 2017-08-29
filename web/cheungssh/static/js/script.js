/**
 * Created by 张其川 on 2016/10/9.
 */



function loadScriptList() {
    jQuery.ajax({
        "url": scriptListURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            //data是一个dict
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var scripts = data.content;
                for (var filename in scripts) {
                    var line = scripts[filename];
                    createScriptTableLine(line);
                }
            }
        }
    });
}

function showScriptContent(filename,owner) {
    //显示脚本内容
    //焦点
    jQuery.ajax({
        "url": getScriptContentURL,
        "dataType": "jsonp",
        "data": {"filename": filename,"owner":owner},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var content = data.content;
                var scriptContent = document.getElementById("scriptContent");//textarea显示脚本
                $(scriptContent).val(content);//这里不能用html，content，因为他的值区域不同，所以读取的时候可能读不到，必须用val
                document.getElementById("scriptArea").style.display = "block";//显示隐藏的文本框
                $("#scriptArea").animate({
                    "top": "0%",
                })
                $("#scriptContent").setTextareaCount();


            }
        }
    });

}


function createScriptTableLine(data) {
    //创建脚本表格，每一行
    var showScriptTbody = document.getElementById("showScriptTbody");
    var tr = document.createElement("tr");
    //脚本名
    var script = document.createElement("td");
    script.textContent = data["script"];
    tr.appendChild(script);
    //归属
    var owner = document.createElement("td");
    owner.textContent = data['owner'];
    tr.appendChild(owner);
    //创建时间
    var time = document.createElement("td");
    time.className = "hidden-xs";
    time.textContent = data["time"];
    tr.appendChild(time);
    //操作按钮
    //编辑脚本按钮
    var opTd = document.createElement("td");
    var editButton = document.createElement("button");
    editButton.className = " btn btn-xs btn-primary  glyphicon glyphicon-eye-open";
    editButton.setAttribute("owner",data["owner"])
    editButton.setAttribute("filename", data["script"]);
    editButton.onclick = function () {
	window.currentEditScriptContentButton=this;
        var filename = this.getAttribute("filename");
        var owner = this.getAttribute("owner");
        showScriptContent(filename,owner);
        document.getElementById("scriptContent").focus();
        document.getElementById("writeScriptContent").setAttribute("filename", filename);//绑定提交按钮的属性
    }
    opTd.appendChild(editButton);
    tr.appendChild(opTd);
    //删除按钮
    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
    deleteButton.setAttribute("filename", data["script"]);
    deleteButton.style.marginLeft = "3px";
    deleteButton.onclick = function () {
        deleteScript(this);
    }
    opTd.appendChild(deleteButton);
    tr.appendChild(opTd);
    //执行按钮
    var startButton = document.createElement("button");
    startButton.className = "btn btn-xs btn-success glyphicon glyphicon-play-circle";
    startButton.setAttribute("filename", data["script"]);
    startButton.style.marginLeft = "3px";
    startButton.onclick = function () {
        //启用选择服务器的下一步
        document.getElementById("scriptResultLoad").style.display = "none";//不显示加载脚本执行结果的图标
        document.getElementById("goParameter").removeAttribute("disabled");
        //关闭参数按钮
        document.getElementById("goInit").setAttribute("disabled","disabled");
        $("#goRun").parent()[0].setAttribute("disabled", "disabled");//禁用执行按钮
        $("#goRun").text("执行").removeClass("fa fa-spin fa-refresh");

        window.currentRunScriptName = this.getAttribute("filename");//当前需要运行的脚本名字
        $('#myTab li:eq(0) a').tab('show') // Select third tab (0-indexed)
        scriptSelectServer();//开启脚本选择服务器
    }
    opTd.appendChild(startButton);
    tr.appendChild(opTd);

    //最后加入表格
    showScriptTbody.appendChild(tr);
}

function deleteScript(deleteButton) {
    //删除脚本，deleteButton是删除按钮，有filename属性
    var filename = deleteButton.getAttribute("filename");
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteScriptURL,
        "dataType": "jsonp",
        "data": {"filename": filename},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                $(tr).remove();//删除表格的行
            }
        }
    });

}

function initScriptDropZ() {
    var dropz = new Dropzone("#uploadScriptDropz", {
        url: uploadScriptToCheungSSH,
        clickable: false,//取消点击
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        window.fileUploadLocalFileName = file.name;//拖动上传的文件名;
        startShadow();
        var showScriptProgressText = document.getElementById("showScriptProgressText");
        showScriptProgressText.innerText = 0 + "%";
        showScriptProgressText.style.width = "0%";
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "0%",
            }
        );

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var showScriptProgressText = document.getElementById("showScriptProgressText");
        progress = parseInt(progress);
        if (isNaN(progress)) {
            //表示上传失败
            showErrorInfo("不能连接到服务器")
            return false;
        }
        showScriptProgressText.innerText = progress + "%";
        showScriptProgressText.style.width = progress + "%";
    });
    dropz.on("success", function (file, data) {
        //上传成功,data是服务器返回的消息
        stopShadow();
        $("#dropz").slideUp("fast");//关闭上传界面
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "120%",
            }
        ); //关闭进度显示
        data = JSON.parse(data);
        if (!data.status) {
            showErrorInfo(data.content);
            return false;
        }
        var content = data.content;
        createScriptTableLine(content);//创建一行新的


    })
    //https://www.renfei.org/blog/dropzone-js-introduction.html
}


function submitScriptContent() {
    //提交脚本内容
    var content = $("#scriptContent").val();
    var filename = document.getElementById("writeScriptContent").getAttribute("filename");
    jQuery.ajax({
        "url": writeScriptContentURL,
        "type": "POST",
        "data": {"filename": filename, "content": content},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            data = JSON.parse(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                $("#scriptArea").animate({
                    "top": "100%",
                }, function () {
                    document.getElementById("scriptArea").style.display = "none";
                });//关闭编辑框
                //创建行
                //删除旧的行
                try{
                	$(window.currentEditScriptContentButton.parentNode.parentNode).remove();
		}
		catch(e){
			//新增脚本可能报错
		}
                createScriptTableLine(data.content);
            }
        }
    });
}


function scriptSelectServer() {
    $("#scriptDIV").show("fast");
    $("#scriptSelectServerTbody").children().remove();//删除上次创建的HTML，避免重复
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
    var scriptSelectServerTbody = document.getElementById("scriptSelectServerTbody");
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
        scriptSelectServerTbody.appendChild(tr);
    }
}


(function ($) {
    //tab制表符
    $.fn.extend({
        insertAtCaret: function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
            }
            else {
                this.value += myValue;
                this.focus();
            }
        }
    })
})(jQuery);

function goInit() {
    $('#myTab li:eq(2) a').tab('show') // 显示初始化界面
    //修改执行按钮为加载图标
    $("#goRun").text("").addClass("fa fa-spin fa-refresh");
    createInitScriptProgress();//创建脚本初始化界面
    //开始请求
    startScriptInit();


}

//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getScriptInitProgress(label, tid, dfile, sid) {
    return function () {
        //访问真正的目标函数
        getScriptInitProgress(label, tid, dfile, sid);
    }
}

function getScriptInitProgress(label, tid, dfile, sid) {
    //label是显示alias的标签
    //获取脚本初始化的进度
    jQuery.ajax({
        "url": getFileTransProgressURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "data": {"tid": tid},
        "success": function (data) {
            if (!data.status) {
                var progressDiv = $(label).siblings().remove();//删除进度条
                var parent = $(label).parent()[0];//父级元素，下面有label和error/progress的html
                var errLable = document.createElement("label");//新建的显示错误信息的标签
                errLable.className = "label label-danger";//定义样式
                errLable.textContent = data.content;
                parent.appendChild(errLable);//把错误标签加入文档
                window.failedScriptInitNum += 1;
            }
            else {
                var progress = parseInt(data.progress);
                if (progress < 100) {
                    var progressDiv = $(label).siblings()[0];//progress区域
                    var sonProgressDiv = $(progressDiv).children()[0];
                    sonProgressDiv.style.width = progress + "%";
                    sonProgressDiv.textContent = progress + "%";
                    setTimeout(_getScriptInitProgress(label, tid, dfile, sid), 1000);
                }
                else {
                    //显示成功
                    //停止动态加载图标
                    //document.getElementById("scriptResultLoad").style.display="none";//
                    var parent = $(label).parent()[0];
                    $(label).siblings().remove();//删除原来的进度条
                    var successLabel = document.createElement("label");
                    successLabel.className = "label label-success";
                    successLabel.textContent = "成功";
                    parent.appendChild(successLabel);
                    info = {
                        "sid": sid,
                        "dfile": dfile,
                    };
                    window.successScriptInit.push(info);//记录成功的服务器

                }
            }
        }
    });
}

function startScriptInit() {
    //启动初始化
    var inputScriptParameter = document.getElementById("inputScriptParameter").value;//脚本的参数
    window.successScriptInit = [];//[{"sid":111,"dfile":dfile}] 存储脚本初始化成功的服务器和对应的脚本名
    window.failedScriptInitNum = 0;//脚本初始化失败的个数
    window.runScriptInitServerNum = $("#scriptInit").find("label").length;//记录需要运行脚本初始化的主机数量
    $("#scriptInit").find("label").each(function () {
        //this是label标签
        var sid = this.getAttribute("sid");
        var label = this;
        jQuery.ajax({
            "url": scriptInitURL,
            "data": {"sfile": window.currentRunScriptName, "parameter": inputScriptParameter, "sid": sid},
            "error": errorAjax,
            "dataType": "jsonp",
            "success": function (data) {
                if (!data.status) {
                    var progressDiv = $(label).siblings().remove();//删除进度条
                    var parent = $(label).parent()[0];//父级元素，下面有label和error/progress的html
                    var errLable = document.createElement("label");//新建的显示错误信息的标签
                    errLable.className = "label label-danger";//定义样式
                    errLable.textContent = data.content;
                    parent.appendChild(errLable);//把错误标签加入文档
                    window.failedScriptInitNum += 1;
                }
                else {
                    var tid = data.tid;
                    var dfile = data.dfile;
                    getScriptInitProgress(label, tid, dfile, sid)//获取进度
                }
            }


        });
    })
    //启动监听
    listenScriptInitStatus();
}

function listenScriptInitStatus() {
    //监听脚本初始化是否完成
    if (window.successScriptInit.length + window.failedScriptInitNum < window.runScriptInitServerNum) {
        //没有运行完，继续监听
        setTimeout(listenScriptInitStatus, 1000);
    }
    else if (window.runScriptInitServerNum == window.failedScriptInitNum + window.successScriptInit.length) {
        //运行完毕
        if (window.runScriptInitServerNum == window.successScriptInit.length) {
            //全部运行完毕
            goRun();//自动启动执行
        }
        else {
            //有失败的，需要手工运行
            $("#scriptInit").effect("shake");
            //把按钮放开
            document.getElementById("goRun").parentNode.removeAttribute("disabled");

        }
    }
    $("#goRun").removeClass("fa fa-spin fa-refresh").text("执行");//停止动画


}

function scriptSelectAllServers() {
    //脚本执行，选择服务器
    window.runScriptServers = [];
    $("#scriptSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
        //每一个复选框
        var sid = this.getAttribute("value");
        window.runScriptServers.push(sid);
    });
    if (window.runScriptServers.length == 0) {
        return false;
    }
    else {
        return true;
    }
}

function createInitScriptProgress() {
    //创建脚本的初始化进度html
    var scriptInit = document.getElementById("scriptInit");
    $(scriptInit).find(".label-progress").remove();//删除上次遗留的hytml,第一个是button，跳过
    for (var i = 0; i < window.runScriptServers.length; i++) {
        var sid = window.runScriptServers[i];
        //转换为alias
        for (var a = 0; a < window.allServersList.length; a++) {
            if (window.allServersList[a]["id"] == sid) {
                var alias = window.allServersList[a]["alias"];
                break;
            }
        }

        var div = document.createElement("div");
        div.style.marginTop = "5px";
        div.className = "col-md-12 label-progress";//用来被删除标记
        var label = document.createElement("label");
        label.setAttribute("sid", sid);
        label.textContent = alias;
        label.className = "control-label col-md-2";
        div.appendChild(label);
        //进度条区域
        var progressDiv = document.createElement("div");
        progressDiv.className = "progress  progress-striped";
        var p = document.createElement("div");
        p.className = "progress-bar progress-bar-success";
        p.style.width = "0%";
        p.textContent = "0%";
        progressDiv.appendChild(p);
        div.appendChild(progressDiv);
        scriptInit.appendChild(div);


    }

}

//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getScriptResult(tid, sid) {
    return function () {
        //访问真正的目标函数
        getScriptResult(tid, sid);
    }
}


function getScriptResult(tid, sid) {
    var progressBar = document.getElementById("runScriptProgress");
    var showScriptResult = document.getElementById("showScriptResult");
    jQuery.ajax({
        "url": getCommandResultURL,
        "data": {"sid": sid, "tid": tid},
        "error": errorAjax,
        "dataType": "jsonp",
        "success": function (data) {
            var progress = data.progress;
            progressBar.style.width = progress + "%";//首先显示进度
            progressBar.textContent = progress + "%";
            var pre = document.createElement("pre");


            //有内容
            pre.innerText = data["content"]["content"];//数据格式是三层

            if( /^ *$/.test(data["content"]["content"])){
                //如果是空的不写页面
            }
            else{
                //把内容加入页面
                showScriptResult.appendChild(pre);

            }

            if (data.progress == 100) {
                $("#runScriptProgress").removeClass("active");  //进度条不要动画
                document.getElementById("scriptResultLoad").style.display = "none";//
                showSuccessNotic();

            }
            //
            //if(data.content.stage==="running") {  //stage是running或者done,表示没有命令结果产生
            else{
                //当前函数的阶段没有完成，继续获取
                setTimeout(_getScriptResult(tid, sid), 1000);
            }


        }
    });
}


function executeScript() {
    //每一个服务器执行的命令，都不一样，所以要单个执行，用for循环

    $("#runScriptProgress").addClass("active");  //进度条添加动画
    var parameter = document.getElementById("inputScriptParameter").value;//脚本的参数
    for (var i = 0; i < window.successScriptInit.length; i++) {
        var cmd = window.successScriptInit[i].dfile;
        var sid = window.successScriptInit[i].sid;
        //每一个服务器
        var sid = window.successScriptInit[i].sid;
        var cmd = window.successScriptInit[i].dfile;
        cmd = cmd + "  " + parameter;//命令+参数

        var data = {"cmd": cmd, "force": true, "servers": [sid], "multi_thread": true, "task_type": "cmd"};
        data = JSON.stringify(data);
        var showScriptResult = document.getElementById("showScriptResult");//显示命令结果的DIV
        var progressDiv = document.getElementById("runScriptProgress");

        jQuery.ajax({
            "url": executeCommandURL,
            "data": {"parameters": data},
            "dataType": "jsonp",
            "error": errorAjax,
            "success": function (data) {
                if (!data.status) {
                    showErrorInfo(data.content);
                    return false;
                    //请求发生了错误
                    //不太可能
                }
                else {
                    var tid = data.content;
                    getScriptResult(tid, sid);//获取脚本执行结果
                }

            }

        });
    }


}


function goRun() {
    executeScript();
    $('#myTab li:eq(3) a').tab('show') // Select third tab (0-indexed)
    $("#showScriptResult").children().remove();//清除上次的结果
    //显示动态加载图标
    document.getElementById("scriptResultLoad").style.display = "block";//
}

//初始化加载
$(function () {

    initScriptDropZ()//绑定拖动上传脚本
    //绑定刷新按钮
    document.getElementById("refreshScriptList").onclick = function () {
        loadScriptHTML();
    }
    //加载脚本列表
    loadScriptList();
    //绑定关闭脚本内容按钮
    document.getElementById("closeScriptContent").onclick = function () {
        $("#scriptArea").animate({
            "top": "100%",
        }, function () {
            document.getElementById("scriptArea").style.display = "none";
        });


    }
    //绑定脚本输入框的键盘按下
    document.getElementById("scriptContent").onkeydown = function () {
        if (event.keyCode == 9) {
            $(this).insertAtCaret("\t");//按下制表符，就\tab
        }
    }
    //绑定创建脚本/更新脚本按钮
    document.getElementById("writeScriptContent").onclick = function () {
        submitScriptContent();
    }
    //关闭脚本文件输入框
    document.getElementById("closeScriptNameButton").onclick = function () {
        stopShadow();
        $("#showScriptName").hide("fast");
    }
    //创建脚本按钮
    document.getElementById("createScriptName").onclick = function () {
        $("#showScriptName").show("fast");
        document.getElementById("scriptName").focus();
        startShadow();
    }

    //绑定输入脚本名的下一步
    document.getElementById("inputScriptName").onclick = function () {
        var filename = document.getElementById("scriptName").value;
        if (/^ *$/.test(filename)) {
            $("#showScriptName").effect("shake");//没有输入文件名
            document.getElementById("scriptName").focus();
            return false;
        }
        stopShadow();
        document.getElementById("scriptName").value = "";
        document.getElementById("writeScriptContent").setAttribute("filename", filename);//绑定属性，提交的时候需要使用
        document.getElementById("showScriptName").style.display = "none";//关闭脚本名输入框
	document.getElementById("scriptArea").style.display="block";
        $("#scriptArea").animate({
            "top": "0%",
        });
        document.getElementById("scriptContent").focus();
    }
    //取消选择服务器
    document.getElementById("closeScriptDiv").onclick = function () {
        $("#scriptDIV").effect("puff", 500);
        stopShadow();
    }
    //给选择全部服务器绑定选择事件
    jQuery1_8("#scriptSelectAllServers").toggle(
        function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );
    //绑定跳转参数页面按钮
    document.getElementById("goParameter").onclick = function () {
        if (!scriptSelectAllServers()) {
            //如果选中的主机为零，则不继续
            showErrorInfo("请选择主机!");
            return false;
        }
        else {
            this.setAttribute("disabled", "disabled");//禁用自己

            //选中主机不为零个。
            $('#myTab li:eq(1) a').tab('show') // Select third tab (0-indexed)
            //开启参数页面的按钮
            document.getElementById("goInit").removeAttribute("disabled");
            var p = document.getElementById("inputScriptParameter");//获取参数输入框的焦点
            p.focus();//获取参数输入框的焦点
            p.value = "";
        }

    }
    //绑定脚本输入参数的下一步按钮
    document.getElementById("goInit").onclick = function () {
        this.setAttribute("disabled", "disabled");
        goInit();
    }
    //绑定执行执行脚本按钮
    document.getElementById("goRun").onclick = function () {
        this.parentNode.setAttribute("disabled", "disabled");
        goRun();//转到脚本运行结果
    }
    $( ".modal-content" ).draggable();//窗口拖动



})
