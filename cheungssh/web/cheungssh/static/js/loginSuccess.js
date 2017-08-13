function loadLoginSuccessLog(){
	tbody=document.getElementById("loginSuccessTbody");
	//加载登录成功日志记录
	jQuery.ajax({
		"url":loginSuccessLogURL,
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var content=data.content;
				for(var i=0;i<content.length;i++){
					//每一行记录
					var line=content[i];
					var time=line.time;
					var ip=line.ip;
					var ip_locate=line.ip_locate;
					var username=line.owner;
					var tr=document.createElement("tr");
					//时间
					var td=document.createElement("td");
					td.textContent=time;
					tr.appendChild(td);
					//用户
					var td=document.createElement("td");
					td.textContent=username;
					tr.appendChild(td);
					//IP
					var td=document.createElement("td");
					td.textContent=ip;
					tr.appendChild(td);
					//IP归属
					var td=document.createElement("td");
					td.textContent=ip_locate;
					tr.appendChild(td);
					tbody.appendChild(tr)
				}
			}
		}
	});
}
$(function(){
	loadLoginSuccessLog();
	document.getElementById("refreshLoginSuccess").onclick=function(){
		loadLoginSuccessHTML();
	}
})
