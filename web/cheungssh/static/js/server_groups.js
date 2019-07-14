function getSelectServers(){
	var servers = {"alias":[],"id":[]};
	$('li[data-level="2"]').each(function(){
		if($(this).find("i").hasClass("icon-check-box-cicre")){
			servers.id.push(this.getAttribute("data-id"))
			servers.alias.push(this.textContent)
		}
	})
	return servers
}
function getServerGroups(){
	jQuery.ajax({
		"url":getServerGroupsURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"script_id":getKey("sid")},
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			new verTree({
				items:"#serverGroup",
				type:"form",
				data:data.content,
				parent:"pid",
				params:"id",
				value:"name"
			});
		}
	})



}
document.getElementById("confirm").onclick=function(){
	var servers = getSelectServers()
	if(servers.alias.length===0){
		showErrorInfo("请最少选择一个主机！")
		return false;
	}
	var action = getKey("action")
	if (action==="package"){
		window.open("command.html","_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
	}
	else{
		//文件上传和下载部分的功能
 		window.opener.$("#remotePathDIV").slideDown("fast");
		try{
			window.opener.document.getElementById("remotePath").focus();
			window.opener.document.getElementById("shadow").style.display="block"
		}
		catch(e){
			//下载功能
			window.opener.document.getElementById("shadow").style.display="block"
			window.opener.$("#remoteDownloadPathDIV").show("fast");
			window.opener.document.getElementById("remoteDownloadPath").focus();
		}
    		window.opener.window.currentfileUploadSelectedServers=servers
	    	window.opener.window.currentfileDownloadSelectedServers=servers
	}
	window.close()
}
getServerGroups()
