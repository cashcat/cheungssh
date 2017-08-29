/**
 * Created by 张其川 on 2016/10/26.
 */



function loadDeploymentTaskList(){



    jQuery.ajax({
        "url":getDeploymentTaskURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                window.alldDeploymentTaskList=data.content;//记录全部的部署任务清单
                var tbody=document.getElementById("showDeploymentTbody");
                for(var taskid in data.content){
                    var appName=data.content[taskid].app_name;
                    var description=data.content[taskid].description;
                    var status=data.content[taskid].status;
                    var owner=data.content[taskid].owner;
                    var time=data.content[taskid].time;
                    var model=data.content[taskid].model;
                    var crond="无";
                    var serverNumber=data.content[taskid].servers.length;
                    var tr=document.createElement("tr");
                    //应用名
                    var td=document.createElement("td");
                    td.textContent=appName;
                    tr.appendChild(td);
                    //状态
                    var td=document.createElement("td");
                    var span=document.createElement("span");
                    //span.style.cursor="pointer";
                    if(status==="新建"){
                        span.className="label label-default";
                        span.textContent=status;
                    }
                    else if(status==="成功"){
                        span.className="label label-success";
                        span.textContent=status;
                    }
                    else if(status==="失败"){
                        span.className="label label-danger";
                        span.textContent=status;
                    }
                    else if(status==="运行中"){
                        span.className="label label-info";
                        span.textContent=status;
                    }

                    td.appendChild(span);
                    tr.appendChild(td);


                    //时间，是创建时间，也是访问时间
                    var td=document.createElement("td");
                    td.textContent=time;
                    tr.appendChild(td);
                    //归属
                    var td=document.createElement("td");
                    td.textContent=owner;
                    tr.appendChild(td);
                    //主机数
                    var td=document.createElement("td");
                    td.textContent=serverNumber+"个";
                    tr.appendChild(td);
                    //模式
                    var td=document.createElement("td");
                    td.textContent=model;
                    tr.appendChild(td);
                    //定时启动
                    var td=document.createElement("td");
                    td.textContent=crond;
                    tr.appendChild(td);
                    //操作区域
                    var td=document.createElement("td");
                    td.style.minWidth="95px";

                    //编辑按钮
                    var editButton=document.createElement("button");
                    editButton.style.marginLeft="5px";
                    editButton.className="btn btn-xs btn-primary glyphicon glyphicon-edit";
                    editButton.setAttribute("tid",taskid);
                    editButton.onclick=function(){
                        window.deploymentEditTid=this.getAttribute("tid");
                        window.deploymentOPTMode="edit";//记录当前编辑模
                        $("#showMainContent").load("../html/appDeploy.html");
                    }
                    td.appendChild(editButton);
                    //启动按钮
                    var startButton=document.createElement("button");
                    startButton.className="btn btn-xs btn-success glyphicon glyphicon-tasks";
                    startButton.style.marginLeft="5px";
                    startButton.setAttribute("tid",taskid);
                    startButton.onclick=function(){
                        window.currentDeploymentTaskId=this.getAttribute("tid");
                        //$("#showMainContent").load("static/html/deployment_detail.html");
                        startShadow();
                        $("#showDeploymentNotice").show("fast");

                    }
                    td.appendChild(startButton);
                    //删除按钮
                    var deleteButton=document.createElement("button");
                    deleteButton.className="btn btn-xs btn-danger glyphicon glyphicon-trash";
                    deleteButton.style.marginLeft="5px";
                    deleteButton.setAttribute("tid",taskid);
                    deleteButton.onclick=function(){
                        deleteDeploymentTask(this);
                    };
                    td.appendChild(deleteButton);

                    tr.appendChild(td);

                    tbody.appendChild(tr);






                }
            }
        }
    });
}



function deleteDeploymentTask(deleteButton){
    //删除按钮
    var tid=deleteButton.getAttribute("tid");
    var tr=deleteButton.parentNode.parentNode;
    jQuery.ajax({
        "url":deleteDeploymentTaskURL,
        "data":{"taskid":tid},
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
                $(tr).remove();
            }
        }
    });

}


function startDeploymentTask(){
    //正式启动部署任务
    jQuery.ajax({
        "url":startDeploymentTaskURL,
        "data":{"taskid":window.currentDeploymentTaskId},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "dataType":"jsonp",
        async:false,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                stopShadow();
                $("#showMainContent").load("../html/deployment_detail.html");
            }

        }
    });

}

$(function(){
    //绑定创建应用按钮
    document.getElementById("createDeploymentApp").onclick=function(){
        window.deploymentOPTMode="create";//记录当前编辑模式
        window.deploymentEditTid=false;//清除此前编辑的任务id
        $("#showMainContent").load("../html/appDeploy.html");
    };
    loadDeploymentTaskList();//加载部署任务清单

    //绑定刷新按钮
    document.getElementById("refreshDeploymentApp").onclick=function(){
       loadAppDeployHTML();

    }
    //关闭按钮
    document.getElementById("closeButton").onclick=function(){
        $("#showDeploymentNotice").hide("fast");
        stopShadow();
    }
    //启动部署任务的按钮
    document.getElementById("startDeploymentTask").onclick=function(){
        startDeploymentTask();//启动任务

    }
    //绑定部署进度查看
    document.getElementById("showDeploymentDetail").onclick=function(){
        stopShadow();
        $("#showMainContent").load("../html/deployment_detail.html");//直接加载详情界面，但是不请求执行任务

    }






});

