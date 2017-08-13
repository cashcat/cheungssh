/**
 * Created by 张其川 on 2016/7/4.
 */




function initLogfileDropZ() {
    var dropz = new Dropzone("#uploadLogfileDropz", {
        url: uploadAnalysisLogfileURL,
        clickable: false,//取消点击
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        window.fileUploadLocalFileName = file.name;//拖动上传的文件名;
        startShadow();
        var showUploadLogfileProgressText = document.getElementById("showUploadLogfileProgressText");
        showUploadLogfileProgressText.innerText = 0 + "%";
        showUploadLogfileProgressText.style.width = "0%";
        $("#uploadLogfileProgressDiv").animate(
            {
                "left": "0%",
            }
        );

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var showUploadLogfileProgressText = document.getElementById("showUploadLogfileProgressText");
        progress = parseInt(progress);
        if (isNaN(progress)) {
            //表示上传失败
            showErrorInfo("不能连接到服务器")
            return false;
        }
        showUploadLogfileProgressText.innerText = progress + "%";
        showUploadLogfileProgressText.style.width = progress + "%";
    });
    dropz.on("success", function (file, data) {
        //上传成功,data是服务器返回的消息
        stopShadow();
        $("#uploadLogfileProgressDiv").animate(
            {
                "left": "120%",
            }
        ); //关闭进度显示
        data = JSON.parse(data);
        if (!data.status) {
            showErrorInfo(data.content);
            return false;
        }
	else{
		window.localLogFileName=file.name;
		getLogFileDate(file.name,"","local");
	}
    })
}



function getLogFileDate(filename,realname,type){
	jQuery.ajax({
		"url":getLogDateURL,
		"error":errorAjax,
		"type":"get",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"data":{"filename":filename,"realname":realname,"type":type},
		"success":function(data){
		responseCheck(data)
	       	 if (! data.status){
			showErrorInfo(data.content);
			return false;
		}
		else{
       	 		var content = data.content;
			var content=data.content["date"];
			//创建日期的select
			var select=document.getElementById("showLogDate");
			$(select).children().remove();//删除历史
			for(var i=0;i<content.length;i++){
				var option=document.createElement("option");
				option.textContent=content[i];
				select.appendChild(option);
			}
			startShadow()
			$("#selectLogDateDiv").show("fast");
			//重置文件名
			if (type==="remote"){
				window.localLogFileName=data.content.realname;
			}
		}
	    }
	});
    }

function getAnalysisLogResult(){
	//获取日志统计数据
	//获取选择的日期
	var _date=document.getElementById("showLogDate").value;	

	jQuery.ajax({
		"url":getAnalysisLogResultURL,
		"data":{"filename":window.localLogFileName,"date":_date,},
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"dataType":"jsonp",
		"type":"get",
		"success":function(data){
			responseCheck(data);
			if (! data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var content=data.content;
				createAnalysisPic(content);
			}
		}
	})
}


///////////





function dashboardChart(data, element, chartType) {


    var options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 0, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps: 50,

        //String - Animation easing effect
        animationEasing: "easeOutBounce",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

    }


    var e = document.getElementById(element).getContext('2d');
    if (chartType === "pie") {
        new Chart(e).Pie(data, options);

    } else {
        new Chart(e).Line(data, options);

    }


}




function areaChart(allData) {
	        var data=[];
        for(var code in allData){
                var t={
                        "value":allData[code].value,
                        "color":allData[code].color,
                        "label":allData[code].name,
                        }
                data.push(t);

        }



    dashboardChart(data, 'httpCode', 'pie');   //磁盘


}




function createAnalysisPic(allData){
	$("#uploadLogfileDropz").children().remove();
	//创建指定时间内，24小时访问量做多的时间段
	//
	
	var _date=document.getElementById("showLogDate").value;
	var name=allData.time_seg.name+ "(" + _date + ")";
	var value=allData.time_seg.value;
	(function (){
		accessHours=[];
		accessValue=[]
		for(var i=0;i<value.length;i++){
			var _time=value[i][0];
			var _v=value[i][1].count;
			accessHours.push(_time);
			accessValue.push(_v);
		}
	}())

	    var maxHourData = {
        labels: accessHours,


        datasets: [
            {
                label: "XXXXXXXXXXXXXXX",
                fillColor: "write",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "write",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: accessValue
            },

        ]
    };

	var div=document.getElementById("uploadLogfileDropz");
	
	//创建标题
	var title=document.createElement("h2");
	title.textContent=name;
	div.appendChild(title);
	title.style.textAlign="center";
	//创建canvas
	var canvas=document.createElement("canvas");
	canvas.style.cssText="width:80%;margin-left:10%;"
	canvas.setAttribute("id","hourMax");
	div.appendChild(canvas);



	//创建24小时访问段最高的
	dashboardChart(maxHourData,"hourMax","line")









	var name=allData.max_url.name+ "(" + _date + ")";
	var value=allData.max_url.value;
	(function (){
		accessURL=[];
		accessCount=[]
		for(var i=0;i<value.length;i++){
			for (_time in value[i]){
				for( var ii=0;ii<value[i][_time].length;ii++){
					url=  value[i][_time][ii][0]
					count=value[i][_time][ii][1]
					accessURL.push( _time+url);
					accessCount.push(count);
				}
			}
		}
	}())

	    var maxURLData = {
        labels: accessURL,


        datasets: [
            {
                label: "XXXXXXXXXXXXXXX",
                fillColor: "write",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "write",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: accessCount
            },

        ]
    };
	//创建标题
	var title=document.createElement("h2");
	title.textContent=name;
	title.style.textAlign="center";
	div.appendChild(title);
	//创建canvas
	var canvas=document.createElement("canvas");
	canvas.setAttribute("id","urlMax");
	canvas.style.cssText="width:90%;margin-left:5%;height:700px;"
	div.appendChild(canvas);
	//创建URL最高的
	dashboardChart(maxURLData,"urlMax","line")

	//创建返回状态码
	//

	//创建标题
	var name=allData.http_code.name+ "(" + _date + ")";
	var title=document.createElement("h2");
	title.textContent=name;
	title.style.textAlign="center";
	div.appendChild(title);
	//创建canvas
	var canvas=document.createElement("canvas");
	canvas.setAttribute("id","httpCode");
	canvas.style.cssText="width:80%;margin-left:10%;"
	div.appendChild(canvas);
	//创建URL最高的
	areaChart(allData.http_code.value);



	



}

function nginxSelectServer() {
    $("#showNginxHost").show("fast");
    $("#selectNginxTbody").children().remove();//删除上次创建的HTML，避免重复
    var hostGroups = [];
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {  //大于-1标识找到了，否则就是没有找到
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var tbody = document.getElementById("selectNginxTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //循环读取主机组，并且显示对应的主机
        var tr = document.createElement("tr"); //每一行，包含的是主机组和对应的主机
        var td = document.createElement("td"); //用于显示主机组，主机组|主机A，主机B
        var groupSpan = document.createElement("span");//用于显示复选框
        groupSpan.innerHTML  =hostGroups[i];//显示值
        groupSpan.setAttribute("value", hostGroups[i]);//把值设置给属性
        //设置点击事件

        td.appendChild(groupSpan);//把第span加入td，第一个位置主机组
        tr.appendChild(td);

        td = document.createElement("td");
        //需要循环处理N个主机
        for (h in window.allServersList) {//循环读取所有主机组对应的主机
            if (group === window.allServersList[h].group) {//匹配当前主机组的主机，显示
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-unchecked"; //默认不选中
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(tbody).find(".glyphicon-check").each(function(){///选中了当前，就要取消其他的服务器
                            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");

                        });
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")//选中自己


                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML =  window.allServersList[h].alias;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value", window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                td.appendChild(hostSpan);
            }
        }
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

function createNginxLogLine(tid,sid,alias,path,_data){
                                                _data["tid"]=tid;
                                                var tbody=document.getElementById("nginxTbody") ;
                                                var tr=document.createElement("tr");

                                                var td=document.createElement("td");
                                                td.textContent=alias;
                                                tr.appendChild(td);
                                                var td=document.createElement("td");
                                                td.textContent=path;
                                                tr.appendChild(td);
                                                var td=document.createElement("td");

                                                var run=document.createElement("button");
                                                run.className="btn   btn-xs btn-success";
                                                run.setAttribute("data",JSON.stringify(_data));
                                                run.textContent="统计";
						run.onclick=function(){
							var data=this.getAttribute("data")
							data=JSON.parse(data);
							window.localLogFileName=data.path;//真假文件名替换
							getLogFileDate(data.path,data.tid,"remote");
				
						}
                                                td.appendChild(run)
						//删除按钮
						var delBtn=document.createElement("button");
						delBtn.className="btn btn-xs btn-danger";
						delBtn.style.marginLeft="3px";
						delBtn.setAttribute("tid",tid);
						delBtn.textContent="删除";
						delBtn.onclick=function(){
							deleteNginxLine(this);
						}
						td.appendChild(delBtn);
                                                tr.appendChild(td);
                                                tbody.appendChild(tr);
}

function deleteNginxLine(team){
	jQuery.ajax({
		"url":delRemoteAanalysisLogfileInfoURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"data":{"tid":team.getAttribute("tid")},
		"success":function(data){
			responseCheck(data)
			if(! data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				$(team.parentNode.parentNode).remove();
				showSuccessNotic();
			}
		}
	})
}

function loadNginxLogInfo(){
	jQuery.ajax({
		"url":getRemoteAanalysisLogfileInfoURL,
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"dataType":"jsonp",
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{	
				var content=data.content;
				for(tid in content){
					var sid=content[tid].sid;
					var path=content[tid].path;
					var _data=content[tid];
					var alias=content[tid].alias;
					createNginxLogLine(tid,sid,alias,path,_data);
				}
			}
		}
	})
}

$(function () {
	//允许拖动
	$(".modal-content").draggable()
	initLogfileDropZ()
	loadNginxLogInfo();
	document.getElementById("closeSelectDate").onclick=function(){
		stopShadow();
		$("#selectLogDateDiv").hide();
	}
	document.getElementById("statistic").onclick=function(){
		//开始统计
		stopShadow();
		$("#selectLogDateDiv").hide("fast");
		getAnalysisLogResult();
	}
	document.getElementById("noticeLocalLog").onclick=function(){
		startShadow();
		$("#showLogNotice").show("fast");
	}
	document.getElementById("closeNotice").onclick=function(){
		stopShadow();
		$("#showLogNotice").hide("fast");
		
	}
	jQuery1_8("#remoteNginxLog").toggle(
		function(){
			$("#showNginxPath").slideDown("fast");
		},function(){
			$("#showNginxPath").slideUp();
			
		}
	)
	document.getElementById("addNginxLog").onclick=function(){
		//添加服务器
		startShadow();
		$("#showNginxDiv").show("fast");
	}
	document.getElementById("closeNginxSelect").onclick=function(){
		stopShadow();
		$("#showNginxDiv").hide("fast");
	}
	document.getElementById("inputNginxRemoteServer").onclick=function(){
		document.getElementById("showNginxDiv").style.display="none";
		nginxSelectServer();
	}
	document.getElementById("closeNginxSelectServer").onclick=function(){
		document.getElementById("showNginxHost").style.display="none";
		$("#showNginxDiv").show("fast");
	}
	document.getElementById("saveNginxSelectServer").onclick=function(){
		$("#showNginxHost").hide("fast");
		$("#showNginxDiv").show("fast");
		var e=$("#selectNginxTbody").find(".glyphicon-check")[0]
		var alias=e.textContent;
		var sid=e.getAttribute("value");
		var s=document.getElementById("inputNginxRemoteServer");
		s.value=alias;
		s.setAttribute("sid",sid);
	}
	document.getElementById("saveNginxSelect").onclick=function(){
		//最后的保存
		var e=document.getElementById("inputNginxRemoteServer");		
		var sid=e.getAttribute("sid")
		var alias=e.value;
		var path=document.getElementById("remoteNginxLogPath").value;
		stopShadow();
		$("#showNginxDiv").hide("fast");
		if(! /^ *\//.test(path)){
			showErrorInfo("您必须指定一个绝对路径!");
			return false;
		}
		if( /^ *$/.test(path)   || /^ *$/.test(alias) ){
			showErrorInfo("请您填写必填项!");
			return false;
		}
		else{
			var _data={"path":path,"alias":alias,"sid":sid}
			jQuery.ajax({
				"url":addRemoteAanalysisLogfileURL,
				"beforeSend":start_load_pic,
				"complete":stop_load_pic,
				"error":errorAjax,
				"dataType":"jsonp",
				"type":"get",
				"data":_data,
				"success":function(data){
					responseCheck(data);
					if (!data.status){
						showErrorInfo(data.content);
						return false;
					}
					else{
						showSuccessNotic();
						createNginxLogLine(data.content,sid,alias,path,_data);
									
					}
				}
			})
		}




	}
		
})
