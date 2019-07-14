function initDropZSoftware() {
    var dropz = new Dropzone("#dropz", {
        url: uploadSoftwareURL,
    });
    dropz.on("addedfile", function (file) {
        //alert("添加了文件")
        //document.getElementById("dropz").innerHTML=""
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        document.getElementById("uploadFileProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;//拖动上传的文件名;
        startShadow();

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadFileProgress=document.getElementById("uploadFileProgress");
        progress=parseInt(progress);
        if(isNaN(progress)){
            //表示上传失败
            showErrorInfo("不能连接到服务器")
        }

        uploadFileProgress.innerText=progress +"%";
    });
    dropz.on("success",function(file,tmp){
        //上传成功
        stopShadow();
        $("#dropz").slideUp("fast");//关闭上传界面
        document.getElementById("uploadFileProgress").style.display="none"; //关闭进度显示
	var data = JSON.parse(tmp)
	createSoftwareListLine(data.content)
	startShadow();
	$("#descriptionDIV").show("fast")
	document.getElementById("replaceDescription").setAttribute("tid",data.content.id)
	document.getElementById("scriptName").focus();
	
    })
    //https://www.renfei.org/blog/dropzone-js-introduction.html
}
function createSoftwareListLine(data){
	var tbody=document.getElementById("softwareTbody")
	var tr=document.createElement("tr")

	var td=document.createElement("td")
	td.textContent=data.name;
	tr.appendChild(td)

	var td=document.createElement("td")
	var span=document.createElement("span")
	if (data.env === "python" ){
		span.className="label label-success"
	}
	else if(data.env === "sh"){
		span.className="label label-warning"
	}
	else if(data.env === "php"){
		span.className="label label-primary"
	}
	else if(data.env === "perl"){
		span.className="label label-info"
	}
	span.textContent=data.env.toUpperCase();
	td.appendChild(span)
	tr.appendChild(td)

	var td=document.createElement("td")
	td.textContent=data.script_name;
	tr.appendChild(td)

	var td=document.createElement("td")
	td.textContent=data.create_time;
	tr.appendChild(td)
	
	var td=document.createElement("td")
	td.textContent=data.description;
	tr.appendChild(td)
	
	var td=document.createElement("td")
	var editButton=document.createElement("button")
	editButton.className = "glyphicon glyphicon-edit btn btn-primary btn-xs"
	editButton.setAttribute("data",JSON.stringify(data))
	editButton.onclick=function(){
		var data = JSON.parse(this.getAttribute("data"))
		startShadow()
		$("#descriptionDIV").show("fast");
		$("#env").find('option[value="'  + data.env + '"]'   ).prop("selected",true)
		var t=document.getElementById("scriptName")
		t.value = data.script_name;
		document.getElementById("description").value = data.description;
		t.focus();
		document.getElementById("replaceDescription").setAttribute("tid",data.id)
	}
	var deleteButton=document.createElement("button")
	deleteButton.className = "glyphicon glyphicon-trash btn btn-danger btn-xs"
	deleteButton.style.cssText="margin-left:3px;"
	deleteButton.setAttribute("data",JSON.stringify(data))
	deleteButton.onclick=function(){
		var tr=this.parentNode.parentNode
		var data = JSON.parse(this.getAttribute("data"))
		jQuery.ajax({
			"url":delSoftwareURL,
			"beforeSend":start_load_pic,
			"complete":stop_load_pic,
			"error":errorAjax,
			"dataType":"jsonp",
			"data":{"id":data.id},
			"success":function(data){
				responseCheck(data)
				if(!data.status){
					showErrorInfo(data.content)
					return false;
				}
				$(tr).children().remove()
				showSuccessNotice();
			}
		})
	}
	var runButton=document.createElement("button")
	runButton.className = "glyphicon glyphicon-play-circle btn btn-success btn-xs"
	runButton.style.cssText="margin-left:3px;"
	runButton.setAttribute("pid",data.id)
	runButton.onclick=function(){
		var id=this.getAttribute("pid")
		window.open("server_groups.html?action=package&id="+id,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
		
	}

	
	td.appendChild(editButton)
	td.appendChild(deleteButton)
	td.appendChild(runButton)
	tr.appendChild(td)

	tbody.appendChild(tr)
	
}
initDropZSoftware()
document.getElementById("addSoftware").onclick=function(){
            $("#dropz").slideDown("fast");
	document.getElementById("description").value="";
	document.getElementById("scriptName").value="";
}
document.getElementById("replaceDescription").onclick=function(){
	var data={}
	data.id = this.getAttribute("tid")
	data.description = document.getElementById("description").value
	data.script_name = document.getElementById("scriptName").value
	data.env = $("#env").val();
	if (/^ *$/.test(data.script_name)){
        	$("#descriptionDIV").effect("shake");
		document.getElementById("scriptName").focus();
		return false;
	}
	document.getElementById("descriptionDIV").style.display="none";
	stopShadow()
	jQuery.ajax({
		"url":descriptionSoftwareURL,
		"data":{"data":JSON.stringify(data)},
		"type":"POST",
		"error":errorAjax,
		"beforeSend":stop_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			responseCheck(data)
			data = JSON.parse(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			showSuccessNotice();
			loadSoftwareList()
		}
	})
}
function loadSoftwareList(){
	$("#softwareTbody").children().remove()
	jQuery.ajax({
		"url":getSoftwareListURL,
		"dataType":"jsonp",
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			for(var i=0;i<data.content.length;i++){
				createSoftwareListLine(data.content[i])
			}
		}
	})
}
$( ".modal-content" ).draggable();//窗口拖动
loadSoftwareList();
document.getElementById("refreshSoftwareList").onclick=function(){
	loadSoftwareList();
}
