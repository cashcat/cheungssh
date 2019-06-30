document.getElementById("createBatchShellName").onclick=function(){
	//创建操作系统选项
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
                                $("#shell_os_type").children().remove();//清空
				var t=document.getElementById("shell_os_type");
				for(var i=0;i<data.content.length;i++){
				var div=document.createElement("div")
				var span=document.createElement("span")
				span.className="glyphicon glyphicon-unchecked";
				span.textContent= data.content[i];
				div.style.cssText="margin-top:8px;cursor:pointer;"
				span.onclick=function(){
					if($(this).hasClass("glyphicon-unchecked")){
						$(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
					}
					else{
						$(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
					}
				}
				div.appendChild(span)
				t.appendChild(div)
				}
                        }
                }
        })
	//document.getElementById("writeBatchShellContent").setAttribute("action","create")
	document.getElementById("saveShellParameters").style.display="none"
	document.getElementById("batchShellNext").style.display="block"
	$(".batchShellParameterTemplateNew").remove()
	startShadow();
        document.getElementById("batchShellName").value = "";
	document.getElementById("batchShellGroup").value="";
	document.getElementById("batchShellDescription").value="";
	$("#showBatchShellName").show("fast")
	document.getElementById("batchShellName").focus()
	document.getElementById("saveBatchCommand").setAttribute("action","create")
}
document.getElementById("addShellParameterTemplate").onclick=function(){
	var newHTML=document.getElementsByClassName("batchShellParameterTemplate")[0].cloneNode(true)
	newHTML.style.display="block";
	$(newHTML).addClass("batchShellParameterTemplateNew")
	var parameterBody = document.getElementById("shellParameterBody");
	parameterBody.appendChild(newHTML)
}
$( ".modal-content" ).draggable();
$(document).on("click",".removeParameterTemplate",function(){
	$(this).parent().parent().remove();
})
document.getElementById("batchShellNext").onclick=function(){
	if(getBatchShellConfiguration().status === true){
		$("#batchShellDiv").show("fast")
		document.getElementById("batchShellArea").focus();
	}
}
document.getElementById("saveShellParameters").onclick=function(){
	var data=getBatchShellConfiguration()
	var id= this.getAttribute("tid")
	jQuery.ajax({
		"url":saveBatchShellConfigurationURL,
		"data":{"data":JSON.stringify(data.content),"action":"update","id":id},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"success":function(data){
			data = JSON.parse(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			stopShadow()
			$("#batchShellDiv").hide("fast")
			showSuccessNotice();
			getBatchShellList()
		}
	})
}
function getBatchShellConfiguration(){
	var data={};
	data.os_type = [];
	data.name = document.getElementById("batchShellName").value;
	data.group = document.getElementById("batchShellGroup").value;
	data.description = document.getElementById("batchShellDescription").value;
	$("#shell_os_type .glyphicon-check").each(function(){
		data.os_type.push(this.textContent)
	})
	if (data.name.match(/^ *$/) || data.group.match(/^ *$/)){
            	$("#showBatchShellName").effect("shake");
		return false;
	}
	else if(data.os_type.length===0){
            $("#showBatchShellName").effect("shake");//没有输入文件名
            return false;
	}
	data.parameters = [];
	var isBreak = false
	$(".batchShellParameterTemplateNew").each(function(){
		var empty = false;
		$(this).find(".empty").each(function(){
			if($(this).find("span").eq(0).hasClass("glyphicon-unchecked")){
			empty = true;
			}
		})
		var inputs = $(this).find("input")
		var parameterName = inputs.eq(0).val()
		var parameterValue = inputs.eq(1).val()
		var parameterDescription = $(this).find(".parameterDescription").eq(0).val()
		if(parameterName.match(/^ *$/)){
			inputs[0].focus()
			isBreak = true
       		     	return false;
		}
		data.parameters.push({
			"empty":empty,
			"parameterName":parameterName,
			"parameterValue":parameterValue,
			"parameterDescription":parameterDescription,
		})
	})
	if(isBreak === true){
            $("#showBatchShellName").effect("shake");//没有输入文件名
		return {"status":false,"content":""}
	}
        $("#showBatchShellName").hide("fast")
	data.parameters = JSON.stringify(data.parameters)
	return {"status":true,"content":data}
}
document.getElementById("saveBatchCommand").onclick=function(){
	var action = this.getAttribute("action")
	var id = this.getAttribute("tid")
	if (action === "update"){
		var data={}
		data.command=document.getElementById("batchShellArea").value;
		jQuery.ajax({
			"url":saveBatchShellConfigurationURL,
			"data":{"data":JSON.stringify(data),"action":action,"id":id},
			"error":errorAjax,
			"beforeSend":start_load_pic,
			"complete":stop_load_pic,
			"type":"POST",
			"success":function(data){
				data = JSON.parse(data)
				if(!data.status){
					showErrorInfo(data.content);
					return false;
				}
				stopShadow()
				$("#batchShellDiv").hide("fast")
				showSuccessNotice();
				getBatchShellList()
			}
	})
		
		return false;
	}
	var data=getBatchShellConfiguration()
	data.content.command=document.getElementById("batchShellArea").value;
	jQuery.ajax({
		"url":saveBatchShellConfigurationURL,
		"data":{"data":JSON.stringify(data.content)},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"success":function(data){
			data = JSON.parse(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			stopShadow()
			$("#batchShellDiv").hide("fast")
			showSuccessNotice();
			getBatchShellList()
		}
	})
}
function getBatchShellList(){
	$("#showBatchShellTbody").children().remove()
	jQuery.ajax({
		"url":getBatchShellListURL,
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			var tbody=document.getElementById("showBatchShellTbody")
			for(var i=0;i<data.content.length;i++){
				var tr=document.createElement("tr")

				var td=document.createElement("td")
				td.textContent=data.content[i].name;
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].group;
				tr.appendChild(td)

				
				var td=document.createElement("td")
				td.textContent=data.content[i].username;
				tr.appendChild(td)


				var td=document.createElement("td")
				td.textContent=JSON.parse(data.content[i].os_type).join(" ");
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].create_time;
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent=data.content[i].description;
				tr.appendChild(td)

				var td=document.createElement("td")
				var editButton=document.createElement("button")
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.setAttribute("tid",data.content[i].id)
				editButton.className = "btn btn-xs btn-warning glyphicon glyphicon-edit"
				editButton.onclick=function(){

	var sysData = this.getAttribute("data");
	sysData = JSON.parse(sysData);
	var os_type_list = JSON.parse(sysData.os_type)
        jQuery.ajax({
                "url":getSystemVersionURL,
                "error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
                "dataType":"jsonp",
                "type":"GET",
                "success":function(data){
                        responseCheck(data)
                        if (!data.status){
                                showErrrorInfo(data.content);
                                return false;
                        }
                        else{
                                $("#shell_os_type").children().remove();//清空
				var t=document.getElementById("shell_os_type");
				for(var i=0;i<data.content.length;i++){
				var div=document.createElement("div")
				var span=document.createElement("span")
			span.textContent= data.content[i];
					span.className="glyphicon glyphicon-unchecked";
					for(var x=0;x<os_type_list.length;x++){
						if(os_type_list[x] === data.content[i]){
							span.className="glyphicon glyphicon-check";
						}
					}
				span.textContent = data.content[i];
				span.style.cssText="margin-top:8px;cursor:pointer;"
				span.onclick=function(){
					if($(this).hasClass("glyphicon-unchecked")){
						$(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
					}
					else{
						$(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
					}
				}
				div.appendChild(span)
				t.appendChild(div)
				}
                        }
                }
        })
					document.getElementById("saveShellParameters").setAttribute("tid",this.getAttribute("tid"))
					document.getElementById("saveShellParameters").style.display="block"
					document.getElementById("batchShellNext").style.display="none"
					$(".batchShellParameterTemplateNew").remove()
					var data = this.getAttribute("data")
					data=JSON.parse(data)
					document.getElementById("batchShellName").value = data.name;
					document.getElementById("batchShellGroup").value=data.group;
					document.getElementById("batchShellDescription").value=data.description;

					var parameterBody = document.getElementById("shellParameterBody");
					var parameters = JSON.parse(data.parameters)
					
					for (var i=0;i<parameters.length;i++){
						var newHTML=document.getElementsByClassName("batchShellParameterTemplate")[0].cloneNode(true)
						newHTML.style.display="block";
						if(parameters[i].empty == false){
						$(newHTML).find(".empty>span").eq(0).addClass("glyphicon-check").removeClass("glyphicon-unchecked")
						}
						$(newHTML).find("input").eq(0).val(parameters[i].parameterName);
						$(newHTML).find("input").eq(1).val(parameters[i].parameterValue);
						$(newHTML).find(".parameterDescription").eq(0).val(parameters[i].parameterDescription);
						$(newHTML).addClass("batchShellParameterTemplateNew")
						parameterBody.appendChild(newHTML)
					}


					document.getElementById("batchShellNext").style.display="none";
					startShadow()
					$("#showBatchShellName").show("fast")
					document.getElementById("batchShellName").focus()
				
				}
				td.appendChild(editButton)
				tr.appendChild(td)

				var viewButton=document.createElement("button")
				viewButton.style.cssText="margin-left:3px"
				viewButton.setAttribute("data",JSON.stringify(data.content[i]))
				viewButton.setAttribute("tid",data.content[i].id)
				viewButton.className = "btn btn-xs btn-primary glyphicon glyphicon-eye-open"
				viewButton.onclick=function(){
					var t = document.getElementById("saveBatchCommand")
					t.setAttribute("tid",this.getAttribute("tid"))
					t.setAttribute("action","update")
					var data =JSON.parse(this.getAttribute("data"));
					document.getElementById("batchShellArea").value = data.command;
					$("#batchShellDiv").show("fast")
					startShadow()
				}
				td.appendChild(viewButton)
				tr.appendChild(td)

				var delButton=document.createElement("button")
				delButton.style.cssText="margin-left:3px"
				delButton.setAttribute("data",JSON.stringify(data.content[i]))
				delButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash"
				delButton.onclick=function(){
					var id=JSON.parse(this.getAttribute("data")).id;
					var button=this;
					jQuery.ajax({
						"url":delBatchShellURL,
						"dataType":"jsonp",
						"data":{"id":id},
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"success":function(data){
							if(!data.status){
								showErrorInfo(data.content)
								return false;
							}
							showSuccessNotice();
							$(button).parent().parent().remove()
						}
					})
				}
				td.appendChild(delButton)
				tr.appendChild(td)

				var runButton=document.createElement("button")
				runButton.setAttribute("tid",data.content[i].id)
				runButton.style.cssText="margin-left:3px"
				runButton.className = "btn btn-xs btn-success glyphicon glyphicon-play-circle"
				runButton.onclick=function(){
					var id= this.getAttribute("tid")
					window.open("run_batch_shell.html?id="+id,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
				}
				td.appendChild(runButton)
				tr.appendChild(td)

				tbody.appendChild(tr)

			}
		}
	
	})
}
document.getElementById("refreshBatchShellList").onclick=function(){
	getBatchShellList()
}
getBatchShellList()
