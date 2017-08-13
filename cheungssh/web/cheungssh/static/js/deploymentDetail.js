/**
 * Created by 张其川CheungSSH on 2016/11/12.
 */



function loadDeploymentDetail() {
    //加载部署详情信息
    //页面全局，用来显示全部服务器的
    var main = document.getElementById("main");
    //任务id对应的配置信息
    var conf = window.alldDeploymentTaskList[window.currentDeploymentTaskId];
    //应用名
    var appName = conf.app_name;
    var description = conf.description;
    var descriptionHTML = '<h3 style="font-family: 华文仿宋">(' + description + ')</h3>';
    document.getElementById("appName").innerHTML = appName + "&nbsp;的部署进度" + descriptionHTML;//显示应用名
    //复制每一个服务器区域
    var everyOneServer = document.getElementsByClassName("everyOneServer")[0];
    //复制每一个步骤的HTML

    //全部服务器
    var servers = conf.servers;
    for (var i = 0; i < servers.length; i++) {
        var alias = servers[i].alias;
        var steps = servers[i].steps;
        //创建每一个服务器区域
        var newEveryOneServer = everyOneServer.cloneNode(true);
        newEveryOneServer.style.display = "block";
        $(newEveryOneServer).find(".alias")[0].textContent = alias;
        //创建每一个步骤
        for (var h = 0; h < steps.length; h++) {
            var stepid = steps[h].stepid;
            var stepTemp = document.getElementsByClassName("step")[0].cloneNode(true);
            //复制并且修改显示状态
            stepTemp.style.display = "block";

            $(stepTemp).find("div")[0].textContent = "第" + (h + 1) + "步";//步骤编号
            $(stepTemp).find("div")[1].textContent = steps[h].step_name;//步骤名称
            $(stepTemp)[0].setAttribute("id", stepid);
            //$($(stepTemp).find("div")[3]).className="icon-refresh icon-spin";//步骤名称
            newEveryOneServer.appendChild(stepTemp);
        }
        main.appendChild(newEveryOneServer);

    }


}


function loadStepDetail(time,summary,status,content){
    //时间，概述，状态，内容
    startShadow();
    document.getElementById("stepTime").textContent=time;
    document.getElementById("stepSummary").textContent=summary;
    var statusDiv=document.getElementById("stepStatus")
    if(status=="true"){//判断状态，增加提示标签
        statusDiv.textContent="正常";
        statusDiv.className="label label-success";
    }
    else if(status=="cancel"){
        statusDiv.textContent="取消";
        statusDiv.className="label label-warning";
    }
    else{
        statusDiv.textContent="失败";
        statusDiv.className="label label-danger";
    }
    document.getElementById("stepContent").innerHTML=content;
    $("#showStepDetail").show("fast");//显示框
}
function getDeploymentDetail() {
    jQuery.ajax({
        "url": getDeploymentProgressURL,
        "data": {"taskid": window.currentDeploymentTaskId},
        "dataType": "jsonp",
        "error": errorAjax,
        "success": function (data) {
            //判断该部署任务状态是否正常，比如是否启动，后端返回的状态信息
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            var stepNum=parseInt(data.step_num);//获取当前运行的步骤编号
            //展示进度信息
            for (stepid in data) {
                var info = data[stepid];
                if (typeof info == typeof {}) {
                    //进度信息
                    var stepTime=info.time;
                    var stepSummary=info.summary;
                    var stepStatus=info.status;
                    var stepContent=info.content;
                    var stepProgress=info.progress;

                    var statusBar=$("#"+stepid).find("span")[0];//显示成功失败的提示标签
                    statusBar.setAttribute("stepTime",stepTime);
                    statusBar.setAttribute("stepSummary",stepSummary);
                    statusBar.setAttribute("stepStatus",stepStatus);
                    statusBar.setAttribute("stepContent",stepContent);
                    statusBar.setAttribute("stepProgress",stepProgress);
                    statusBar.onclick=function(){
                        //点击状态，显示详情
                        var stepTime=this.getAttribute("stepTime",stepTime);
                        var stepSummary=this.getAttribute("stepSummary",stepSummary);
                        var stepStatus=this.getAttribute("stepStatus",stepStatus);
                        var stepContent=this.getAttribute("stepContent",stepContent);
                        var stepProgress=this.getAttribute("stepProgress",stepProgress);
                        loadStepDetail(stepTime,stepSummary,stepStatus,stepContent);


                    };
                    if( ! info.status){
                        //如果失败，
                        $(statusBar).removeClass("label-default").addClass("label-danger").css({"cursor":"pointer"});
                        statusBar.textContent="失败";
                        //凡是在标签纸是： 等待中   的标签，都修改为取消
                        $(".label-default").removeClass("label-default").addClass("label-warning").text("取消").css({"cursor":"pointer"}).click(function(){
                            loadStepDetail("无时间","已经取消","cancel","因上游流程失败，已取消执行.");
                        });

                        //停止全部加载图片的动态
                		$(".fa").removeClass("fa-spin");

                    }

                    else{
                        //否则成功
                        var progress=parseInt(info.progress)
                        var progressBar=$("#"+stepid).find(".progress-bar")[0];
                        progressBar.style.width=progress+"%";
                        progressBar.textContent=progress+"%";
			if (  data.status==="running" && progress<100 ){//如果任务在运行中，并且进度没有完成才有动态加载图片
                		$("#"+stepid).find(".fa").addClass("fa-spin");
			}
			if(  progress==100      )     {
                		$("#"+stepid).find(".fa").removeClass("fa-spin");//如果进度小于100，并且任务在运行中，则加载图片
                        	$(statusBar).removeClass("label-default").removeClass("label-warning").addClass("label-success").css({"cursor":"pointer"});
                        	statusBar.textContent="成功";
			}
                    }

			if (progress==100 && data.status=="running"){
				//加载图片往下移动
                		//往下找一个兄弟节点的stepid
                		var P= $("#"+stepid).next().find(".progress-bar")[0]   
				if (P){
                			if(     $("#"+stepid).next().find(".progress-bar")[0].textContent!=="100%"          ){
					//避免早就成功过的进度，让下一个也成功过的图片加载，所以判断这个即将被动态显示图标的html值是不是100，如果是100，就不要加载图片了
						$("#"+stepid).next().find(".fa").addClass("fa-spin");
					}
				}
				else{
					//下一个服务器了的进度
                			if(     $("#"+stepid).parent().next().children().eq(3).find(".progress-bar")[0].textContent!=="100%"          ){
						$("#"+stepid).parent().next().children().eq(3).find(".fa").addClass("fa-spin");
					}
				}
			}
                }

            }
            if (data.status === "running") {
                //处理动态加载图片
                //继续加载
                setTimeout(getDeploymentDetail, 1000);//暂定一秒钟读取
            }
            else {
                //结束循环加载，然后判断数据
                for(stepid in data){
                    //判断全部步骤是否都是成功，如果成功，则显示成功，如果有一个失败，则删除加载图标
                    if(!data[stepid].status){
                        $(".fa-spin").removeClass("fa-spin")//删除全部加载中
                        return false;//主要是为了不显示提示成功的信息
                    }
                }
                showSuccessNotic();//全部成功

            }

        }
    });


}


$(function () {
    // console.log(window.currentDeploymentTaskId);
    //console.log( window.alldDeploymentTaskList);
    loadDeploymentDetail();//加载部署详情
    //绑定返回按钮
    document.getElementById("back").onclick = function () {
        loadAppDeployHTML();
    }
    //后台间隔1秒钟加载

    getDeploymentDetail();
    //绑定关闭步骤详情按钮
    document.getElementById("closeStepDetail").onclick=function(){
        $("#showStepDetail").hide("fast");
        stopShadow();
    }

})
