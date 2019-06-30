function getRemoteFileHistoricList(){
	jQuery.ajax({
		"dataType":"jsonp",
		"url":getRemoteFileHistoricListURL,
		"data":{"id":getKey("id")},
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
				td.textContent = data.content[i].username;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].path;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].alias;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].create_time;
				tr.appendChild(td)

				var td = document.createElement("td")
				td.textContent = data.content[i].ip;
				tr.appendChild(td)



				//启用按钮
				var td = document.createElement("td")
				var span=document.createElement("span")
				span.className = "label label-danger"
				span.textContent = "恢复"
				td.style.cssText="cursor:pointer;"
				td.setAttribute("data",JSON.stringify(data.content[i]))
				td.onclick=function(){
					var data = this.getAttribute("data")
					data = JSON.parse(data)
					jQuery.ajax({
						"url":enableRemoteFileHistoryVersionURL,
						"dataType":"jsonp",
						"data":{"tid":data.tid,"id":data.id},
						"complete":stop_load_pic,
						"beforeSend":start_load_pic,
						"error":errorAjax,
						"success":function(data){
							responseCheck(data);
							if(!data.status){
								showErrorInfo(data.content)
								return false;
							}
							else{
								window.close();
								window.opener.document.getElementById("refreshRemoteFile").click()
								
							}
						}
					})
				}
				td.appendChild(span)
				tr.appendChild(td)

				var td = document.createElement("td")
				var button=document.createElement("button")
				button.setAttribute("data",JSON.stringify(data.content[i]))
				button.onclick=function(){
					var data=this.getAttribute("data")
					var data = JSON.parse(data)
					jQuery.ajax({
						"url":getRmoteFileHistoricContentURL,
						"error":errorAjax,
						"complete":stop_load_pic,
						"beforeSend":start_load_pic,
						"data":{"tid":data.tid},
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
document.getElementById("area").style.height=window.innerHeight+"px"
getRemoteFileHistoricList()
