function getCrontabList(){
	jQuery.ajax({
		"url":getCrontabListURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"sid":getKey("sid")},
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false
			}
			var tbody=document.getElementById("tbody")
			for(var i=0;i<data.content.length;i++){
				var tr=document.createElement("tr")



				var td=document.createElement("td")
				td.textContent=data.content[i].alias
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].username
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].time
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].cmd
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].description
				tr.appendChild(td)

				var td=document.createElement("td")

				var editButton = document.createElement("button")
				editButton.className = "btn btn-xs btn-success glyphicon glyphicon-edit"
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.setAttribute("line_id",data.content[i].line)
				editButton.onclick=function(){
					var data=this.getAttribute("data")
					data = JSON.parse(data)
					var line_id = this.getAttribute("line_id")
					var save = document.getElementById("save")
					save.setAttribute("line_id",line_id)
					save.setAttribute("action","modify")
					var time=document.getElementById("time")
					time.value= data.time;
					document.getElementById("cmd").value = data.cmd;
					document.getElementById("description").value = data.description;

					$("#editCrontab").show("fast")
					startShadow()
					time.focus();
				
					
				}
				td.appendChild(editButton)
				
				var deleteButton = document.createElement("button")
				deleteButton.style.cssText="margin-left:5px"
				deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash"
				deleteButton.setAttribute("data",JSON.stringify(data.content[i]))
				deleteButton.setAttribute("line_id",data.content[i].line)
				deleteButton.onclick=function(){
					var line_id = this.getAttribute("line_id")
					var data={"sid":getKey("sid"),"line_id":line_id}
					data = JSON.stringify(data)
					var button=this
					jQuery.ajax({
						"url":deleteCrontabURL,
						"data":{data},
						"error":errorAjax,
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content)
								return false;
							}
							showSuccessNotice()
							$(button).parent().parent().remove()
							
						}
					})
				}
				td.appendChild(deleteButton)
				
				tr.appendChild(td)

				tbody.appendChild(tr)
			}
			
		}
	})
}
document.getElementById("save").onclick=function(){
	createCrontab()
}
function createCrontab(){
	var data={}
	data.time=document.getElementById("time").value;
	data.cmd=document.getElementById("cmd").value;
	data.description=document.getElementById("description").value;
	if(/^ *$/.test(data.time)){
		showErrorInfo("请填写完整的信息！")
		return false;
	}
	else if(data.time.split(" ").length!==5){
		showErrorInfo("时间格式不正确！")
		return false;
	}
	else if(/^ *$/.test(data.cmd)){
		showErrorInfo("请填写完整的信息！")
		return false;
	}
	data.sid =getKey("sid")
	data.line_id = document.getElementById("save").getAttribute("line_id")
	data.action = document.getElementById("save").getAttribute("action")
	data =JSON.stringify(data)
	$("#editCrontab").hide("fast")
	jQuery.ajax({
		"url":modifyCrontabURL,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"error":errorAjax,
		"data":{"data":data},
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			window.location.reload();
		}
	})
}
document.getElementById("createCrontab").onclick=function(){
	document.getElementById("save").setAttribute("action","create")
	document.getElementById("cmd").value="";
	var time = document.getElementById("time")
	time.value="";
	document.getElementById("description").value="";
	startShadow()
	$("#editCrontab").show("fast")
	time.focus();
}
getCrontabList()

