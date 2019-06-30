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
    for(var i=0;i<window.currentfileDownloadSelectedServers.alias.length;i++){
        //把sid转换为alias
        var sid=window.currentfileDownloadSelectedServers.id[i];
 	var alias=window.currentfileDownloadSelectedServers.alias[i];

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
        divProgress.style.cssText="padding:8px;";
	divProgress.setAttribute("progress-sid","progress."+sid)
        var span=document.createElement("span");
        //span.innerText="10%";
        divProgress.appendChild(span);
        div3.appendChild(divProgress);
        lineDiv.appendChild(div3)//加入一行
        showRemoteDownloadServerDIV.appendChild(lineDiv);

    }

}



//初始化绑定

$(function(){
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
function _getFileTransDownloadProgress(tid){
    return function(){
        //访问真正的目标函数
        getFileTransDownloadProgress(tid);
    }
}


//获取文件传输进度
function getFileTransDownloadProgress(tid){
    jQuery.ajax({
        "url":getScriptInitProgressURL,
        "error":errorAjax,
        "data":{"tid":tid},
        "type":"GET",
        "success":function(data){
		data = JSON.parse(data)
            if(!data.status){
		showErrorInfo(data.content)
                return false;
            }
		var progress=data.progress;
		for(var key in progress){
		var bar = $('div[progress-sid="' + key + '"')
		if (progress[key].status === false){
			$(bar).css({"width":"100%","background":"red"}).find("span").text(progress[key].content)
			continue
		}
		if(parseInt(progress[key].content) === 100  ){
					showSuccessNotice("操作完成！")
			window.successed_downloadfile += 1//把成功下载的文件记录下来
			$(bar).css({"width":"100%"}).removeClass("active progress-bar-striped").find("span").text("已完成").css({"background":"#5cb85c"})
		}
		else{
			$(bar).css({"width":progress[key].content + "%"}).find("span").text(progress[key].content.toFixed(1) + "%")
		}
		}
		if(parseInt(data.whole_progress) < 100){
       	           		setTimeout(_getFileTransDownloadProgress(tid), 1000);
		}
		else{
			if(window.successed_downloadfile===0){
				info = "下载全部失败，无文件可下载！"
				isDownload = false;
			}
			else if(window.all_dfile.length > window.successed_downloadfile){
				isDownload = true;
				info ="部分服务器下载失败的,您可以继续打包下载成功的部分."
			}
			else{
                		createTgzPack();
				return true;
			}
                	showDownloadNotice(info,isDownload);
		}
        }
    });

}


//远程下载
function startRemoteDownloadToLocal(){
    //禁用上传按钮
    document.getElementById('startFileDownloadButton').setAttribute("disabled",true);
	var data= [];
    $("#showRemoteDownloadServerDIV>div").each(function(){
        var div=this;
        var sid=div.getAttribute("sid");
        var inputs=$(this).find("input");
        var localPath=inputs[0].value;//第一输入框是本地输入框
        var progressSpan=$(this).find("span")[3];
        data.push({"sfile":localPath,"sid":sid});
    })
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":remoteDownloadFileURL,
            "data":{"data":data},
		"type":"POST",
            "error":errorAjax,
            "success":function(data){
		data = JSON.parse(data)
                if(!data.status){
                    //后台启动上传失败
                    showErrorInfo(data.content)
                    return false;
                }
                else{
                    //后台启动文件上传成功，可以等待获取进度
                    var tid=data.content;
			window.all_dfile = data.all_dfile;
			window.successed_downloadfile = 0//把成功下载的文件记录下来
			getFileTransDownloadProgress(tid)

                }
            }
        });

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
//请求打包下载
function createTgzPack(){
    var data=JSON.stringify(window.all_dfile);//前面下载成功的文件清单
    jQuery.ajax({
        "url":createTGZPackURL,
        "data":{"files":data},
        "error":errorAjax,
	"type":"POST",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
		data = JSON.parse(data)
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
    $( ".modal-content" ).draggable();//窗口拖动
window.open("server_groups.html","_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
