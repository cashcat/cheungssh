/**
 * Created by 张其川 on 2016/10/15.
 */




function closeEditDiv(){
    //关闭编辑框Div
    stopShadow();
    $("#remoteFileEditDiv").hide("fast");
}

function showEditDiv(){
    //显示编辑DIv
    startShadow();
    $("#remoteFileEditDiv").show("fast");
    document.getElementById("remoteFilePath").focus();
}

function createRemoteFileLine(data){
    var tbody=document.getElementById("remoteFileTbody");
    var tr=document.createElement("tr");

    //归属
    var td=document.createElement("td");
    td.textContent=data.username;
    tr.appendChild(td);

    //路径
    var td=document.createElement("td");
    td.textContent=data.path;
    tr.appendChild(td);

    //主机别名
    var td=document.createElement("td");
    td.textContent=data.alias;
    tr.appendChild(td);

    //时间
    var td=document.createElement("td");
    td.textContent=data.create_time;
    tr.appendChild(td);

    //IP
    var td=document.createElement("td");
    td.textContent=data.ip;
    tr.appendChild(td);

    //历史版本
    var td=document.createElement("td");
    td.style.cssText="text-align:center;cursor:pointer;color:blue;"
    if(data.history_version === -1){
    	td.textContent=0;
    }
    else{

    	td.textContent=data.history_version;
    }
    if(data.history_version > 0){
	td.setAttribute("tid",data.id)
	td.onclick=function(){
		var id = this.getAttribute("tid")
		window.open("file_historic_list.html?id="+id,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
	}
    }
    tr.appendChild(td);


    //描述
    var td=document.createElement("td");
    td.textContent=data.description;
    tr.appendChild(td);



    //操作区域
    //查看按钮
    var td=document.createElement("td");
    var viewButton=document.createElement("button");
    viewButton.className="btn btn-primary  btn-xs glyphicon glyphicon-eye-open";
    viewButton.setAttribute("data",JSON.stringify(data))
    viewButton.setAttribute("remote_file_id",data.id)
    viewButton.onclick=function(){
        var data=JSON.parse(this.getAttribute("data"));
	document.getElementById("writeRemoteFileContentButton").setAttribute("tid",data.id)
        loadRemoteFileContentToTextArea(data.id);

    }
    viewButton.style.marginLeft="3px";
    td.appendChild(viewButton);
    //编辑按钮
    var editButton=document.createElement("button");
    editButton.className="btn btn-success btn-xs  glyphicon glyphicon-edit";
    editButton.setAttribute("data",JSON.stringify(data));
    editButton.style.marginLeft="3px";
    editButton.onclick=function(){
	var data=this.getAttribute("data")
	document.getElementById("changePermission").setAttribute("data",data)
	startShadow()
	$("#KKK").show("fast")
    }
    td.appendChild(editButton);
    //删除按钮
    var deleteButton=document.createElement("button");
    deleteButton.className="btn btn-danger btn-xs  glyphicon glyphicon-trash";
    deleteButton.setAttribute("tid",data.id);
    deleteButton.style.marginLeft="3px";
    deleteButton.onclick=function(){
        deleteRemoteFile(this);
    }
    td.appendChild(deleteButton);
    tr.appendChild(td);

    tbody.appendChild(tr);
}

function loadRemoteFileContentToTextArea(id){
    //加载脚本文件内容到编辑框中
    jQuery.ajax({
        "url":getRemoteFileContentURL,
        "dataType":"jsonp",
        "data":{"id":id},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
		responseCheck(data)
            if(!data.status){
		showErrorInfo(data.content);
                return false;
            }
	    else if (data.ask === true){
		startShadow();
		document.getElementById("showFileAskContent").textContent = data.content;
		$("#showFileAskDiv").show("fast")
		}
            else{
		document.getElementById("remoteFileArea").style.display="block";//显示文本框
                $("#remoteFileArea").animate({
                    "top":"0%",
                });
                var content=data.content;
                var t=document.getElementById("showRemoteFileContent");
                t.value=content;
                t.focus();
            }
        }
    });


}


function updateRemoteFileList(){
    //更新表中配置值
    var td=window.currentRemoteFileButton.parentNode;
    var path=document.getElementById("remoteFilePath").value;
    var select=document.getElementById("remoteFileServer");//下拉框
    var sid=select.value;//value属性的值
    var options=select.options;//全部的options
    var index=select.selectedIndex;//option被选中的缩影
    var alias=options[index].text;//获取option的文本
    var owner=document.getElementById("showRemoteFileOwner").value;
    var description=document.getElementById("remoteFileDescription").value;
    if(/^ *$/.test(path) || /^ *$/.test(owner)  ){
        //不可以为为空
        $("#remoteFileEditDiv").effect("shake");
        return false;
    }
    else{


        $(td).siblings(".path")[0].textContent=path;
        $(td).siblings(".owner")[0].textContent=owner;
        $(td).siblings(".alias")[0].textContent=alias;
        $(td).siblings(".alias")[0].textContent=alias;
        $(td).siblings(".alias")[0].setAttribute("sid",sid);
        $(td).siblings(".description")[0].textContent=description;



    }


}

function loadRemoteFileToEdit(editButton){
    //加载远程文件配置清单到编辑框中
    var td=editButton.parentNode;
    var id=editButton.getAttribute("id");
    var owner=$(td).siblings(".owner")[0].textContent;
    var path=$(td).siblings(".path")[0].textContent;
    var sid=$(td).siblings(".alias")[0].getAttribute("sid");
    var description=$(td).siblings(".description")[0].textContent;
    showEditDiv();
    document.getElementById("remoteFilePath").value=path;
    document.getElementById("remoteFileDescription").value=description;
    //设置服务器选中值
    var serverSelect = document.getElementById("remoteFileServer");
    for(var i=0; i<serverSelect.options.length; i++){
        if(serverSelect.options[i].value == sid){
            serverSelect.options[i].selected = true;
            break;
        }
    }
    //属主
    var ownerSelect = document.getElementById("showRemoteFileOwner");
    for(var i=0; i<ownerSelect.options.length; i++){
        if(ownerSelect.options[i].textContent == owner){
            ownerSelect.options[i].selected = true;
            break;
        }
    }

}

function deleteRemoteFile(deleteButton){
    //根据ID删除记录
    var id=deleteButton.getAttribute("tid");
    jQuery.ajax({
        "url":deleteRemoteFileListURL,
        "data":{"id":id},
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
                //删除行
                var td=deleteButton.parentNode;
                var tr=td.parentNode;
                $(tr).remove();
            }
        }
    });
}


function loadServers(){
    var select=document.getElementById("remoteFileServer");
    for(var i=0;i<window.allServersList.length;i++){
        var sid=window.allServersList[i]["id"];
        var alias=window.allServersList[i]["alias"];
        var option=document.createElement("option");
        option.textContent=alias;
        option.value=sid;
        select.appendChild(option);
    }
}


function loadRemoteFileList(){
    $("#remoteFileTbody").children().remove()
    //加载远程文件路径清单
    jQuery.ajax({
        "url":getRemoteFileListURL,
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                var content=data.content;
                for( id in content){
                    var line=content[id];
                    createRemoteFileLine(line);
                }
            }
        }
    });
}


(function ($) {
    //tab制表符
    $.fn.extend({
        insertAtCaret: function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
            }
            else {
                this.value += myValue;
                this.focus();
            }
        }
    })
})(jQuery);

function closeAreaText(){
    //关闭显示文件内容的文本框
    $("#remoteFileArea").animate({
        "top":"100%",
    },function(){
		document.getElementById("remoteFileArea").style.display="none";
	});
}

function updateRemoteFileContent(){
    //写入远程文件内容
    var content=document.getElementById("showRemoteFileContent").value;
    var tid=document.getElementById("writeRemoteFileContentButton").getAttribute("tid");
    jQuery.ajax({
        "url":writeRemoteFileContentURL,
        "type":"POST",
        "data":{"id":tid,"content":content},
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
		data = JSON.parse(data);
		if (!data.status){
			showErrorInfo(data.content);
			return false;
		}
		else{
			closeAreaText();
			showSuccessNotic();
    			loadRemoteFileList();
		}


        }
    });

}
document.getElementById("sureCreateFile").onclick=function(){
		stopShadow();
		$("#showFileAskDiv").hide("fast")
		document.getElementById("remoteFileArea").style.display="block";//显示文本框
               $("#remoteFileArea").animate({
                    "top":"0%",
                });
                var t=document.getElementById("showRemoteFileContent");
                t.value="";
                t.focus();
	
}
document.getElementById("closeT").onclick=function(){
	$("#KKK").hide("fast")
	stopShadow();
}
document.getElementById("changePermission").onclick=function(){
	var  data =document.getElementById("changePermission").getAttribute("data")
	var permission = document.getElementById("filePermission").value;
	if(permission.length!==4){
		showErrorInfo("请填写正确的Linux权限代码，如0755")
		return false;
	}
	data=JSON.parse(data)
	jQuery.ajax({
		"url":changeFilePermissionURL,
		"data":{"id":id,"permission":permission},
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			data = JSON.parse(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			stopShadow()
			$("#KKK").hide("fast")
			showSuccessNotice();
			
		}
	})
			
}
$(function(){
    //加载用户列表
    loadServers();//加载服务器列表
    //关闭Div
    document.getElementById("closeRemoteFileDiv").onclick=function(){
        closeEditDiv();
    }
    //显示Div
    document.getElementById("createRemoteFile").onclick=function(){
        document.getElementById("saveRemoteFileManage").removeAttribute("tid");//删除tid，表示新建
        window.currentRemoteFileModel="create";
        showEditDiv();
    }
    //绑定刷新
    document.getElementById("refreshRemoteFile").onclick=function(){
    	loadRemoteFileList();
    }
    //绑定保存按钮
    document.getElementById("saveRemoteFileManage").onclick=function(){
    	    //获取填写的表单值
	    var path=document.getElementById("remoteFilePath").value;
	    var select=document.getElementById("remoteFileServer");//下拉框
	    var server=select.value;//value属性的值
	    var options=select.options;//全部的options
	    var index=select.selectedIndex;//option被选中的缩影
	    var alias=options[index].text;//获取option的文本
	    var description=document.getElementById("remoteFileDescription").value;
	    getRemoteFileSetValue(path,server,alias,description);

    }
    //加载远程文件清单
    loadRemoteFileList();
    //$("#showRemoteFileContent").setTextareaCount();//绑定行
    //绑定脚本输入框的键盘按下
    document.getElementById("showRemoteFileContent").onkeydown = function () {
        if (event.keyCode == 9) {
            $(this).insertAtCaret("\t");//按下制表符，就\tab
        }
    }
    //关闭显示远程文件内容的按钮
    document.getElementById("closeRemoteFileContentButton").onclick=function(){
        closeAreaText()
    }
    //绑定更新文件内容按钮
    document.getElementById("writeRemoteFileContentButton").onclick=function(){
        updateRemoteFileContent();
    }

    $( ".modal-content" ).draggable();//窗口拖动

})
