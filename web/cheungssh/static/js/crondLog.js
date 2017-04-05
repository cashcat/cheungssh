/**
 * Created by 张其川 on 2016/7/19.
 */



function CrondSelectServer() {
    $("#showCrondHost").show("fast");
    $("#selectCrondTbody").children().remove();//删除上次创建的HTML，避免重复
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
    var tbody = document.getElementById("selectCrondTbody");
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
                        $(tbody).find(".glyphicon-check").each(function(){///选中了当前，就要取消其他的服务器
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
        tbody.appendChild(tr);
    }
}




function changeCrontab(team){
	startShadow();
	$("#showCrontabDiv").show("fast");
	var data=team.getAttribute("data");
	data=JSON.parse(data);
	var alias=data.alias;
	var runTime=data.time;
	var cmd=data.cmd;
	var dest=data.dest;
	var sid=data.sid;
	var tid=team.getAttribute("tid");

	document.getElementById("server").value=alias;
	document.getElementById("server").setAttribute("sid",sid);
	document.getElementById("runtime").value=runTime;
	document.getElementById("cmd").value=cmd;
	document.getElementById("dest").value=dest;
	document.getElementById("saveCrontab").setAttribute("tid",tid);

	document.getElementById("saveCrontab").setAttribute("action","modify");
	
	
}

function deleteCrontab(team){
	//删除计划任务
	var data=team.getAttribute("data");
	data=JSON.parse(data);
	var sid=data.sid
	var tid=team.getAttribute("tid");
	jQuery.ajax({
		"url":deleteCrondListURL,
		"error":errorAjax,
		"dataType":"jsonp",
		"type":"get",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"tid":tid,"sid":sid},
		"success":function(data){
			responseCheck(data);
			if (! data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				$(team).parent().parent().remove();
				showSuccessNotic();
			}
		}
	});
}



function crondLog(){
	jQuery.ajax({
		"url":getCrondListURL,
		"type":"GET",
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			responseCheck(data);
			if (! data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var tbody=document.getElementById("AshowCrondLog");
				var data=data.content;
				for (alias in data){
					var crondList=data[alias];//一个服务器的全部计划任务字典，dict；{1:...,2:...}
					for (id in crondList){
						var tr=document.createElement("tr");
						var td=document.createElement("td");
						td.textContent=alias;//别名
						tr.appendChild(td);

						var td=document.createElement("td");
						td.textContent=crondList[id]["time"];//时间
						tr.appendChild(td);
						
						var td=document.createElement("td");
						td.textContent=crondList[id]["cmd"];//命令
						tr.appendChild(td);

						var td=document.createElement("td");
						td.textContent=crondList[id]["dest"];//描述
						tr.appendChild(td);
			
						//采集时间
						var td=document.createElement("td");
						td.textContent=crondList[id]["collect_time"];//描述
						tr.appendChild(td);

						//操作
						//删除按钮
						var _crondList=JSON.stringify(crondList[id]);
						var td=document.createElement("td");
						var deleteButton=document.createElement("button");
						deleteButton.setAttribute("data",_crondList);
						deleteButton.setAttribute("tid",id);
						deleteButton.className="btn btn-danger btn-xs glyphicon glyphicon-trash";
						
						deleteButton.onclick=function(){
							deleteCrontab(this);
						}
						//编辑
						var editButton=document.createElement("button");
						editButton.className="btn btn-success btn-xs glyphicon glyphicon-edit";
						editButton.setAttribute("data",_crondList);
						editButton.setAttribute("tid",id);
						editButton.style.marginLeft="2px";
						editButton.onclick=function(){
							changeCrontab(this);
						}
		
						td.appendChild(deleteButton);
						td.appendChild(editButton);
						tr.appendChild(td);
						

	
						tbody.appendChild(tr);
						

					}
				}
			}
		}
	})
}





function clearCrontabDiv(){
	//清楚计划任务编辑框的数据
	startShadow();
	$("#showCrontabDiv").show("fast")
	document.getElementById("server").value="";
	document.getElementById("runtime").value="";
	document.getElementById("cmd").value="";
	document.getElementById("dest").value="";
	document.getElementById("saveCrontab").setAttribute("action","create");
}

function saveCrontabList(){
	//保存计划任务
	$("#showCrontabDiv").hide("fast");
	stopShadow();
	var alias=document.getElementById("server").value;
        var sid=   document.getElementById("server").getAttribute("sid");
        var runtime=document.getElementById("runtime").value;;
        var cmd=document.getElementById("cmd").value;
        var dest=document.getElementById("dest").value;
	var action=document.getElementById("saveCrontab").getAttribute("action");
	var data={
			"alias":alias,
			"sid":sid,
			"runtime":runtime,
			"cmd":cmd,
			"dest":dest,
		}
	if (action==="modify"){
		data["tid"]=document.getElementById("saveCrontab").getAttribute("tid");//行号id
	}
	data=JSON.stringify(data);
	jQuery.ajax({
		"type":"POST",
		"url":saveCrondToServerURL,
		"data":{"action":action,"data":data},
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			responseCheck(data);
			data=JSON.parse(data);
			if (!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				refreshCrond();
			}
		}
	})
}


function refreshCrond(){
		$("tbody").children().remove();
		crondLog();
}

//初始化加载

$(function(){
    crondLog();
	document.getElementById("refreshCrond").onclick=function(){
		refreshCrond();
	}
	document.getElementById("closeCrontab").onclick=function(){
		$("#showCrontabDiv").hide("fast");//关闭计划任务编辑框
		stopShadow();
	}
	document.getElementById("saveCrontab").onclick=function(){
		stopShadow();
		$("#showCrontabDiv").hide("fast");//关闭计划任务编辑框
		saveCrontab();
	}
	document.getElementById("server").onclick=function(){
		document.getElementById("showCrontabDiv").style.display="none";
		CrondSelectServer();
		
	}
	document.getElementById("closeServerSelect").onclick=function(){
		document.getElementById("showCrontabDiv").style.display="block";
		document.getElementById("showCrondHost").style.display="none";
	}
	//绑定选中主机
	document.getElementById("saveServerSelect").onclick=function(){
		var e=$("#selectCrondTbody").find(".glyphicon-check")[0];
		var alias=e.textContent;
		var sid=e.getAttribute("value");
		var server=document.getElementById("server");
		server.setAttribute("sid",sid);
		server.value=alias;
		document.getElementById("showCrontabDiv").style.display="block";
		document.getElementById("showCrondHost").style.display="none";
	}
	document.getElementById("saveCrontab").onclick=function(){
		var e=document.getElementById("server")
		var alias=e.value;
		var sid=e.getAttribute("sid");
		var time=document.getElementById("runtime").value;
		var cmd=document.getElementById("cmd").value;
		var dest=document.getElementById("dest").value;

	}
	document.getElementById("createCrond").onclick=function(){
		clearCrontabDiv();
	}
	//绑定保存计划任务按钮
	document.getElementById("saveCrontab").onclick=function(){
		saveCrontabList();
		
	}

})
