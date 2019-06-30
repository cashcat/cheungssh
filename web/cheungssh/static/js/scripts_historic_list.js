function getScriptsHistoricList(){
	jQuery.ajax({
		"dataType":"jsonp",
		"url":getScriptsHistoricListURL,
		"data":{"sid":getKey("sid")},
		"error":errorAjax,
		"complete":stop_load_pic,
		"beforeSend":start_load_pic,
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			var tbody = document.getElementById("tbody")
			for(var i=0;i<data.content.length;i++){
				var tr = document.createElement("tr")
				var td = document.createElement("td")
				td.textContent = data.content[i].script_name;
				tr.appendChild(td)

    var td = document.createElement("td");
    var span=document.createElement("span")
    span.textContent=data.content[i].type
    if(data.type === "脚本"){
	span.className = "label label-warning"
    }
    else{
	span.className= "label label-default"
    }
    td.appendChild(span)
    tr.appendChild(td);

				var td = document.createElement("td")
				td.textContent = data.content[i].script_group;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].owner;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = JSON.parse(data.content[i].os_type).join(" ");
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].create_time;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].version;
				tr.appendChild(td)


				var td = document.createElement("td")
				var span=document.createElement("span")
				span.textContent = data.content[i].comment;
				span.className = "label label-default"
				if(data.content[i].comment==="参数变动"){
					span.style.background = "#cd73d8"
				}
				else if(data.content[i].comment==="脚本内容变动"){
					span.style.background = "blue"
				}
				td.appendChild(span)
				tr.appendChild(td)


				var td = document.createElement("td")
				var span=document.createElement("span")
				td.style.cssText="cursor:pointer;"
				td.setAttribute("active",data.content[i].active)
				td.setAttribute("id",data.content[i].id)
				td.onclick=function(){
					var td=this;
					var active=this.getAttribute("active")
					var id=this.getAttribute("id")
					if(active==="false"){
						jQuery.ajax({
							"url":setScriptActiveVersionURL,
							"dataType":"jsonp",
							"data":{"id":id},
							"complete":stop_load_pic,
							"beforeSend":start_load_pic,
							"error":errorAjax,
							"success":function(data){
								responseCheck(data);
								if(data.status){
									window.opener.loadScriptHTML();
									window.close();
									
								}
							}

						})
					}
				}
				if(data.content[i].active===false){
					span.className = "label label-danger"
					span.textContent = "否"
				}
				else{
					span.textContent = "是"
					span.className = "label label-success"
				}
				
				td.appendChild(span)
				tr.appendChild(td)

				var td = document.createElement("td")
				var button=document.createElement("button")
				button.setAttribute("id",data.content[i].id)
				button.onclick=function(){
					var id = this.getAttribute("id")
					jQuery.ajax({
						"url":getScriptHistoricContentURL,
						"error":errorAjax,
						"complete":stop_load_pic,
						"beforeSend":start_load_pic,
						"data":{"id":id},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content);
								return false;
							}
							$("#area").val(data.content).show("fast").focus();
							document.getElementById("closeArea").style.display="block"
						}
						
					})
				}
				button.className = "btn btn-xs btn-primary glyphicon glyphicon-eye-open"
				button.style.cssText ="float:left"
				td.appendChild(button)

				var button=document.createElement("button")
				button.onclick=function(){
					var id = this.getAttribute("id")
					jQuery.ajax({
						"url":getScriptHistoricParametersURL,
						"error":errorAjax,
						"complete":stop_load_pic,
						"beforeSend":start_load_pic,
						"data":{"id":id},
						"dataType":"jsonp",
						"success":function(data){
							responseCheck(data)
							if(!data.status){
								showErrorInfo(data.content);
								return false;
							}
							$("#type option").attr("selected",false)
							$("#type").find('option[value="'  + data.content.type + '"]'   ).attr("selected",true)
							$("#type").attr("disabled",true)
							var os_type_list=data.content.fixed_os_type;
			                                $("#script_os_type").children().remove();//清空
							var t=document.getElementById("script_os_type");
							for(var x=0;x<os_type_list.length;x++){
							var div=document.createElement("div")
							var span=document.createElement("span")
							span.textContent= os_type_list[x];
							span.className="glyphicon glyphicon-unchecked";
							for(var i=0;i<data.content.os_type.length;i++){
								if(os_type_list[x] === data.content.os_type[i]){
									span.className="glyphicon glyphicon-check";
								}
							}
							div.appendChild(span)
							div.style.cssText="margin-top:8px;cursor:pointer;"
							t.appendChild(div)
							}
							document.getElementById("scriptName").value = data.content.script_name;
							document.getElementById("scriptGroup").value = data.content.script_group;
							document.getElementById("scriptDescription").value=data.content.description;
							//参数部分
							$(".scriptParameterTemplateNew").remove()
							var parameters = JSON.parse(data.content.parameters)
							var parameterBody = document.getElementById("parameterBody");
							for (var i=0;i<parameters.length;i++){
							var newHTML=document.getElementsByClassName("scriptParameterTemplate")[0].cloneNode(true)
							newHTML.style.display="block";
							if(parameters[i].empty == false){
								$(newHTML).find(".empty>span").eq(0).addClass("glyphicon-check").removeClass("glyphicon-unchecked")
							}
							$(newHTML).find("input").eq(0).val(parameters[i].parameterName);
							$(newHTML).find("input").eq(1).val(parameters[i].parameterValue);
							$(newHTML).find(".parameterDescription").eq(0).val(parameters[i].parameterDescription).css({"margin-top":"10px"});
							$(newHTML).addClass("scriptParameterTemplateNew")
							parameterBody.appendChild(newHTML)
							}
		
							startShadow()
							$("#showScriptName").show("fast")
						}
						
					})
				}
				button.setAttribute("id",data.content[i].id)
				button.className = "btn btn-xs btn-warning glyphicon glyphicon-tag"
				button.style.cssText ="float:left;margin-left:5px"
				td.appendChild(button)
				tr.appendChild(td)
				
				tbody.appendChild(tr)
			}
		}
	})
}
document.getElementById("closeArea").onclick=function(){
	this.style.display="none";
	$("#area").hide("fast")
}
document.getElementById("closeScriptNameButton").onclick=function(){
	stopShadow()
	$("#showScriptName").hide("fast")
}
document.getElementById("area").style.height=window.innerHeight+"px"
getScriptsHistoricList()
    $( ".modal-content" ).draggable();//窗口拖动
