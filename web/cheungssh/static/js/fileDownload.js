/**
 * Created by 张其川 on 2016/10/5.
 */



//上传文件选择服务器

function fileDownloadSelectServer(){
    document.getElementById("shadow").style.display="block";
    $("#showFileDownloadServerDIV").slideDown("fast");
    var hostGroups=[];
    window.currentSelectedServers=[];//存储呗选中的主机
    for(i in window.allServersList){
        var group=window.allServersList[i].group;
        if(hostGroups.indexOf(group)>-1){  //大于-1标识找到了，否则就是没有找到
            continue;
        }
        else{
            hostGroups.push(group);
        }
    }
    var  selectServerTbody= document.getElementById("downloadFileSelectServerTbody");
    for(var i=0;i<hostGroups.length;i++){
        group=hostGroups[i];
        //循环读取主机组，并且显示对应的主机
        var tr=document.createElement("tr"); //每一行，包含的是主机组和对应的主机
        var td=document.createElement("td"); //用于显示主机组，主机组|主机A，主机B
        var groupSpan=document.createElement("span");//用于显示复选框
        groupSpan.className="glyphicon glyphicon-check"//默认选中，这个是主机组
        groupSpan.style.cursor="pointer";
        groupSpan.innerHTML="&nbsp"+hostGroups[i];//显示值
        groupSpan.setAttribute("value",hostGroups[i]);//把值设置给属性
        //设置点击事件
        groupSpan.onclick=function(){
            if($(this).hasClass("glyphicon-check")){
                var td=$(this).parent();//td级别
                var tr=$(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")  //选中tr中所有span
            }
            else{
                var td=$(this).parent();//td级别
                var tr=$(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")

            }
        };
        td.appendChild(groupSpan);//把第span加入td，第一个位置主机组
        tr.appendChild(td);

        td=document.createElement("td");
        //需要循环处理N个主机
        for (h in window.allServersList){//循环读取所有主机组对应的主机
            if(group===window.allServersList[h].group){//匹配当前主机组的主机，显示
                hostSpan=document.createElement("span");
                hostSpan.className="glyphicon glyphicon-check hostClass"; //增加hostClass便于读取主机
                hostSpan.onclick=function(){
                    if($(this).hasClass("glyphicon-check")){
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else{
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")

                    }
                };
                hostSpan.style.cssText="margin:10px;cursor:pointer;";
                hostSpan.innerHTML="&nbsp;"+window.allServersList[h].alias;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value",window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                td.appendChild(hostSpan);
                window.currentSelectedServers.push(window.allServersList[h]["id"]);
            }
        }
        tr.appendChild(td);
        selectServerTbody.appendChild(tr);
    }
}



function createRemoteDownloadServerDiv(){
    //显示处理服务器对应的目录和进度
    //获取输入的远程路径
    var remoteDownloadPath=document.getElementById("remoteDownloadPath").value;
    var showRemoteDownloadServerDIV=document.getElementById("showRemoteDownloadServerDIV");
    window.uploadFileData=[];//存放全部的上传数据[{"sid":sid,"dfile":dfile,"element":progressElement},...]
    for(var i=0;i<window.currentfileDownloadSelectedServers.length;i++){
        //把sid转换为alias
        var sid=window.currentfileDownloadSelectedServers[i];
        for(var si=0;si<window.allServersList.length;si++){
            if(window.allServersList[si].id==sid){
                var alias=window.allServersList[si].alias;
                break;
            }
        }

        var lineDiv=document.createElement("div");
        lineDiv.className="col-sm-12";//每一行,jquery读取通过这个类
        lineDiv.setAttribute("sid",sid);
        lineDiv.style.marginTop="10px";

        //第一个字段,远程服务器路径
        var div2=document.createElement("div");
        div2.style.left="10px";
        div2.className="col-sm-6 input-group";//一行中的第一组
        div2.style.float="left";
        //输入框
        var span=document.createElement("span");
        span.className="input-group-addon";
        span.style.width="90px";
        span.innerHTML="&nbsp;"+alias;
        var input=document.createElement("input");
        input.className="form-control ng-pristine ng-valid ng-touched remoteFilePath";
        input.style.display="inline";
        input.setAttribute("placeholder","请输入远程服务器路径");
        input.setAttribute("sid",sid);//把sid放进去
        input.value=remoteDownloadPath;
        div2.appendChild(span);
        div2.appendChild(input);

        lineDiv.appendChild(div2)//加入一行


        //第三个字段，显示上传进度
        var div3=document.createElement("div");
        div3.style.left="10px;"
        div3.style.float="left";
        div3.className="col-sm-6";//一行中的第一组
        div3.style.height="35px";
        var divProgress=document.createElement("div");
        divProgress.className="progress-bar progress-bar-success progress-bar-striped active";
        //divProgress.style.width="80%";
        divProgress.style.borderRadius="4px";
        var span=document.createElement("span");
        //span.innerText="10%";
        divProgress.appendChild(span);
        div3.appendChild(divProgress);
        lineDiv.appendChild(div3)//加入一行
        showRemoteDownloadServerDIV.appendChild(lineDiv);

    }
    if(window.uploadFileModel==="fast"){
        startLocalToRemoteUpload();//快速模式，直接上传，否则需要触发上传事件
    }

}


//路径搜索
$(function() {
    var cache = {};  //缓存功能
    $( "#remoteDownloadPath" ).autocomplete({
        minLength: 1, //最少多少开始搜索
        source: function( request, response ) {
            var path = request.term;  //自身携带的是term key
            var requestData={"path":path};
            if ( path in cache ) {
                response( cache[ path ] );
                return;
            }

            $.getJSON( headURL+pathSearchURL, requestData, function( data, status, xhr ) { //requestData是组成的数据
                var content=data.content;
                cache[ path ] = content;
                response( content );
            });
        }
    });
});


//初始化绑定

$(function(){
    //绑定选择服务器
    document.getElementById("fileDownloadSelectServerButton").onclick=function(){
        fileDownloadSelectServer();
    }
    //取消选择服务器
    document.getElementById("cancelfileDownloadSelect").onclick=function(){
        $("#downloadFileSelectServerTbody").children().remove(); //删除当前服务器，避免下次重复加载
        $("#showFileDownloadServerDIV").slideUp("fast");
        document.getElementById("shadow").style.display="none";
    }
    //给选择全部服务器绑定点击事件
    jQuery1_8("#fileDownloadSelectAllServers").toggle(
        function(){
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        },function(){
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );
    //获取选择服务器的下一步
    document.getElementById("fileDownloadSelectNext").onclick=function(){
        //删除界面布局的服务器
        $("#showRemoteDownloadServerDIV").children().remove();
        //获取选中的主机
        window.currentfileDownloadSelectedServers=[];//重置下载选中的主机
        $("#downloadFileSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function(){
            //获取hostClass是为了读取主机，因为表里面有主机组的标签，用这个区分
            window.currentfileDownloadSelectedServers.push(this.getAttribute("value"));
        })
        if(window.currentfileDownloadSelectedServers.length==0){
            showErrorInfo("请选择服务器！");
            return false;
        }
        //fileDownloadSelectNext();
        $("#downloadFileSelectServerTbody").children().remove(); //删除当前服务器，避免下次重复加载
        //删除界面布局的上传界面，避免重复
        $("#showLocalServerAndRemoteServerDIV").children().remove();
        document.getElementById("showFileDownloadServerDIV").style.display="none";//关闭服务器框
        //显示远程路径输入框
        $("#remoteDownloadPathDIV").slideDown("fast");
        document.getElementById("remoteDownloadPath").focus();
    }
    //输入远程路径的高级按钮
    document.getElementById("remoteDownloadPathAdvance").onclick=function(){
        $("#remoteDownloadPathDIV").slideUp("fast");
        createRemoteDownloadServerDiv();
        stopShadow();
        document.getElementById("startFileDownloadButton").removeAttribute("disabled");
    }
    //输入远程路径的快速按钮
    document.getElementById("remoteDownloadPathFastNext").onclick=function(){
        var remoteDownloadPath=document.getElementById("remoteDownloadPath").value;
        if(/^ *$/.test(remoteDownloadPath)){
            showErrorInfo("请输入远程服务器路径！");
            return false;
        }
        $("#remoteDownloadPathDIV").slideUp("fast");
        createRemoteDownloadServerDiv();
        document.getElementById("shadow").style.display="none";
        startRemoteDownloadToLocal();

    }
    //绑定取消下载文件到PC
    document.getElementById("closeDownloadFileButton").onclick=function(){
        document.getElementById("shadow").style.display="none";
        $("#showDownloadNotice").slideUp("fast");
    }
    //绑定手动下载
    document.getElementById("startFileDownloadButton").onclick=function(){
        startRemoteDownloadToLocal();
    }
    //绑定确认下载部分文件的按钮
    document.getElementById("continueDownloadFileButton").onclick=function(){
        $("#showDownloadNotice").slideUp("fast");
        createTgzPack();//获取打包下载的路径
    }

})



//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getFileTransDownloadProgress(tid,progressBar,progressSpan,filename){
    return function(){
        //访问真正的目标函数
        getFileTransDownloadProgress(tid,progressBar,progressSpan,filename);
    }
}


//获取文件传输进度
function getFileTransDownloadProgress(tid,progressBar,progressSpan,filename){
    jQuery.ajax({
        "url":getFileTransProgressURL,
        "error":errorAjax,
        "data":{"tid":tid},
        "dataType":"jsonp",
        "success":function(data){
            if(!data.status){
                $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                progressBar.textContent=data.content;
                progressBar.className="label label-danger";
                window.currentDownloadFailedServerTotal+=1;
                return false;
            }
            else{
                var progress=parseInt(data.progress);
                progressBar.style.width=progress+"%";
                progressSpan.innerText=progress+"%";
                if(progress<100){
                    //小于100的时候，继续获取进度
                    setTimeout(_getFileTransDownloadProgress(tid,progressBar,progressSpan,filename),1000);
                    //用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的

                }
                else if(progress==100){
                    //上传成功，把进度条改成成功提示
                    setTimeout(function(){
                        //暂停一秒钟再显示成功
                        $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                        progressBar.textContent="成功";
                        progressBar.className="label label-success";
                        window.currentDownloadSuccessServerFileList.push(filename);//把成功下载的文件记录下来
                    },1000);
                }
            }
        }
    });

}


//远程下载
function startRemoteDownloadToLocal(){
    //禁用上传按钮
    document.getElementById('startFileDownloadButton').setAttribute("disabled",true);
    window.currentDownloadServerTotal=0;//当前下载服务器的数量，成功的数量和数百的数量和加起来等于这个
    window.currentDownloadFailedServerTotal=0;
    window.currentDownloadSuccessServerFileList=[];
    $("#showRemoteDownloadServerDIV").find("input").each(function(){
        window.currentDownloadServerTotal+=1;//累加一个
        //获取这个DIV下面的input元素， input中有sid属性，直接就能拿到全部要的属性
        var input=this;
        var sid=input.getAttribute("sid");
        var remotePath=input.value;
        data={"sid":sid,"sfile":remotePath};
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":remoteDownloadFileURL,
            "dataType":"jsonp",
            "data":{"parameters":data},
            "error":errorAjax,
            "success":function(data){
                var parentDiv=$(input).parent();
                var pDiv=$(parentDiv).siblings("div")[0];//progress-bar的父元素
                var progressSpan=$(pDiv).find("span")[0];
                var progressBar=$(pDiv).find(".progress-bar")[0];
                if(!data.status){
                    //后台失败了
                    $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                    progressBar.textContent=data.content;
                    progressBar.className="label label-danger";
                    window.currentDownloadFailedServerTotal+=1;
                    return false;
                }
                else{
                    //后台启动文件下载成功，可以等待获取进度
                    var tid=data.tid;
                    var filename=data.filename;
                    getFileTransDownloadProgress(tid,progressBar,progressSpan,filename);
                }


            }
        });

    })
    //监听全部下载是否完毕，如果完毕，则请求服务器下载
    listenDownloadStatus()

}
function showDownloadNotice(content,isDownload){
    document.getElementById("shadow").style.display="block";//显示引用
    document.getElementById("showDownloadContent").innerText=content;//写入警告内容
    $("#showDownloadNotice").slideDown("fast");//显示DIV
    if(isDownload){
        document.getElementById("continueDownloadFileButton").style.display="block";//显示下载按钮
    }
    else{
        document.getElementById("continueDownloadFileButton").style.display="none";//全部下载失败了，不给下载按钮

    }




}
function  listenDownloadStatus(){
    //监听全部下载是否完毕，如果完毕，则请求服务器下载
    setTimeout(function(){
        isDownload=false;//是否显示手工下载按钮
        if(window.currentDownloadSuccessServerFileList.length+window.currentDownloadFailedServerTotal===window.currentDownloadServerTotal){
            //全部下载完毕了
            if(window.currentDownloadFailedServerTotal>0 && window.currentDownloadFailedServerTotal<window.currentDownloadServerTotal){
                //说明有部分下载失败了
                isDownload=true;
                showDownloadNotice("部分服务器下载失败的,您可以继续打包下载成功的部分.",isDownload);
            }
            else if(window.currentDownloadFailedServerTotal==window.currentDownloadServerTotal){
                //说明全部下载失败了
                isDownload=false;
                showDownloadNotice("全部下载失败了！",isDownload);

            }
            else{
                createTgzPack();
                //全部下载成功，直接访问下载
            }
        }
        else{
            //没有下载完毕，继续监听
            listenDownloadStatus();
        }
    },500)
}
//请求打包下载
function createTgzPack(){
    var data=JSON.stringify(window.currentDownloadSuccessServerFileList);//前面下载成功的文件清单
    jQuery.ajax({
        "url":createTGZPackURL,
        "data":{"files":data},
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                var url=data.content;
                window.location.href=url;//下载返回的地址
            }
        }
    });
}