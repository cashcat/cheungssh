document.getElementById("bindScriptWithOS").onclick=function(){
	startShadow();
	$("#editServiceOperation").show("fast")
	document.getElementById("saveServiceOperation").setAttribute("action","create")
	document.getElementById("serviceOperationName").focus();
	var x = document.getElementById("scriptList")
	x.setAttribute("list",JSON.stringify([]))
	x.value = "0 个"
}
$( ".modal-content" ).draggable();//窗口拖动
document.getElementById("scriptList").onclick=function(){
	var list = this.getAttribute("list")
	window.open("scriptList.html?list="+list,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
}
document.getElementById("saveServiceOperation").onclick=function(){
	var data={};
	data.id = this.getAttribute("tid")
	var action = this.getAttribute("action")
	data.name = document.getElementById("serviceOperationName").value;
	data.list = JSON.parse(document.getElementById("scriptList").getAttribute("list"))
	data.description = document.getElementById("serviceOperationDescription").value
	if (data.name.match(/^ *$/) || data.list.length === 0){
		$("#editServiceOperation").effect("shake")
		return false;
	}
	data.list = JSON.stringify(data.list)
	jQuery.ajax({
		"url":saveServiceOperationURL,
		"beforeSend":start_load_pic,
		"type":"POST",
		"complete":stop_load_pic,
		"error":errorAjax,
		"data":{"data":JSON.stringify(data),"action":action},
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			stopShadow();
			$("#editServiceOperation").hide("fast")
			loadServiceOperation()
			showSuccessNotice();
		}
	})
}
function loadServiceOperation(){
	$("#serviceTbody").children().remove();
	jQuery.ajax({
		"url":getServiceOperationURL,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			var tbody=document.getElementById("serviceTbody")
			for(var i=0;i<data.content.length;i++){
				var tr=document.createElement("tr")
				
				var list = data.content[i].list
				rowspan = list.length;
				var td=document.createElement("td")
				td.style.cssText="vertical-align:middle"
				td.textContent = data.content[i].name
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
			
	
				var td=document.createElement("td")
				td.textContent = data.content[i].create_time
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
	
	
				var td=document.createElement("td")
				td.textContent = data.content[i].list[0].name
				td.style.cssText="vertical-align:middle"
				tr.appendChild(td)

	
				var td=document.createElement("td")
				td.textContent = data.content[i].os.join(" ")
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)

				var td=document.createElement("td")
				td.textContent = data.content[i].description
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
			
				var td=document.createElement("td")
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				var editButton=document.createElement("span")
				editButton.className ="glyphicon glyphicon-edit btn btn-xs btn-warning"
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.onclick=function(){
					var data=JSON.parse(this.getAttribute("data"))
					var x =document.getElementById("scriptList")
					var list = []
					for(var i=0;i<data.list.length;i++){
						list.push(data.list[i].script_id)
					}
					x.setAttribute("list",JSON.stringify(list))
					x.value = + data.list.length  + " 个"
					document.getElementById("serviceOperationName").value = data.name;
					document.getElementById("serviceOperationDescription").value = data.description;
					var t =document.getElementById("saveServiceOperation")
					t.setAttribute("action","update")
					t.setAttribute("tid",data.id)
					startShadow();
					$("#editServiceOperation").show("fast")
					
					
				}
				var td=document.createElement("td")
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				var delButton=document.createElement("span")
				delButton.style.marginLeft="3px"
				delButton.className ="glyphicon glyphicon-trash btn btn-xs btn-danger"
				delButton.setAttribute("tid",data.content[i].id)
				delButton.onclick=function(){
					var tid=this.getAttribute("tid")
					jQuery.ajax({
						"url":delServiceOperationURL,
						"error":errorAjax,
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"data":{"id":tid},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content)
								return false;
							}
							loadServiceOperation()
							showSuccessNotice()
							
						}
					})
				}
				var td=document.createElement("td")
				td.style.cssText="vertical-align:middle"
				td.setAttribute("rowspan",rowspan)
				var runButton=document.createElement("span")
				runButton.style.marginLeft="3px"
				runButton.className ="glyphicon glyphicon-play-circle btn btn-xs btn-success"
				runButton.setAttribute("tid",data.content[i].id)
				//var tmp = {data.content[i].list[0].script_id : data.content[i].list[0].os}
				var tmp ={}
				var os = data.content[i].list[0].os
				tmp[data.content[i].list[0].script_id] = {"os":os,"type":data.content[i].list[0].type}
				runButton.setAttribute("all_os",JSON.stringify(data.content[i].os))
				var scripts = [data.content[i].list[0].script_id]
				runButton.setAttribute("scripts",JSON.stringify(scripts))
				runButton.setAttribute("parameter",JSON.stringify(data.content[i].list[0].parameter))
				runButton.onclick=function(){
					var all_os = this.getAttribute("all_os")
					var parameter = this.getAttribute("parameter")
					var scripts = this.getAttribute("scripts")
					window.open("runServiceOperation.html?all_os=" + all_os + "&scripts=" + scripts  + "&parameter=" + parameter ,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
				}



				td.appendChild(editButton)
				td.appendChild(delButton)
				td.appendChild(runButton)
				tr.appendChild(td)
				
				
			
				tbody.appendChild(tr)
				for(var x=1; x<list.length;x++){
					var TR=document.createElement("tr")
					var td=document.createElement("td")
					scripts.push(list[x].script_id)
					runButton.setAttribute("scripts",JSON.stringify(scripts))
					td.textContent = list[x].name
					TR.appendChild(td)
					tbody.appendChild(TR)
					
				}
			}
		}
	})
}
document.getElementById("refreshXX").onclick=function(){
	loadServiceOperation()
}
loadServiceOperation()
