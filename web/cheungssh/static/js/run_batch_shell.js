function getSelectServers(){
	var servers = {"alias":[],"id":[]};
	$('li[data-level="2"]').each(function(){
		if($(this).find("i").hasClass("icon-check-box-cicre")){
			servers.id.push(this.getAttribute("data-id"))
			servers.alias.push(this.textContent)
		}
	})
	return servers
}
function goInit(){
	var data = []
	isBreak = false
	$(".parameterLineTemplateNew").each(function(){
		var name = $(this).find(".parameterName").eq(0).text()
		var value = $(this).find(".parameterValue>input").eq(0).val()
		var empty = $(this).find("input")[0].getAttribute("empty")
		if(empty==="false" && value.match(/^ *$/)){
			showErrorInfo("红色虚线上的参数值不能为空")
			console.log(value)
			isBreak = true
			return false;
		}
		data.push({
			name:value,
		})
	})
	if(isBreak === true){
		return false;
	}
	jQuery.ajax({
		"url":initScriptURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"servers":JSON.stringify(getSelectServers()["id"]),"script_id":getKey("sid")},
		"type":"POST",
		"success":function(data){
			data=JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			$('#myTab li:eq(2) a').tab('show') // Select third tab (0-indexed)
			var a = document.getElementById("scriptInit")
			var servers = getSelectServers()
			for (var i=0;i<servers.id.length;i++){
				var t = document.getElementsByClassName("progressTemplate")[0].cloneNode(true)
				t.setAttribute("id","progress."+servers.id[i])
				t.style.display="block"
				$(t).find(".server").text(servers.alias[i])
				a.appendChild(t)
			}
			window.scriptCmd = data.cmd;
                    	setTimeout(_getScriptInitPorgress(data.content), 1000);
		}
	})
}

function _getScriptInitPorgress(tid) {
    return function () {
	getScriptInitProgress(tid)
    }
}
function getScriptInitProgress(tid){
	jQuery.ajax({
		"url":getScriptInitProgressURL,
		"data":{"tid":tid},
		"errorAjax":errorAjax,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			//整体进度
			var t= document.getElementById("wholeProgress")
			t.style.width = data.whole_progress + "%";
			t.textContent = data.whole_progress + "%";
			var progress=data.progress;
			var automaticRun = true
			for(var key in progress){
				var x = document.getElementById(key)
				txt = progress[key].content + "%";
				$(x).find(".progress-bar").css({"width":txt}).text(txt)
				if (progress[key].status === false){
					$(x).find(".content").text(progress[key].content).css({"background":"red","color":"white"})
					t.className = "progress-bar progress-bar-danger"
					automaticRun = false
				}
				if(parseInt(progress[key].content) === 100  ){
					$(x).find(".content").text("成功").css({"background":"#5cb85c"})
				}
			}
			if(parseInt(data.whole_progress) < 100){
                    		setTimeout(_getScriptInitPorgress(tid), 1000);
			}
			else{
				//读取成功的服务器
				var servers = [];
				for(var key in progress){
					if(progress[key].status === true){
						servers.push(key)
					}
				}
				if(servers.length===0){
					showErrorInfo("没有服务器可执行脚本!")
					return false;
				}
				jQuery.ajax({
					"url":"/cheungssh/get_server_alias/",
					"error":errorAjax,
					"beforeSend":start_load_pic,
					"complete":stop_load_pic,
					"data":{"servers":JSON.stringify(servers)},
					"type":"POST",
					"success":function(data){
						data = JSON.parse(data)
						if(!data.status){
							showErrorInfo(data.content);
							return false;
						}
						window.url="command.html?serverList="+JSON.stringify(data.content) +"&cmd=" +window.scriptCmd + window.parameter;
						if(automaticRun === true){
							window.location.href=window.url
						}
						else{
							document.getElementById("goRun").removeAttribute("disabled")
						}
					}
				})

			}
		}
	})
}
document.getElementById("goInit").onclick=function(){
	goInit()
}
document.getElementById("goParameter").onclick=function(){
	var servers = getSelectServers()["id"]
	if(servers.length===0){
		showErrorInfo("请至少选择一个主机！")
		return false;
	}
	$('#myTab li:eq(1) a').tab('show') // Select third tab (0-indexed)
	getScriptParameters()
}
function getScriptParameters(){
	jQuery.ajax({
		"url":getScriptParametersURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"script_id":getKey("sid")},
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			window.parameter = " "
			if (data.content.length===0){
				goInit();
			}
			else{
				var tmp = document.getElementById("scriptParameter")
				for(var i=0;i<data.content.length;i++){
					var div=$(".parameterLineTemplate")[0].cloneNode(true);
					div.style.display="block"
					$(div).removeClass("parameterLineTemplate").addClass("parameterLineTemplateNew")
					$(div).find(".parameterName").eq(0).text(data.content[i].parameterName);
					if(data.content[i].empty===false){
						$(div).find(".parameterValue>input")[0].style.borderBottom="1px dashed red";
						$(div).find(".parameterValue>input")[0].setAttribute("empty",data.content[i].empty)
					}
					$(div).find(".parameterValue>input").eq(0).val(data.content[i].parameterValue);
					$(div).find(".parameterDescription").eq(0).text(data.content[i].parameterDescription + ".");
					tmp.appendChild(div)
					window.parameter += data.content[i].parameterName + " "  + data.content[i].parameterValue + " "
				}
			}
		}
	})
}
function getServerGroups(){
	jQuery.ajax({
		"url":getServerGroupsURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"script_id":getKey("sid")},
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			new verTree({
				items:"#serverGroup",
				type:"form",
				data:data.content,
				parent:"pid",
				params:"id",
				value:"name"
			});
		}
	})



}
document.getElementById("goRun").onclick=function(){
	window.location.href=window.url
}
getServerGroups()
