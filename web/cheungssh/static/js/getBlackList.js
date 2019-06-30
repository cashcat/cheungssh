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
			var sourceList = JSON.parse(getKey("list"))
			for(var i=0;i<data.content.length;i++){
				var tr = document.createElement("tr")

				var td = document.createElement("td")
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
				td.style.cssText="text-align:center;cursor:pointer;"
				var span = document.createElement("span")
				if (sourceList.indexOf(data.content[i].id) > -1 || sourceList.indexOf(data.content[i].id.toString()) >-1 ){
					tr.style.cssText="background:rgb(96, 181, 94)"
					span.className = "glyphicon glyphicon-check" 
				}
				else{
					span.className = "glyphicon glyphicon-unchecked" 
				}
				span.setAttribute("id",data.content[i].id);
				td.className = "BlackList" 
				td.appendChild(span)
				tr.appendChild(td)
				
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
				
				tbody.appendChild(tr)
			}
		}
	})
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
	var t = window.opener.document.getElementById("blackListAmount");
	t.value = list.length + " 个"
	t.setAttribute("list",JSON.stringify(list))
	window.close()
}
loadBlackList()
