document.getElementById("createBlackList").onclick=function(){
	document.getElementById("saveBlackList").setAttribute("action","create")
	startShadow()
	$("#editBlackList").show("fast")
	document.getElementById("blackListName").value = "";
	document.getElementById("expression").value = "";
	document.getElementById("description").value = "";
	document.getElementById("blackListName").focus();
}
document.getElementById("createBlackListGroup").onclick=function(){
	$("#defaultBlackListGroup option").attr("selected",false)
	document.getElementById("saveBlackListGroup").setAttribute("action","create")
	startShadow()
	$("#editBlackListGroup").show("fast")
	document.getElementById("blackListGroupName").value = "";
	document.getElementById("groupDescription").value = "";
	document.getElementById("blackListGroupName").focus();
	var t = document.getElementById("blackListAmount")
	t.setAttribute("list",JSON.stringify([]))
	t.value = "0 个"
	
}
$( ".modal-content" ).draggable();//窗口拖动
document.getElementById("blackListAmount").onclick=function(){
	var list = this.getAttribute("list")
	window.open("blackList.html?list="+list,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")

}
document.getElementById("saveBlackList").onclick=function(){
	saveBlackList()
}
document.getElementById("saveBlackListGroup").onclick=function(){
	var data={};
	data.name = document.getElementById("blackListGroupName").value;
	data.default = $("#defaultBlackListGroup").val();
	var t = document.getElementById("blackListAmount");
	var list=t.getAttribute("list")
	data.list = JSON.parse(list)
	data.description = document.getElementById("groupDescription").value;
	var action = this.getAttribute("action")
	data.id = this.getAttribute("tid")
	if(data.name.match(/^ *$/) || data.list.length === 0){
		$("#editBlackListGroup").effect("shake");
		return false;
	}
	data.list = JSON.stringify(data.list);
	jQuery.ajax({
		"url":saveBlackListGroupURL,
		"data":{"data":JSON.stringify(data),"action":action},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"success":function(data){
			data = JSON.parse(data);
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			$("#editBlackListGroup").hide("fast");
			loadBlackListGroup();
			stopShadow();
			showSuccessNotice();
			
			
		}
	
	})
}
function saveBlackList(){
	var data={};
	data.name = document.getElementById("blackListName").value;
	data.expression = document.getElementById("expression").value;
	data.description = document.getElementById("description").value;
	var t = document.getElementById("saveBlackList")
	var action = t.getAttribute("action")
	data.id = t.getAttribute("tid")
	if( data.name.match(/^ *$/) || data.expression.match(/^ *$/)){
		$("#editBlackList").effect("shake");
		return false;
	}
	jQuery.ajax({
		"url":saveBlackListURL,
		"data":{"data":JSON.stringify(data),"action":action},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			
			$("#editBlackList").hide("fast")
			loadBlackList();
			stopShadow();
			showSuccessNotice();
		}
	})
}
function loadBlackList(){
	$("#showBlackListTbody").children().remove();
	jQuery.ajax({
		"url":getBlackListURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			var tbody = document.getElementById("showBlackListTbody")
			for(var i=0;i<data.content.length;i++){
				var tr = document.createElement("tr")

				var td = document.createElement("td")
				td.textContent = data.content[i].name;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].create_time;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].owner;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].expression;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].description;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				var editButton = document.createElement("button")
				editButton.className = "btn btn-xs btn-warning glyphicon glyphicon-edit"
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.onclick=function(){
					var data= this.getAttribute("data")
					data = JSON.parse(data)
					var t = document.getElementById("saveBlackList")
					t.setAttribute("action","update")
					t.setAttribute("tid",data.id)

					document.getElementById("blackListName").value = data.name;
					document.getElementById("expression").value = data.expression;
					document.getElementById("description").value = data.description;

					startShadow()
					$("#editBlackList").show("fast")
					document.getElementById("blackListName").focus();
					
				}
				var delButton = document.createElement("button")
				delButton.style.cssText="margin-left:3px"
				delButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash"
				delButton.setAttribute("tid",data.content[i].id)
				delButton.onclick=function(){
					var id = this.getAttribute("tid")
					var b = this;
					jQuery.ajax({
						"url":delBlackListURL,
						"error":errorAjax,
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"data":{"id":id},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content);
								return false;
							}
							$(b).parent().parent().remove()
							showSuccessNotice();
						}
					})
				}
				td.appendChild(editButton)
				td.appendChild(delButton)
				tr.appendChild(td)
				
				tbody.appendChild(tr)
			}
		}
	})
}
function loadBlackListGroup(){
	$("#showBlackListGroupTbody").children().remove();
	jQuery.ajax({
		"url":getBlackListGroupURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			var tbody = document.getElementById("showBlackListGroupTbody")
			for(var i=0;i<data.content.length;i++){
				var list = JSON.parse(data.content[i].list);
				var rowspan = list.length;
				var tr = document.createElement("tr")

				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="vertical-align:middle;"
				td.textContent = data.content[i].name;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].create_time;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].owner;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				
				var td = document.createElement("td")
				td.style.cssText="vertical-align:middle;"
				var span=document.createElement("span")
				span.textContent=data.content[i].default;
				td.setAttribute("rowspan",rowspan)
				if(data.content[i].default === "是"){
					span.className = "label  label-danger"
				}
				else{
					span.className = "label  label-default"
				}
				td.appendChild(span)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = list[0].name;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = list[0].expression;
				tr.appendChild(td)
					
				
				var td = document.createElement("td")
				td.textContent = data.content[i].description;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="vertical-align:middle;"
				var editButton = document.createElement("button")
				editButton.className = "btn btn-xs btn-warning glyphicon glyphicon-edit"
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.onclick=function(){
					var data= this.getAttribute("data")
					data = JSON.parse(data)
					var t = document.getElementById("saveBlackListGroup")
					t.setAttribute("action","update")
					t.setAttribute("tid",data.id)

					document.getElementById("blackListGroupName").value = data.name;
					document.getElementById("groupDescription").value = data.description;

					startShadow()
					var x= document.getElementById("blackListAmount")
					var list = []
					data.list = JSON.parse(data.list)
					for(var i=0;i<data.list.length;i++){
						list.push(data.list[i].id)
					}
					x.setAttribute("list",JSON.stringify(list))
					x.value = data.list.length + "个";
					$("#defaultBlackListGroup").find("option").attr("selected",false)
					//$("#defaultBlackListGroup option[value='" + data.default  +  "']").attr("selected",true)
					$("#defaultBlackListGroup option[value='" + data.default  +  "']").prop("selected", true); 
					$("#editBlackListGroup").show("fast")
					document.getElementById("blackListGroupName").focus();
					
				}
				var delButton = document.createElement("button")
				delButton.style.cssText="margin-left:3px"
				delButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash"
				delButton.setAttribute("tid",data.content[i].id)
				delButton.onclick=function(){
					var id = this.getAttribute("tid")
					var b = this;
					jQuery.ajax({
						"url":delBlackListGroupURL,
						"error":errorAjax,
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"data":{"id":id},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content);
								return false;
							}
							loadBlackListGroup();
							showSuccessNotice();
						}
					})
				}
				td.appendChild(editButton)
				td.appendChild(delButton)
				tr.appendChild(td)
				
				tbody.appendChild(tr)
				//子表格
				for(var x=1;x<list.length;x++){
					var TR=document.createElement("tr")

					var td = document.createElement("td")
					td.textContent = list[x].name;
					TR.appendChild(td)
					
					var td = document.createElement("td")
					td.textContent = list[x].expression;
					TR.appendChild(td)
					tbody.appendChild(TR)
				}
			}
		}
	})
}
document.getElementById("refreshBlackListGroup").onclick=function(){
	loadBlackListGroup();
}
document.getElementById("refreshBlackList").onclick=function(){
	loadBlackList();
}
document.getElementById("bindUserWithBlackList").onclick=function(){
	var t= document.getElementById("userBlackListGroup")
	t.setAttribute("list",JSON.stringify([]))
	t.value= "0 个"
	startShadow();
	jQuery.ajax({
		"url":getUserAndBlackListGroupURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			$("#usernameBlackList").children().remove()
			var t = document.getElementById("usernameBlackList")
			var option = document.createElement("option")
			option.setAttribute("uid","请选择")
			option.textContent = "请选择"
			t.appendChild(option)
			for(var i=0;i<data.content.user.length;i++){
				var option = document.createElement("option")
				option.setAttribute("uid",data.content.user[i].id)
				option.textContent = data.content.user[i].username
				t.appendChild(option)
				
			}
			document.getElementById("saveUserWithBlackList").setAttribute("action","create")
			$("#editUser").show("fast")
		}
	})
}
document.getElementById("userBlackListGroup").onclick=function(){
	var list=this.getAttribute("list")
	window.open("blackListWithBlackListGroup.html?list="+list,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
	
}
document.getElementById("saveUserWithBlackList").onclick=function(){
	saveUserWithBlackList()
}
function saveUserWithBlackList(){
	var data={};
	data.uid = $("#usernameBlackList option:selected").attr("uid");
	data.black_list_group_id = document.getElementById("userBlackListGroup").getAttribute("list")
	data.black_list_group_id = JSON.parse(data.black_list_group_id)
	var t = document.getElementById("saveUserWithBlackList")
	var action = t.getAttribute("action")
	data.id = t.getAttribute("tid")
	if( data.uid === "请选择" || data.black_list_group_id .lenght === 0){
		$("#editUser").effect("shake");
		return false;
	}
	data.black_list_group_id =JSON.stringify(data.black_list_group_id )
	jQuery.ajax({
		"url":saveUserWithBlackListURL,
		"data":{"data":JSON.stringify(data),"action":action},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"POST",
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			
			$("#editUser").hide("fast")
			loadUserWithBlackListGroup();
			stopShadow();
			showSuccessNotice();
		}
	})
}
function loadUserWithBlackListGroup(){
	$("#userTbody").children().remove();
	jQuery.ajax({
		"url":getUserWithBlackListGroupURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			data = JSON.parse(data)
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			var tbody = document.getElementById("userTbody")
			for(var i=0;i<data.content.length;i++){
				var list = data.content[i].list;
				var rowspan = list.length;
				var tr = document.createElement("tr")

				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="vertical-align:middle;"
				td.textContent = data.content[i].username;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].create_time;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content[i].list[0].name;
				td.style.cssText="vertical-align:middle;"
				tr.appendChild(td)
				
				
				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="vertical-align:middle;"
				var editButton = document.createElement("button")
				editButton.className = "btn btn-xs btn-warning glyphicon glyphicon-edit"
				editButton.setAttribute("data",JSON.stringify(data.content[i]))
				editButton.setAttribute("user_list",JSON.stringify(data.user_list))
				editButton.onclick=function(){
					var data= this.getAttribute("data")
					var user_list= this.getAttribute("user_list")
					user_list = JSON.parse(user_list)
					data = JSON.parse(data)
					var t = document.getElementById("saveUserWithBlackList")
					t.setAttribute("action","update")
					t.setAttribute("tid",data.id)
					startShadow()
					var x= document.getElementById("userBlackListGroup")
					var list = []
					for(var i=0;i<data.list.length;i++){
						list.push(data.list[i].gid)
					}
					x.setAttribute("list",JSON.stringify(list))
					x.value = data.list.length + "个";
					//用户名
					var select = document.getElementById("usernameBlackList")
					$(select).children().remove()
					for (var i=0;i<user_list.length;i++){
						var option = document.createElement("option")
						option.value = user_list[i].id
						option.textContent = user_list[i].username
						if(user_list[i].username === data.username){
							option.setAttribute("selected",true)
						}
						select.appendChild(option)
					}
					$("#editUser").show("fast")
					
				}
				var delButton = document.createElement("button")
				delButton.style.cssText="margin-left:3px"
				delButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash"
				delButton.setAttribute("tid",data.content[i].id)
				delButton.onclick=function(){
					var id = this.getAttribute("tid")
					var b = this;
					jQuery.ajax({
						"url":delUserWithBlackListGroupURL,
						"error":errorAjax,
						"beforeSend":start_load_pic,
						"complete":stop_load_pic,
						"data":{"id":id},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content);
								return false;
							}
							loadUserWithBlackListGroup()
							showSuccessNotice();
						}
					})
				}
				td.appendChild(editButton)
				td.appendChild(delButton)
				tr.appendChild(td)
				
				tbody.appendChild(tr)
				//子表格
				for(var x=1;x<list.length;x++){
					var TR=document.createElement("tr")

					var td = document.createElement("td")
					td.textContent = data.content[i].list[x].name;
					TR.appendChild(td)
					
					tbody.appendChild(TR)
				}
			}
		}
	})
}
document.getElementById("refreshTTT").onclick=function(){
	loadUserWithBlackListGroup()
}
loadUserWithBlackListGroup()
loadBlackList();
loadBlackListGroup();
