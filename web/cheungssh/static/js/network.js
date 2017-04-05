/**
 * Created by 张其川CheungSSH on 2016/12/17.
 */



var AtestData = {
    nodes: [
        {"name": "中国", "x": 0, "y": 0},
        {"name": "日本", "x": 0, "y": 0},
        {"name": "美国", "x": 0, y: 0},

    ],
    "edge": [
        {"from": "中国", "to": "日本"},
        {"from": "中国", "to": "美国"}
    ]
}


function serverList() {
    var data = {"nodes": [], "edge": []};
    for (var i = 0; i < window.allServersList.length; i++) {
        var alias = window.allServersList[i].alias;
        var server = window.allServersList[i];
        var status = server.status.status;
        window.allServersList[i].link_device.nodes[0]["status"] = status;//{"name":"XX","y":0,"x":0,"status":"success/failed"} 新增了状态栏
        window.allServersList[i].link_device.nodes[0]["sid"] = window.allServersList[i].id; //{"name":"XX","y":0,"x":0,"status":"success/failed"} 新增了状态栏
        data["nodes"] = data["nodes"].concat(window.allServersList[i].link_device.nodes);
        data["edge"] = data["edge"].concat(window.allServersList[i].link_device.edge);
    }
    return data;

}


function createMasterTopology() {
    //创建骨干网络
    //console.log(window.allDeviceList);
    var data = {"nodes": [], "edge": []};
    for (name in window.allDeviceList) {
        var t = window.allDeviceList[name];
        var a = t.link.edge;
        var b = t.link.nodes;
        for (var i = 0; i < a.length; i++) {
            data.edge.push({"from": a[i].from, "to": a[i].to});//集合线条
        }

        try {
            for (var i = 0; i < b.length; i++) {
                data.nodes.push({"name": name, "x": b[i].x, "y": b[i].y, "type": window.allDeviceList[name].type});
            }
        }
        catch (e) {

        }
    }
    return data;
}


function saveNetworkTopology() {
    //保存个人布局
    var data = {};
    window.graph.forEach(function (e) {
        if (e.name !== undefined) {
            data[e.name] = {"name": e.name, "x": e.x, "y": e.y};
        }

    })

    data = JSON.stringify(data);
    jQuery.ajax({
        "url": saveTopologyURL,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "dataType": "jsonp",
        "data": {"topology": data},
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                return false;
            }
        }
    })

}

function getActiveCommandResult() {
    jQuery.ajax({
        "url": getActiveSSHResultURL,
        "data": {"log_key": window.log_key},
        "dataType": "jsonp",
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                document.getElementById("showCommandResult").innerHTML = data.content;
                return false;
            }
            else {
                try {
                    var t = document.getElementById("showCommandResult");
                    if (data.content.length!==0){
                        t.innerHTML += data.content;
                        t.scrollTop = t.scrollHeight;//把滚动条设置到最底部，这样有更新的效果，跟CRT一样
                    }

                    setTimeout(getActiveCommandResult, 200);
                }
                catch (e) {
                    alert(e);

                }

            }
        }
    });
}

function showCommandDiv(sid) {
    startShadow();
    $("#networkCommandDiv").show("fast");
    jQuery.ajax({
        "url": activeSSHURL,
        "data": {"sid": sid},
        "dataType": "jsonp",
        "beforeSend": function () {
            document.getElementById("networkCommand").innerHTML="登录中，请稍后...";
            document.getElementById("showCommandResult").innerHTML="登录中，请稍后...";
            var networkExecuteCommand = document.getElementById("networkExecuteCommand")
            networkExecuteCommand.setAttribute("disabled", "disabled");
            document.getElementById("networkCommand").setAttribute("disabled", "disabled");
            $(networkExecuteCommand).children().eq(0).addClass("fa fa-spin fa-refresh");
            $(networkExecuteCommand).children().eq(1).text("登录中...");
        },
        "complete": function () {
            var networkExecuteCommand = document.getElementById("networkExecuteCommand")
            $(networkExecuteCommand).children().eq(0).removeClass("fa fa-spin fa-refresh")
            $(networkExecuteCommand).children().eq(1).text("执行");

        },
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            var pre = document.getElementById("showCommandResult");

            if (!data.status) {
                pre.innerHTML = data.content;
                return false;
            }
            else {
                networkExecuteCommand.removeAttribute("disabled");
                networkCommand.removeAttribute("disabled");
                document.getElementById("networkCommand").focus();

                pre.innerHTML = data.content;
                window.log_key = data.log_key;
                window.cmd_key = data.cmd_key;
                getActiveCommandResult();

            }
        }
    });
}


function addActiveCommand() {
    var cmd = document.getElementById("networkCommand").value;
    if (/^ *$/.test(cmd)) {
        return false;
    }
    if (/^ *(logout|exit) *$/.test(cmd)) {
        $("#networkCommandDiv").hide("fast");
        stopShadow();
    }
    document.getElementById("networkCommand").focus();
    jQuery.ajax({
        "url": addActiveSSHCommand,
        "data": {"cmd": cmd, "cmd_key": window.cmd_key},
        "dataType": "jsonp",
        "beforeSend": function () {
            var networkCommand = document.getElementById("networkCommand");
            networkCommand.value = "";
            networkCommand.setAttribute("placeholder", "已发送命令,exit可以退出");
        },
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }

        }
    });


}

$(function () {

	//绑定帮助按钮
	document.getElementById("networkHelp").onclick=function(){
		$("#showNetworkHelp").show("fast");
		startShadow();
	}
	//绑定关闭帮助按钮
	document.getElementById("closeHelp").onclick=function(){
		$("#showNetworkHelp").hide("fast");
		stopShadow();}
    //获取主干网络数据
    var data = createMasterTopology();//
    data.nodes.push({"name": "CheungSSH自动化系统", "x": 0, "y": 0, "type": "cheungssh"});
    var data1 = serverList();//主机

    data["nodes"] = data["nodes"].concat(data1["nodes"]);
    data["edge"] = data["edge"].concat(data1["edge"]);


    createNetworkTopology(data);//主机连接图


    document.getElementById("savetop").onclick = function () {
        saveNetworkTopology();
        return false;
    }

    document.getElementById("closeCommandDiv").onclick = function () {
        $("#networkCommandDiv").hide("fast");
        document.getElementById("networkCommand").value="exit";
        addActiveCommand();
        stopShadow();
    }
    $(".modal-content").draggable();//窗口拖动
    document.getElementById("networkExecuteCommand").onclick = function () {
        addActiveCommand();
    }
    document.getElementById("networkCommand").onkeyup = function () {
        if (event.keyCode == 13) {
            addActiveCommand();
        }
    }


})



//命令搜索

$(function() {
    var cache = {};  //缓存功能
    $( "#networkCommand" ).autocomplete({
        minLength: 1, //最少多少开始搜索
        source: function( request, response ) {
            var path = request.term;  //自身携带的是term key
            var requestData={"path":path};
            if ( path in cache ) {
                response( cache[ path ] );
                return;
            }

            $.getJSON( headURL+pathSearchURL, requestData, function( data, status, xhr ) { //requestData是组成的数据
                var content=data.content;
                cache[ path ] = content;
                response( content );
            });
        }
    });
});


