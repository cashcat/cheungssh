/**
 * Created by 张其川 on 2016/10/9.
 */



function loadScriptList() {
    jQuery.ajax({
        "url": scriptListURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            //data是一个dict
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var scripts = data.content;
                for (var filename in scripts) {
                    var line = scripts[filename];
                    createScriptTableLine(line);
                }
            }
        }
    });
}

function showScriptContent(filename,owner) {
    //显示脚本内容
    //焦点
    jQuery.ajax({
        "url": getScriptContentURL,
        "dataType": "jsonp",
        "data": {"script_name": filename,"owner":owner},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var content = data.content;
                var scriptContent = document.getElementById("scriptContent");//textarea显示脚本
                $(scriptContent).val(content);//这里不能用html，content，因为他的值区域不同，所以读取的时候可能读不到，必须用val
                document.getElementById("scriptArea").style.display = "block";//显示隐藏的文本框
                $("#scriptArea").animate({
                    "top": "0%",
                })
                $("#scriptContent").setTextareaCount();


            }
        }
    });

}

function updateScriptParametersFunction(team){
	//创建操作系统选项
	document.getElementById("updateScriptParameters").setAttribute("tid",team.getAttribute("tid"))
	var sysData = team.getAttribute("data");
	sysData = JSON.parse(sysData);
	var os_type_list = JSON.parse(sysData.os_type)
        jQuery.ajax({
                "url":getSystemVersionURL,
                "error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
                "dataType":"jsonp",
                "type":"GET",
                "success":function(data){
                        responseCheck(data)
                        if (!data.status){
                                showErrrorInfo(data.content);
                                return false;
                        }
                        else{
                                $("#script_os_type").children().remove();//清空
				var t=document.getElementById("script_os_type");
				for(var i=0;i<data.content.length;i++){
					var div=document.createElement("div")
					var span=document.createElement("span")
					span.textContent= data.content[i];
					span.setAttribute("name",data.content[i]);
					span.style.cssText="cursor:pointer;"
					span.className="glyphicon glyphicon-unchecked";
					for(var x=0;x<os_type_list.length;x++){
						if(os_type_list[x] === data.content[i]){
							span.className="glyphicon glyphicon-check";
							console.log(os_type_list[x])
						}
					}
					span.textContent = data.content[i];
					div.style.cssText="margin-top:8px"
					span.onclick=function(){
						if($(this).hasClass("glyphicon-unchecked")){
							$(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
						}
						else{
							$(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
					}
				}
				div.appendChild(span)
				t.appendChild(div)
				}
				//
				$("#type option").attr("selected",false)
				console.log(sysData.type)
				$("#type").find('option[value="'  + sysData.type + '"]'   ).prop("selected",true)
				if(sysData.type === "脚本"){
					$("span[name='Switcher']").css({"display":"none"}).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
					$("span[name='Router']").css({"display":"none"}).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
				}
				else{
					$("span[name='Switcher']").css({"display":"block"})
					$("span[name='Router']").css({"display":"block"})
				}
                        }
                }
        })
	document.getElementById("scriptName").value = sysData.script_name;
	document.getElementById("scriptGroup").value = sysData.script_group;
	document.getElementById("scriptDescription").value=sysData.description;
	document.getElementById("updateScriptParameters").style.display="block";
	document.getElementById("inputScriptName").style.display="none";
	//参数部分
	$(".scriptParameterTemplateNew").remove()
	var parameters = JSON.parse(sysData.parameters)
	var parameterBody = document.getElementById("parameterBody");
	for (var i=0;i<parameters.length;i++){
		var newHTML=document.getElementsByClassName("scriptParameterTemplate")[0].cloneNode(true)
		newHTML.style.display="block";
		$(newHTML).find("input").eq(0).val(parameters[i].parameterName);
		$(newHTML).find("input").eq(1).val(parameters[i].parameterValue);
		$(newHTML).find(".parameterDescription").eq(0).val(parameters[i].parameterDescription);
		$(newHTML).addClass("scriptParameterTemplateNew")
		parameterBody.appendChild(newHTML)
	}
	
	startShadow();
	$("#showScriptName").show("fast");
	
}

function createScriptTableLine(data) {
    //创建脚本表格，每一行
    var showScriptTbody = document.getElementById("showScriptTbody");
    var tr = document.createElement("tr");
    //脚本名
    var script = document.createElement("td");
    script.textContent = data["script_name"];
    tr.appendChild(script);
    //组别
    var group = document.createElement("td");
    group.textContent = data["script_group"];
    tr.appendChild(group);

    var td = document.createElement("td");
    var span=document.createElement("span")
    span.textContent=data.type
    if(data.type === "脚本"){
	span.className = "label label-warning"
    }
    else{
	span.className= "label label-default"
    }
    td.appendChild(span)
    tr.appendChild(td);
    //归属
    var owner = document.createElement("td");
    owner.textContent = data['owner'];
    tr.appendChild(owner);
    //历史版本
    var historic_version = document.createElement("td");
    historic_version.textContent = data['historic_version'];
    historic_version.style.cssText="color:blue;text-align:center;cursor:pointer;"
    historic_version.setAttribute("sid",data.id)
    historic_version.onclick=function(){
	var sid = this.getAttribute("sid")
	//window.open("scripts_historic_list.html?sid="+sid,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,weight=100%,height=100%")
	window.open("scripts_historic_list.html?sid="+sid,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
    }
    tr.appendChild(historic_version);
    //适用系统
    var os_type = document.createElement("td");
    os_type.textContent = JSON.parse(data.os_type).join(" ")
    tr.appendChild(os_type);
    //创建时间
    var time = document.createElement("td");
    time.className = "hidden-xs";
    time.textContent = data["create_time"];
    tr.appendChild(time);
    //创建状态
    var td = document.createElement("td");
    var span=document.createElement("span");
    span.setAttribute("script_id",data.id);
    span.setAttribute("status","executable")
    span.style.cssText="cursor:pointer";
    span.onclick=function(){
	var span=this;
	var script_id=this.getAttribute("script_id")
	var executable = this.getAttribute("executable")
	jQuery.ajax({
		"url":changeExcutableStatusURL,
		"data":{"id":script_id},
		"error":errorAjax,
		"sendBefore":start_load_pic,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content)
				return false;
			}
			span.textContent=data.Content;
    			if(data.content==false){
				span.className = "label label-danger"
			    	span.textContent="已停用"
				span.setAttribute("executable",false)
			    }
			    else{
				span.className = "label label-success"
			    	span.textContent="正常"
				span.setAttribute("executable",true)
			    }
			showSuccessNotice("状态已变更。")
			
	
		}
	})
    }
    span.setAttribute("executable",data["executable"]);
    if(data.executable==false){
	span.className = "label label-danger"
    	span.textContent="已停用"
    }
    else{
	span.className = "label label-success"
    	span.textContent="正常"
    }
    td.appendChild(span)
    tr.appendChild(td);
    //描述
    var description = document.createElement("td");
    description.textContent = data['description'];
    tr.appendChild(description);
    //操作按钮
    var opTd = document.createElement("td");
    //编辑脚本按钮
    var editButton = document.createElement("button");
	document.getElementById("writeScriptContent").setAttribute("action","update")
	editButton.className="btn btn-xs btn-warning  glyphicon glyphicon-edit"
	editButton.setAttribute("data",JSON.stringify(data))
	editButton.setAttribute("tid",data.id)
	editButton.onclick=function(){
		updateScriptParametersFunction(this);
	}
	opTd.appendChild(editButton)
    var viewButton = document.createElement("button");
    viewButton.className = " btn btn-xs btn-primary  glyphicon glyphicon-eye-open";
    viewButton.setAttribute("owner",data["owner"])
    viewButton.setAttribute("script_name", data["script_name"]);
    viewButton.style.marginLeft = "3px";
    viewButton.onclick = function () {
	document.getElementById("writeScriptContent").setAttribute("action","update")
	document.getElementById("writeScriptContent").setAttribute("data",JSON.stringify({}))
	window.currentEditScriptContentButton=this;
        var filename = this.getAttribute("script_name");
        var owner = this.getAttribute("owner");
        showScriptContent(filename,owner);
        document.getElementById("scriptContent").focus();
        document.getElementById("writeScriptContent").setAttribute("filename", filename);//绑定提交按钮的属性
    }
    opTd.appendChild(viewButton);
    tr.appendChild(opTd);
    //删除按钮
    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
    deleteButton.setAttribute("filename", data["script_name"]);
    deleteButton.style.marginLeft = "3px";
    deleteButton.onclick = function () {
        deleteScript(this);
    }
    opTd.appendChild(deleteButton);
    tr.appendChild(opTd);
    //执行按钮
    var startButton = document.createElement("button");
    startButton.className = "btn btn-xs btn-success glyphicon glyphicon-play-circle";
    startButton.setAttribute("sid", data.id);
    startButton.setAttribute("data", JSON.stringify(data));

    startButton.style.marginLeft = "3px";
    startButton.onclick = function () {
	var data=this.getAttribute("data")
	data = JSON.parse(data)
	var id=data.id;
	var executable=$(this).parent().parent().find("span[status='executable']")[0].getAttribute("executable");
	if(executable==="false"){
		showErrorInfo("停用状态，不能使用！")
		return false;
	}
	var sid=this.getAttribute("sid")
	window.open("run_script.html?sid="+sid,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
	
	/*if (data.type==="脚本"){
	}
	else{
		window.open("batch_shell.html?id="+id,"_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
	}*/
	
    }
    opTd.appendChild(startButton);
    tr.appendChild(opTd);

    //最后加入表格
    showScriptTbody.appendChild(tr);
}

function deleteScript(deleteButton) {
    //删除脚本，deleteButton是删除按钮，有filename属性
    var filename = deleteButton.getAttribute("filename");
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteScriptURL,
        "dataType": "jsonp",
        "data": {"script_name": filename},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotice("已删除");
                $(tr).remove();//删除表格的行
            }
        }
    });

}

function initScriptDropZ() {
	//拖动上传脚本
    var dropz = new Dropzone("#uploadScriptDropz", {
        url: uploadScriptToCheungSSH,
        clickable: false,//取消点击
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        window.fileUploadLocalFileName = file.name;//拖动上传的文件名;
        startShadow();
        var showScriptProgressText = document.getElementById("showScriptProgressText");
        showScriptProgressText.innerText = 0 + "%";
        showScriptProgressText.style.width = "0%";
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "0%",
            }
        );

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var showScriptProgressText = document.getElementById("showScriptProgressText");
        progress = parseInt(progress);
        if (isNaN(progress)) {
            //表示上传失败
            showErrorInfo("不能连接到服务器")
            return false;
        }
        showScriptProgressText.innerText = progress + "%";
        showScriptProgressText.style.width = progress + "%";
    });
    dropz.on("success", function (file, data) {
        //上传成功,data是服务器返回的消息
        stopShadow();
        $("#dropz").slideUp("fast");//关闭上传界面
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "120%",
            }
        ); //关闭进度显示
        data = JSON.parse(data);
        if (!data.status) {
            showErrorInfo(data.content);
            return false;
        }
        var content = data.content;
        createScriptTableLine(content);//创建一行新的


    })
    //https://www.renfei.org/blog/dropzone-js-introduction.html
}


function submitScriptContent(team) {
    //提交脚本内容
    var data=team.getAttribute("data")
    data = JSON.parse(data)
    data.script_name = team.getAttribute("filename")
    data.content= $("#scriptContent").val();
    jQuery.ajax({
        "url": writeScriptContentURL,
        "type": "POST",
        "data": {"parameters":JSON.stringify(data),"action":document.getElementById("writeScriptContent").getAttribute("action")},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            data = JSON.parse(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
        	loadScriptHTML();
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



document.getElementById("addParameterTemplate").onclick=function(){
	var newHTML=document.getElementsByClassName("scriptParameterTemplate")[0].cloneNode(true)
	newHTML.style.display="block";
	$(newHTML).addClass("scriptParameterTemplateNew")
	var parameterBody = document.getElementById("parameterBody");
	parameterBody.appendChild(newHTML)
}
$(document).on("click",".removeParameterTemplate",function(){
	$(this).parent().parent().remove();
})
//绑定输入脚本名的下一步
document.getElementById("inputScriptName").onclick = function () {
	var data = {};
        data.script_name = document.getElementById("scriptName").value;
	data.description = $("#scriptDescription").val();
	data.script_group = document.getElementById("scriptGroup").value;
	data.type = $("#type").val()
	data.os_type = [];
	$("#script_os_type .glyphicon-check").each(function(){
		if (this.style.display==="none"){
			
		}
		else{
			data.os_type.push(this.textContent)
		}
	})
        if (/^ *$/.test(data.script_name)) {
            $("#showScriptName").effect("shake");//没有输入文件名
            document.getElementById("scriptName").focus();
            return false;
        }
	else if(data.script_group.match(/^ *$/)){
            $("#showScriptName").effect("shake");//没有输入文件名
            document.getElementById("scriptGroup").focus();
            return false;
	}
	else if(data.os_type.length===0){
            $("#showScriptName").effect("shake");//没有输入文件名
            return false;
	}
	data.parameters = [];
	var isBreak = false
	$(".scriptParameterTemplateNew").each(function(){
		var inputs = $(this).find("input")
		var parameterName = inputs.eq(0).val()
		var parameterValue = inputs.eq(1).val()
		var parameterDescription = $(this).find(".parameterDescription").eq(0).val()
		if(parameterName.match(/^ *$/)){
			inputs[0].focus()
            		$("#showScriptName").effect("shake");
			isBreak = true
       		     	return false;
		}
		data.parameters.push({
			"parameterName":parameterName,
			"parameterValue":parameterValue,
			"parameterDescription":parameterDescription,
		})
	})
	if(isBreak === true){
            $("#showScriptName").effect("shake");//没有输入文件名
		return false;
	}
        stopShadow();
        var t=document.getElementById("writeScriptContent")
	t.setAttribute("filename", data.script_name);//绑定属性，提交的时候需要使用
        document.getElementById("showScriptName").style.display = "none";//关闭脚本名输入框
	document.getElementById("scriptArea").style.display="block";
        $("#scriptArea").animate({
            "top": "0%",
        });
	document.getElementById("writeScriptContent").setAttribute("data",JSON.stringify(data))
        document.getElementById("scriptContent").focus();
    }

document.getElementById("updateScriptParameters").onclick=function(){
	var data = {};
	data.id=this.getAttribute("tid")
        data.script_name = document.getElementById("scriptName").value;
	data.description = $("#scriptDescription").val()
	data.script_group = document.getElementById("scriptGroup").value;
	data.type = $("#type").val();
	data.os_type = [];
	$("#script_os_type .glyphicon-check").each(function(){
		data.os_type.push(this.textContent)
	})
        if (/^ *$/.test(data.script_name)) {
            $("#showScriptName").effect("shake");//没有输入文件名
            document.getElementById("scriptName").focus();
            return false;
        }
	else if(data.script_group.match(/^ *$/)){
            $("#showScriptName").effect("shake");//没有输入文件名
            document.getElementById("scriptGroup").focus();
            return false;
	}
	else if(data.os_type.length===0){
            $("#showScriptName").effect("shake");//没有输入文件名
            return false;
	}
	data.parameters = [];
	var isBreak = false
	$(".scriptParameterTemplateNew").each(function(){
		var inputs = $(this).find("input")
		var parameterName = inputs.eq(0).val()
		var parameterValue = inputs.eq(1).val()
		var parameterDescription = $(this).find(".parameterDescription").eq(0).val()
		if(parameterName.match(/^ *$/)){
			inputs[0].focus()
            		$("#showScriptName").effect("shake");
			isBreak = true
       		     	return false;
		}
		data.parameters.push({
			"parameterName":parameterName,
			"parameterValue":parameterValue,
			"parameterDescription":parameterDescription,
		})
	})
	if(isBreak === true){
            $("#showScriptName").effect("shake");//没有输入文件名
		return false;
	}
        stopShadow();
        document.getElementById("showScriptName").style.display = "none";//关闭脚本名输入框
    jQuery.ajax({
        "url": rewriteScriptContentURL,
        "type": "POST",
        "data": {"parameters":JSON.stringify(data),"action":document.getElementById("writeScriptContent").getAttribute("action")},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            data = JSON.parse(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
		loadScriptHTML();
            }
        }
    });
}

document.getElementById("type").onchange=function(){
	var value = $(this).val()
	if(value === "脚本"){
		$("span[name='Switcher']").css({"display":"none"}).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
		$("span[name='Router']").css({"display":"none"}).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
	}
	else{
		$("span[name='Switcher']")[0].style.display="block"
		$("span[name='Router']")[0].style.display="block";
	}
}

//初始化加载
$(function () {

    //initScriptDropZ()//绑定拖动上传脚本
    //绑定刷新按钮
    document.getElementById("refreshScriptList").onclick = function () {
        loadScriptHTML();
    }
    //加载脚本列表
    loadScriptList();
    //绑定关闭脚本内容按钮
    document.getElementById("closeScriptContent").onclick = function () {
        $("#scriptArea").animate({
            "top": "100%",
        }, function () {
            document.getElementById("scriptArea").style.display = "none";
        });


    }
    //绑定脚本输入框的键盘按下
    document.getElementById("scriptContent").onkeydown = function () {
        if (event.keyCode == 9) {
            $(this).insertAtCaret("\t");//按下制表符，就\tab
        }
    }
    //绑定创建脚本/更新脚本按钮
    document.getElementById("writeScriptContent").onclick = function () {
        submitScriptContent(this);
    }
    //关闭脚本文件输入框
    document.getElementById("closeScriptNameButton").onclick = function () {
        stopShadow();
        $("#showScriptName").hide("fast");
    }
    //创建脚本按钮
    document.getElementById("createScriptName").onclick = function () {
	document.getElementById("writeScriptContent").setAttribute("action","create")
	document.getElementById("updateScriptParameters").style.display="none"
	document.getElementById("inputScriptName").style.display="block"
	
        document.getElementById("scriptName").value = "";
	document.getElementById("scriptGroup").value="";
	document.getElementById("scriptDescription").value="";
	$(".scriptParameterTemplateNew").remove()
	//创建操作系统选项
        jQuery.ajax({
                "url":getSystemVersionURL,
                "error":errorAjax,
                "dataType":"jsonp",
                "type":"GET",
                "success":function(data){
                        responseCheck(data)
                        if (!data.status){
                                showErrrorInfo(data.content);
                                return false;
                        }
                        else{
                                $("#script_os_type").children().remove();//清空
				var t=document.getElementById("script_os_type");
				for(var i=0;i<data.content.length;i++){
				var div=document.createElement("div")
				var span=document.createElement("span")
				span.className="glyphicon glyphicon-unchecked";
				span.style.cssText="cursor:pointer;"
				span.textContent= data.content[i];
				span.setAttribute("name",data.content[i]);
				div.style.cssText="margin-top:8px;"
				span.onclick=function(){
					if($(this).hasClass("glyphicon-unchecked")){
						$(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
					}
					else{
						$(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
					}
				}
				if (data.content[i] === "Switcher" || data.content[i] === "Router"){
					span.style.display="none";
				}
				div.appendChild(span)
				t.appendChild(div)
				}
                        }
                }
        })
        $("#showScriptName").show("fast");
        document.getElementById("scriptName").focus();
        startShadow();
    }
    $( ".modal-content" ).draggable();//窗口拖动
})
