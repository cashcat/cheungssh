
function blackListWithBlackListGroup(){
	$("#tbody").children().remove();
	jQuery.ajax({
		"url":getUserAndBlackListGroupURL,
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
			var tbody = document.getElementById("tbody")
			var sourceList = JSON.parse(getKey("list"))
			for(var i=0;i<data.content.black_list_group.length;i++){
				var rowspan = data.content.black_list_group[i].list.length;
				var tr = document.createElement("tr")

				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="text-align:center;cursor:pointer;vertical-align:middle"
				var span=document.createElement("span")
				td.onclick=function(){
					if($(this).find("span").eq(0).hasClass("glyphicon-unchecked")){
						$(this).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
						this.parentNode.style.cssText="background:rgb(96, 181, 94)"
					}
					else{
						$(this).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
						this.parentNode.style.cssText=""
					}
					
				}
				if (sourceList.indexOf(data.content.black_list_group[i].id) > -1 || sourceList.indexOf(data.content.black_list_group[i].id.toString()) >-1 ){
					tr.style.cssText="background:rgb(96, 181, 94)"
					span.className = "glyphicon glyphicon-check" 
				}
				else{
					span.className = "glyphicon glyphicon-unchecked" 
				}
				span.setAttribute("id",data.content.black_list_group[i].id);
				td.className = "BlackList" 
				td.appendChild(span)
				tr.appendChild(td)



				var td = document.createElement("td")
				td.setAttribute("rowspan",rowspan)
				td.style.cssText="vertical-align:middle;"
				td.textContent = data.content.black_list_group[i].name;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].create_time;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].owner;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				
				var td = document.createElement("td")
				td.style.cssText="vertical-align:middle;"
				var span=document.createElement("span")
				span.textContent=data.content.black_list_group[i].default;
				td.setAttribute("rowspan",rowspan)
				if(data.content.black_list_group[i].default === "是"){
					span.className = "label  label-danger"
				}
				else{
					span.className = "label  label-default"
				}
				td.appendChild(span)
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].list[0].name;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].list[0].expression;
				tr.appendChild(td)
					
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].list[0].description;
				tr.appendChild(td)
				
				var td = document.createElement("td")
				td.textContent = data.content.black_list_group[i].description;
				td.style.cssText="vertical-align:middle;"
				td.setAttribute("rowspan",rowspan)
				tr.appendChild(td)
				
				tbody.appendChild(tr)
				//子表格
				for(var x=1;x<data.content.black_list_group[i].list.length;x++){
					var TR=document.createElement("tr")

					var td = document.createElement("td")
					td.textContent = data.content.black_list_group[i].list[x].name;
					TR.appendChild(td)
					
					var td = document.createElement("td")
					td.textContent = data.content.black_list_group[i].list[x].expression;
					TR.appendChild(td)

					var td = document.createElement("td")
					td.textContent = data.content.black_list_group[i].list[x].description;
					TR.appendChild(td)
					
					tbody.appendChild(TR)
				}
			}
		}
	})
}
document.getElementById("addBlackList").onclick=function(){
	var list = [];
	$(".BlackList>.glyphicon-check").each(function(){
		var id = this.getAttribute("id")
		list.push(id)
	})
	if(list.length===0){
		showErrorInfo("请选择最少一个黑名单！")
		return false;
	}
	var t = window.opener.document.getElementById("userBlackListGroup");
	t.value = list.length + " 个"
	t.setAttribute("list",JSON.stringify(list))
	window.close()
	
}
document.getElementById("selectAll").onclick=function(){
	if($(this).find("span").eq(0).hasClass("glyphicon-unchecked")){
		$(this).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
		$(".glyphicon-unchecked").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
		$("tbody > tr").css("background","rgb(96, 181, 94)")
	}
	else{
		$(this).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
		$(".glyphicon-check").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
		$("tbody > tr").css("background","")
	}
}
blackListWithBlackListGroup();
