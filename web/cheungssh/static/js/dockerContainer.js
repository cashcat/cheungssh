/**
 * Created by 张其川 on 2016/8/4.
 */




function showDockerContainerTable(content){
    var tbody=document.getElementById("dockerContainerTbody");
    for(i in content){

        var tr=document.createElement("tr");
        tr.setAttribute("containerID",content[i].container_id);
        tr.setAttribute("sid",content[i].sid);
        //显示复选框
        //var checkbox='<th style="color: black;cursor:pointer "> <i class=" "></i> </th>';
        var checkbox=document.createElement("i");
        checkbox.setAttribute("containerID",content[i].container_id);
        checkbox.setAttribute("sid",content[i].sid);
        checkbox.className="glyphicon glyphicon-unchecked ";

        var td=document.createElement("td");
        td.style.cssText="color:back;cursor:pointer";
        td.onclick=function(){
            var checkbox=$(this).children()
             if( $(checkbox).hasClass("glyphicon-check") ){
                 //此前是被选中的，现在要取消选中
                 $(checkbox).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
             }

             else{
                 $(checkbox).removeClass("glyphicon-unchecked").addClass("glyphicon-check")


             }
        }
        td.appendChild(checkbox);
        tr.appendChild(td);


        //显示每一行
        //显示每一个字段,服务器别名字段
        var td=document.createElement("td");
        td.textContent=content[i].alias;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,镜像
        var td=document.createElement("td");
        td.textContent=content[i].image;
        //把td加入行
        tr.appendChild(td);



        //显示每一个字段,ID
        var td=document.createElement("td");
        td.textContent=content[i].container_id;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,命令
        var td=document.createElement("td");
        td.textContent=content[i].command;
        //把td加入行
        tr.appendChild(td);


        //显示每一个字段,创建时间
        var td=document.createElement("td");
        td.textContent=content[i].create_time;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,发现时间
        var td=document.createElement("td");
        td.textContent=content[i].date;
        tr.appendChild(td);


        //显示每一个字段,状态
        var td=document.createElement("td");
        status=content[i].status;
        var span=document.createElement("span");
        if (status==="true"){
            span.className=" label label-success"
            span.textContent="运行中"
        }
        else if( status==="false"){
            span.className="label label-danger"
            span.textContent="停止"
        }
        else{
            span.className="labe label-yellow"
            span.textContent="未知";
        }
        td.appendChild(span);
        //把td加入行
        tr.appendChild(td);


        //显示每一个字段,状态时间
        var td=document.createElement("td");
        td.textContent=content[i].status_time;
        td.className="status-time";
        //把td加入行
        tr.appendChild(td);




        //删除单个镜像按钮
        var td=document.createElement("td");
        var button=document.createElement("button");
        button.setAttribute("type","button");
        button.className="btn btn-danger  btn-sm";
        button.onclick=function(){
            deleteDockerContainer(this);

        }
        var span=document.createElement("span");
        span.className="glyphicon glyphicon-trash";
        button.appendChild(span);
        td.appendChild(button);
        tr.appendChild(td);

        //启动按钮
        var td=document.createElement("td");
        var button=document.createElement("button");
        button.setAttribute("type","button");
        button.className="btn btn-success btn-sm";
        button.onclick=function(){
            var td=$(this).parent();
            var tr=$(td).parent()[0];
            var cid=tr.getAttribute("containerid");
            var sid=tr.getAttribute("sid");
            var taskType="start";
            var parameters={
                "task_type":taskType,
                "servers":{},
            };  //当前行的容器ID和sid
            parameters["servers"][sid]=[cid];
            parameters=JSON.stringify(parameters);



            var td=$(this).parent();
            var tr=$(td).parent();
            var label=$(tr).find(".label");
            var statusTime=$(tr).find(".status-time");
            $(label).text("启动中");
            $(label).removeClass("label-success").removeClass("label-danger").addClass("label-warning");
            document.getElementById("shadow").style.display="block";
            document.getElementById("loadPic").style.display="block";
            jQuery.ajax({
                "url":dockerContainerRunURL,
                "data":{"parameters":parameters},
                "error":errorAjax,
                "dataType":"jsonp",
                "success":function(data){
                    responseCheck(data);
                    if(data.status){
                        var tid=data.content;
                        getSingleContainerProgress(tid,label,statusTime,taskType,tr);
                    }
                }
            });
        }
        var span=document.createElement("span");
        span.className="glyphicon  glyphicon-play-circle";
        button.appendChild(span);
        td.appendChild(button);
        tr.appendChild(td);

        //停止按钮
        var td=document.createElement("td");
        var button=document.createElement("button");
        button.setAttribute("type","button");
        button.className="btn btn-danger btn-sm";
        button.onclick=function(){
            var td=$(this).parent();
            var tr=$(td).parent()[0];
            var cid=tr.getAttribute("containerid");
            var sid=tr.getAttribute("sid");
            var taskType="stop"
            var parameters={
                "task_type":taskType,
                "servers":{},
            };  //当前行的容器ID和sid
            parameters["servers"][sid]=[cid];
            parameters=JSON.stringify(parameters);
            var td=$(this).parent();
            var tr=$(td).parent();
            var label=$(tr).find(".label");
            var statusTime=$(tr).find(".status-time");
            $(label).text("关闭中");
            $(label).removeClass("label-success").removeClass("label-danger").addClass("label-warning");
            document.getElementById("shadow").style.display="block";
            document.getElementById("loadPic").style.display="block";
            jQuery.ajax({
                "url":dockerContainerRunURL,
                "data":{"parameters":parameters},
                "error":errorAjax,
                "dataType":"jsonp",
                "success":function(data){
                    responseCheck(data);
                    if(data.status){
                        var tid=data.content;
                        getSingleContainerProgress(tid,label,statusTime,taskType,tr);
                    }
                }
            });


        }


        var span=document.createElement("span");
        span.className="glyphicon glyphicon-off";
        button.appendChild(span);
        td.appendChild(button);
        tr.appendChild(td);



        //把tr加入tbody
        tbody.appendChild(tr);
    }

}
//删除容器

function deleteDockerContainer(team){
    var td=$(team).parent();
    var tr=$(td).parent()[0];
    var cid=tr.getAttribute("containerid");
    var sid=tr.getAttribute("sid");
    var taskType="delete"
    var parameters={
        "task_type":taskType,
        "servers":{},
    };  //当前行的容器ID和sid
    parameters["servers"][sid]=[cid];
    parameters=JSON.stringify(parameters);
    var td=$(team).parent();
    var tr=$(td).parent();
    var label=$(tr).find(".label");
    var statusTime=$(tr).find(".status-time");
    $(label).text("删除中");
    $(label).removeClass("label-success").removeClass("label-danger").addClass("label-warning");
    console.log(parameters);
    document.getElementById("shadow").style.display="block";
    document.getElementById("loadPic").style.display="block";

    jQuery.ajax({
        "url":dockerContainerRunURL,
        "data":{"parameters":parameters},
        "error":errorAjax,
        "dataType":"jsonp",
        "success":function(data){
            responseCheck(data);
            if(data.status){
                var tid=data.content;
                getSingleContainerProgress(tid,label,statusTime,taskType,tr);
            }
        }
    });
}




function getSingleContainerProgress(tid,label,statusTime,taskType,tr){
    //taskType是start/stop
    //label用来显示状态，statusTime用来显示刚刚
    //用来获取单个启动容器的进度
    jQuery.ajax({
        "url":dockerContainerProgressURL,
        "data":{"tid":tid},
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            if (data.status){
                console.log(data);
                var progress=data.progress;
                if(progress<100){
                    setTimeout(function(){
                        getSingleContainerProgress(tid,label,statusTime,taskType,tr);
                    },1000)
                }
                else{
                    //完成
                    showSuccessNotic();
                    var content=data.content;
                    var status=content[0].status;
                    $(statusTime).text("刚才");
                    //处理界面显示的类型，运行中/停止
                    if (taskType==="start"){
                        if (status==true){
                            $(label).removeClass("label-warning").addClass("label-success");
                            $(label).text("运行中")
                        }
                        else{
                            $(label).removeClass("label-warning").addClass("label-danger");
                            $(label).text("停止")
                        }
                    }
                    else if(taskType==="delete"){
                        tr.remove();//删除行
                    }
                    else{
                        if (status==true){
                            $(label).removeClass("label-warning").addClass("label-danger");
                            $(label).text("已停止")
                        }
                        else{
                            $(label).removeClass("label-warning").addClass("label-success");
                            $(label).text("运行中")
                        }
                    }
                    document.getElementById("shadow").style.display="none";
                    document.getElementById("loadPic").style.display="none";


                }


            }
        }
    });


}



function loadDockerContainerList(){
    jQuery.ajax({
        "url":dockerContainerListURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(data.status){
                content=data.content;
                showDockerContainerTable(content);
            }

        }

    });
}


function  createProgressDIV(cid){
    var progress=document.createElement("div");
    progress.style.cursor="pointer";
    progress.style.width="80%";
    progress.className="progress";
    var bar=document.createElement("div");
    bar.className="progress-bar progress-bar-info progress-bar-striped";
    bar.style.float="left"
    bar.setAttribute("id","runContainer");
    bar.style.width="100%";

    bar.setAttribute("id",cid);

    bar.setAttribute("data-toggle","popover");
    bar.setAttribute("data-placement","top");
    bar.setAttribute("data-content","等待启动");
    bar.setAttribute("data-containe","body");
    $(bar).popover();


    var span=document.createElement("span")
    span.textContent=cid;
    bar.appendChild(span);
    progress.appendChild(bar);
    return progress;

}

function showStartContainerDIV(container){
    document.getElementById("shadow").style.display="block";
    $("#showStartContainerPannel").show("fast");//显示启动容器面板
    var container=container;//获取选中的容器ID  ,container是一个返回的额函数
    var  showContainerInfo=document.getElementById("showContainerInfo")
    showContainerInfo.innerHTML="";//删除此前的记录

    //创建进度条
    var progress=document.createElement("div");
    progress.style.width="100%";
    progress.className="progress";
    var bar=document.createElement("div");
    bar.className="progress-bar progress-bar-success progress-bar-striped active";
    bar.setAttribute("id","runContainerProgress");
    bar.style.width="0%";
    var span=document.createElement("span")
    span.textContent="0%";
    span.setAttribute("id","runContainerProgressText");
    bar.appendChild(span);
    progress.appendChild(bar);
    showContainerInfo.appendChild(progress);

    for(var i=0;i<container.length;i++){
        var div=document.createElement("div");
        div.appendChild(createProgressDIV(container[i]));
        showContainerInfo.appendChild(div);
    }
}


//批量选中容器复选框
function  batchSelectContainer(){
    jQuery1_8("#batchSelectContainerButton").toggle(
        function(){
            $($(this)).children().removeClass("glyphicon-unchecked").addClass("glyphicon-check")//标记自己的选中状态
            //处理表格中的复选框
            var dockerContainerTbody=$("#dockerContainerTbody");
            dockerContainerTbody.find("i").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
        },function(){
            $($(this)).children().removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            var dockerContainerTbody=$("#dockerContainerTbody");
            dockerContainerTbody.find("i").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
        }
    )

}
//找到被选中的复选框行
function getContainer(){
    var container=[]
    var dockerContainerTbody=$("#dockerContainerTbody");
    $(dockerContainerTbody).find(".glyphicon-check").each(
        function(){
            container.push(this.getAttribute("containerID"));
        }
    );
    return container;
}

function getContainerProgress(tid){
    jQuery.ajax({
        "url":dockerContainerProgressURL,
        "error":errorAjax,
        "dataType":"jsonp",
        "data":{"tid":tid},
        "success":function(data){
            responseCheck(data);
            if (data.status){
                var content=data.content;
                var progress=data.progress;
                for(var i=0;i<content.length;i++){
                    var _content=content[i];
                    var cid=_content.cid;
                    var info=_content.content;
                    var status=_content.status;
                    var div=document.getElementById(cid);
                    var t=document.getElementById(cid);
                    t.setAttribute("data-content",info)
                        if (status==true){
                            $("#" +cid).removeClass("progress-bar-info").addClass("progress-bar-success");
                        }
                        else{
                            $("#" +cid).removeClass("progress-bar-info").addClass("progress-bar-danger");
                        }
                }
                document.getElementById("runContainerProgress").style.width=progress+"%";
                document.getElementById("runContainerProgressText").textContent=progress+"%";
                if(progress<100){
                    setTimeout(function(){
                        getContainerProgress(tid);
                    },1000)
                }
                else{
                    document.getElementById("startContainerButton").textContent="已经完成"
                }


            }

        }
    });


}


//搜索容器
function searchContainers() {
    var table = $("#containerTable").find("tbody tr");
    table.each(
        function () {
            var searchValue = document.getElementById("searchContainers").value.toLowerCase();
            // if(!searchValue)return false;
            var e = jQuery(this);
            var eValue = e.text().toLowerCase();
            if (!eValue.match(searchValue)) {
                e.hide();
            }
            else {
                e.show()
            }
        }
    );

};


function getBatchDeleteContainerProgress(tid){
    jQuery.ajax({
        "url":dockerContainerProgressURL,
        "data":{"tid":tid},
        "error":errorAjax,
        "dataType":"jsonp",
        "success":function(data){
            responseCheck(data);
            if(data.status){
                var progress=data.progress;
                console.log(data);
                if(progress<100){
                    getBatchDeleteContainerProgress(tid);
                }
                else{
                    document.getElementById("shadow").style.display="none";
                    document.getElementById("loadPic").style.display="none";
                    showSuccessNotic();

                }
            }
        }
    });

}


//批量删除容器
function batchDeleteContainer(team){
    var containers=getContainer();
    var parameters={
        "task_type":"delete",
        "servers":containers,
    };
    parameters=JSON.stringify(parameters);
    jQuery.ajax({
        "url":dockerContainerRunURL,
        "data":{"parameters":parameters},
        "dataType":"jsonp",
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            if(data.status){
                document.getElementById("shadow").style.display="block";
                document.getElementById("loadPic").style.display="block";
                var tid=data.content;
                getBatchDeleteContainerProgress(tid);



            }
        }
    });




}

//初始化加载

$(function(){
    loadDockerContainerList();
    document.getElementById("refreshDockerContainer").onclick=function(){
        loadDockerContainerHTML();
    }
    //绑定批量启动docker容器按钮
    $(document).on("click","#batchStartContainer",function(){
        var container=getContainer()
        showStartContainerDIV(container);
    });
    //绑定关闭容器面板按钮
    $(document).on("click","#closeStartContainerButton",function(){
        $("#showStartContainerPannel").hide("fast");//关闭启动容器面板
        document.getElementById("shadow").style.display="none";
        var t =document.getElementById("startContainerButton") //删除禁用
        t.removeAttribute("disabled");
        t.textContent="启动";
        //loadDockerContainerHTML();


    })
    //批量选中容器复选框,绑定事件
    batchSelectContainer();
    //获取选中的容器ID,最后启动容器按钮
    document.getElementById("startContainerButton").onclick=function(){
        this.setAttribute("disabled",true);
        this.textContent="启动中..."
        $("#runContainer").addClass("active");
        var container=getContainer();//[]
        var parameters={"task_type":"start","servers":{}};
        //servers:{"sid1":[],"sid2":[container1,container2]{

        var dockerContainerTbody=$("#dockerContainerTbody");
        $(dockerContainerTbody).find(".glyphicon-check").each(
            function(){
                //组合成数据格式
                var cid=this.getAttribute("containerID");
                var sid=this.getAttribute("sid");
                if (parameters.servers[sid]){
                    //判断是否存在sid，如果有直接追加
                    parameters.servers[sid].push(cid);
                }
                else{
                    //如果没有，则先创建，然后追加
                    parameters.servers[sid]=[];
                    parameters.servers[sid].push(cid);
                }
            }
        );
        if (Object.keys(parameters.servers).length==0){
            //$("#showStartContainerPannel").hide("fast");//关闭启动容器面板
            document.getElementById("showStartContainerPannel").style.display="none";
            showErrorInfo("必须选择一个以上的容器 !")
        }
        else{
            parameters=JSON.stringify(parameters);
            jQuery.ajax({
                "url":dockerContainerRunURL,
                "data":{"parameters":parameters},
                "error":errorAjax,
                "dataType":"jsonp",
                "success":function(data){
                    responseCheck(data)
                    if(data.status){
                        var tid=data.content;
                        document.getElementById("shadow").style.display="block";
                        getContainerProgress(tid);
                    }
                }
            });
        }
    }

    //绑定搜索容器输入框
    $(document).on("keyup","#searchContainers",function(){
        searchContainers();
    })

    //绑定批量删除容器
    document.getElementById("batchDeleteContainer").onclick=function(){
        batchDeleteContainer(this);
    }


})

