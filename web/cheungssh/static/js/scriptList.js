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

function createScriptTableLine(data) {
    //创建脚本表格，每一行
    var showScriptTbody = document.getElementById("showScriptTbody");
    var tr = document.createElement("tr");
	var parameter = JSON.parse(data.parameters)
	
	var td = document.createElement("td")
	var span=document.createElement("span")
	span.className ="glyphicon glyphicon-unchecked"
	span.setAttribute("os",data.os_type)
	span.setAttribute("tid",data.id)
	span.setAttribute("lengthOfParameter",parameter.length)
	var sourceList = JSON.parse(getKey("list"))
	if (sourceList.indexOf(data.id) > -1 || sourceList.indexOf(data.id.toString()) >-1 ){
		tr.style.cssText="background:rgb(96, 181, 94)"
		span.className = "glyphicon glyphicon-check" 
	}
	else{
		span.className = "glyphicon glyphicon-unchecked" 
	}
	
	td.onclick=function(){
		if($(this).find("span").eq(0).hasClass("glyphicon-unchecked")){
			$(this).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
			this.parentNode.style.cssText="background:rgb(96, 181, 94)"
		}
		else{
			$(this).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
			this.parentNode.style.cssText=""
		}
		var amount = []
		$("td>.glyphicon-check").each(function(){
			var length = parseInt(this.getAttribute("lengthOfParameter"))
			amount.push(length)
		})
		for(var i=1;i<amount.length;i++){
			console.log(amount[i])
			if(amount[i] !== amount[i-1]){
		$(this).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
		this.parentNode.style.cssText=""
				showErrorInfo("该目标目标与别的脚本/批量命令的参数个数不相同不能绑在一起，请审核！")
				return false;
			}
		}
					
	}
	td.style.cssText="text-align:center;cursor:pointer;"
	td.appendChild(span)
	tr.appendChild(td)

    //脚本名
    var script = document.createElement("td");
    script.textContent = data["script_name"];
    tr.appendChild(script);

    var td = document.createElement("td");
	td.textContent = parameter.length
    tr.appendChild(td);
	

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
    //最后加入表格
    showScriptTbody.appendChild(tr);
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
document.getElementById("add").onclick=function(){
	var list = [];
	var os_list = []
	$("td>.glyphicon-check").each(function(){
		var id = this.getAttribute("tid")
		os_list = os_list.concat(JSON.parse(this.getAttribute("os")))
		list.push(id)
	})
	if(list.length===0){
		showErrorInfo("请选择最少一个脚本/批量命令！")
		return false;
	}
	//检查是否有重复的操作系统
	var force = false
	for(var i=0;i<os_list.length;i++){
		var repeat = 0
		var _os = os_list[i]
		for(var x=0;x<os_list.length;x++){
			if(_os === os_list[x]){
				repeat += 1
			}
			if(repeat >1 && force === false){
				var q = confirm("被选中的部分脚本/批量命令适用的系统存在重复的情况，真的要保存吗？")
				if(q){
					force = true
				}
				else{
					return false
				}
		
			}
		}
	}
	var t = window.opener.document.getElementById("scriptList");
	t.value = list.length + " 个"
	t.setAttribute("list",JSON.stringify(list))
	window.close()
}
//加载脚本列表
loadScriptList();
$( ".modal-content" ).draggable();//窗口拖动
