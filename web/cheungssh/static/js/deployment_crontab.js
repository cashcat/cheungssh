
function getDeploymentCrontabList(){
	$("#showDeploymentCrontabTbody").children().remove()
	jQuery.ajax({
		"url":getDeploymentCrontabListURL,
		"error":errorAjax,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var content=data.content;
				for (var i=0;i<content.length;i++){
					var line=content[i]
					loadDataToTable(line);
					
				}
				
			}
		}
	})
}

function loadDeploymentList(){
	jQuery.ajax({
		"url":getDeploymentTaskURL,
		"dataType":"jsonp",
		"type":"get",
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var content=data.content;
				var select=document.getElementById("deploymentCrontabSelect");
				for(did in content){
					var taskName=content[did]["app_name"]
					var option=document.createElement("option");
					option.textContent=taskName;
					option.setAttribute("tid",did)
					select.appendChild(option);
				}	
			}
		}
	})
}
function closeDeploymentCrontabDiv(){
	stopShadow()
	$("#deploymentCrontabEditDiv").hide("fast")
}
function showDeploymentCrontabDiv(){
	startShadow();
	$("#deploymentCrontabEditDiv").show("fast")
	
}
function deleteDeploymentCrontab(team){
	var data=team.getAttribute("data")
	data=JSON.parse(data)
	jQuery.ajax({
		"url":deleteDeploymentCrontabURL,
		"data":{"tid":data.tid,"owner":data.owner},
		"dataType":"jsonp",
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo()
				return false;
			}
			else{
				$(team.parentNode.parentNode).remove()
				showSuccessNotic()
			}
		}
	})
}
function loadDataToTable(info){
	var tbody=document.getElementById("showDeploymentCrontabTbody");
	var tr=document.createElement("tr");

	var taskNameTd=document.createElement("td")
	taskNameTd.textContent=info.task_name;
	tr.appendChild(taskNameTd)


	var crontabTimeTd=document.createElement("td")
	crontabTimeTd.textContent=info.crontab_time;
	tr.appendChild(crontabTimeTd)

	var ownerTd=document.createElement("td")
	ownerTd.textContent=info.owner;
	tr.appendChild(ownerTd)

	var lastRunTimeTd=document.createElement("td")
	lastRunTimeTd.textContent=info.last_run_time;
	tr.appendChild(lastRunTimeTd)

	var td=document.createElement("td");
	//删除按钮
	var deleteButton=document.createElement("button");
	var _info=JSON.stringify(info);
	deleteButton.setAttribute('data',_info);
	deleteButton.className="btn btn-xs btn-danger glyphicon glyphicon-trash";
	deleteButton.onclick=function(){
		deleteDeploymentCrontab(this);
	}
	//修改按钮
	var editButton=document.createElement("button");
	editButton.setAttribute("data",_info);
	editButton.className="glyphicon glyphicon-edit btn btn-xs btn-primary"
	editButton.style.marginLeft="5px";
	editButton.onclick=function(){
		window.editDeploymentCrontabAction="edit"
		window.editDeploymentCrontabButton=this
		editDeploymentCrontab(this);
	}
	td.appendChild(deleteButton)
	td.appendChild(editButton);
	tr.appendChild(td);
	tbody.appendChild(tr);
	

	
}
function saveDeploymentCrontab(data){
	
	var taskName=document.getElementById("deploymentCrontabSelect").value;
	var tid=""
	$("#deploymentCrontabSelect").find("option").each(function(){
		if(this.textContent===taskName){
			console.log(this)
			tid=this.getAttribute("tid")
		}
	})
	var crontabTime=document.getElementById("deploymentCrontabTime").value;
	if(/^ *$/.test(crontabTime)){
		showErrorInfo("请填写计划任务时间！")
		return false;
	}
	if(window.editDeploymentCrontabAction==="add"){
		var owner=window.whoami;
	}
	else{
		var owner=data.owner
	}
	var lastRunTime="新建"
	var info={"task_name":taskName,"crontab_time":crontabTime,"owner":owner,"last_run_time":lastRunTime,"tid":tid,"action":window.editDeploymentCrontabAction}
	_info=JSON.stringify(info)
	closeDeploymentCrontabDiv();
	jQuery.ajax({
		"url":saveDeploymentCrontabURL,
		"beforeSend":start_load_pic,
		"error":errorAjax,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"data":{"data":_info},
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				info["tid"]=info["tid"];
				if(window.editDeploymentCrontabAction==="edit"){
					var _info=JSON.stringify(info)
					window.editDeploymentCrontabButton.setAttribute("data",_info)
					var siblings=$(window.editDeploymentCrontabButton.parentNode).siblings()
					siblings[1].textContent=info.crontab_time;
					return false;
				}
				loadDataToTable(info)
				showSuccessNotic();
			}
		}
	})
}

function editDeploymentCrontab(team){
	//禁用任务选择框，不许修改
	document.getElementById("deploymentCrontabSelect").setAttribute("disabled",true);
	var data=team.getAttribute("data")
	data=JSON.parse(data)
	var select=document.getElementById("deploymentCrontabSelect")
	var taskName=data.task_name
	var crontabTime=data.crontab_time;
    	for(var i=0; i<select.options.length; i++){
		if(select.options[i].textContent ==taskName ){
			select.options[i].selected = true;
			break;
		}
	}
	document.getElementById("deploymentCrontabTime").value=crontabTime;
	startShadow();
	showDeploymentCrontabDiv()
	





}

$(function(){
	loadDeploymentList()
	getDeploymentCrontabList()
	document.getElementById("saveDeploymentCrontab").onclick=function(){
		data={}
		if(window.editDeploymentCrontabAction==="edit"){
			data=window.editDeploymentCrontabButton.getAttribute("data")
			data=JSON.parse(data)
		}
		saveDeploymentCrontab(data)
	}
	document.getElementById("closeDeploymentCrontabDiv").onclick=function(){
		closeDeploymentCrontabDiv()
	}
	document.getElementById("createDeploymentCrontab").onclick=function(){
		window.editDeploymentCrontabAction="add"
		document.getElementById("deploymentCrontabSelect").removeAttribute("disabled");
		showDeploymentCrontabDiv()
	}
	document.getElementById("refreshDeploymentCrontab").onclick=function(){
		getDeploymentCrontabList()
	}
	
})
