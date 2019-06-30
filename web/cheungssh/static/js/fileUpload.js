/**
 * Created by 张其川 on 2016/9/27.
 */



//初始化加载
$(
    function () {
        initDropZ();
        initIndependentDropZ();
        //绑定远程路径的快速按钮
        document.getElementById("remotePathFastNext").onclick=function(){
		var path =document.getElementById("remotePath").value;
		if(/^ *$/.test(path)){
			return false;
		}
            var model="fast"; //指定上传的模式， 快速和高级
            remotePathNextButton(model);
        };
        //绑定远程路径高级按钮
        document.getElementById("remotePathAdvance").onclick=function(){
		var path =document.getElementById("remotePath").value;
		if(/^ *$/.test(path)){
			return false;
		}
            var model="advance";
            remotePathNextButton(model);
            document.getElementById("startFileUploadButton").removeAttribute("disabled");
        }

        //绑定跳过拖动上传按钮
        document.getElementById("dumpUploadFile").onclick=function(){
            $("#dropz").slideUp("fast");
            window.uploadFileModel="advance";//如果点击了跳过，那么说明是高级上传模式
            document.getElementById("startFileUploadButton").removeAttribute("disabled");
            createLocalServerAndRemoteServerDiv();
        }

        //给选择全部服务器绑定点击事件
        jQuery1_8("#fileUploadSelectAllServers").toggle(
            function(){
                $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
                $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            },function(){
                $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
                $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

            }
        );
        //绑定启动上传按钮
        document.getElementById("startFileUploadButton").onclick=function(){
            this.setAttribute("disabled",true)
            startLocalToRemoteUpload();
        }


        //绑定拖动单个文件的跳过按钮
        document.getElementById("dumpIndependentDropz").onclick=function(){
            $("#independentDropz").animate({
                "left":"100%",
            })
            this.style.display="none";
        }



    }
)


function showIndependentUploadFileDIV(){
    //显示单个拖动上传文件
    $("#independentDropz").animate({
        "left":"0%",
    })
    //显示关闭按钮
    document.getElementById("dumpIndependentDropz").style.display="block";

}

function remotePathNextButton(model){
    //获取输入的路径
    window.remotePath=document.getElementById("remotePath").value;
    if(window.remotePath.length==0){
        showErrorInfo("请填写远程路径！")
        return false;
    }
    document.getElementById("remotePathDIV").style.display="none";//关闭输入框
    $("#dropz").slideDown("fast");
    window.uploadFileModel=model;//上传文件模式
    document.getElementById("shadow").style.display="none";
}





function loadAllServers() {
    jQuery.ajax({
        "url": loadServerListURL,
        "error": errorAjax,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!responseCheck(data)) {
                return false;
            }
        }

    });
}





function createLocalServerAndRemoteServerDiv(){
    //显示处理服务器对应的目录和进度
    var showLocalServerAndRemoteServerDIV=document.getElementById("showLocalServerAndRemoteServerDIV");
    window.uploadFileData=[];//存放全部的上传数据[{"sid":sid,"dfile":dfile,"element":progressElement},...]
    for(var i=0;i<window.currentfileUploadSelectedServers.alias.length;i++){
        //把sid转换为alias
        var sid=window.currentfileUploadSelectedServers.id[i]
        var alias=window.currentfileUploadSelectedServers.alias[i];

        var lineDiv=document.createElement("div");
        lineDiv.className="col-sm-12 fileTransLocalAndRemoteDiv";//每一行,jquery读取通过这个类
        lineDiv.setAttribute("sid",sid);
        lineDiv.style.marginTop="10px";

        //第一个字段，CheungSSH服务器路径
        var div1=document.createElement("div");
        div1.style.float="left";
        div1.className="col-sm-4 input-group ";//一行中的第一组
        lineDiv.appendChild(div1)//加入一行

        //头部
        var span=document.createElement("span");
        //给上传图标绑定滑动事件和点击事件
        span.onclick=function(){
            var input=$(this).siblings("input")[0];//span的兄弟元素input就是本地路径
            window.currentLocalUploadFileInput=input;//记录当前上传的input空间，在拖动上传完成后，把值写入input中
            showIndependentUploadFileDIV();

        }
        span.onmouseover=function(){
            this.style.cursor="pointer";
        }
        span.onmouseout=function(){
            this.style.cursor="";
        }
        span.className="input-group-addon";
        var pic=document.createElement("span");
        pic.className="glyphicon glyphicon-upload";
        span.appendChild(pic); //上传图标
        span.style.width="40px";
        //span.innerHTML="&nbsp;AAA";

        //中间输入框
        var input=document.createElement("input");
        input.className="form-control ng-pristine ng-valid ng-touched localFilePath";
        input.style.display="inline";
        input.setAttribute("placeholder","请输入本地文件路径")
        if (window.fileUploadLocalFileName){
            input.value=window.fileUploadLocalFileName;

        }
        div1.appendChild(span);
        div1.appendChild(input);








        //第二个字段,远程服务器路径
        var div2=document.createElement("div");
        div2.style.left="10px";
        div2.className="col-sm-4 input-group";//一行中的第一组
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
        input.value=window.remotePath;
        div2.appendChild(span);
        div2.appendChild(input);

        lineDiv.appendChild(div2)//加入一行


        //第三个字段，显示上传进度
        var div3=document.createElement("div");
        div3.style.left="10px;"
        div3.style.float="left";
        div3.className="col-sm-4";//一行中的第一组
        div3.style.height="35px";
        var divProgress=document.createElement("div");
        divProgress.className="progress-bar progress-bar-success progress-bar-striped active";
	divProgress.style.cssText="padding:8px"
	divProgress.setAttribute("progress-sid","progress."+sid)
        //divProgress.style.width="80%";
        divProgress.style.borderRadius="4px";
        var span=document.createElement("span");
        //span.innerText="10%";
        divProgress.appendChild(span);
        div3.appendChild(divProgress);
        lineDiv.appendChild(div3)//加入一行
        showLocalServerAndRemoteServerDIV.appendChild(lineDiv);

    }
    if(window.uploadFileModel==="fast"){
        startLocalToRemoteUpload();//快速模式，直接上传，否则需要触发上传事件
    }

}

function startLocalToRemoteUpload(){
    //禁用上传按钮
    document.getElementById('startFileUploadButton').setAttribute("disabled",true);
	var data=[]
    $(".fileTransLocalAndRemoteDiv").each(function(){
        var div=this;
        var sid=div.getAttribute("sid");
        var inputs=$(this).find("input");
        var localPath=inputs[0].value;//第一输入框是本地输入框
        var remotePath=inputs[1].value;//第二个输入框是远程输入框
        var progressSpan=$(this).find("span")[3];
        data.push({"sfile":localPath,"dfile":remotePath,"sid":sid});
    })
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":fileTransURL,
            "data":{"data":data},
		"type":"POST",
            "error":errorAjax,
            "success":function(data){
		data = JSON.parse(data)
             //   var progressBar=$(div).find(".progress-bar")[0];//这个上面有progress-bar类
                if(!data.status){
                    //后台启动上传失败
                    showErrorInfo(data.content)
                    return false;
                }
                else{
                    //后台启动文件上传成功，可以等待获取进度
                    var tid=data.content;
                    getFileTransProgress(tid);

                }
            }
        });

}
function initIndependentDropZ(){
    //单个拖动上传
    var dropz = new Dropzone("#independentDropz", {
        url: uploadFileToCheungSSH,
    });
    dropz.on("addedfile", function (file) {
        //alert("添加了文件")
        //document.getElementById("dropz").innerHTML=""
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        document.getElementById("showIndependentProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;//拖动上传的文件名;
        startShadow();

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadFileProgress=document.getElementById("showIndependentProgress");
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
        document.getElementById("showIndependentProgress").style.display="none"; //关闭进度显示
        $("#independentDropz").animate({
            "left":"100%",
        })
        document.getElementById("dumpIndependentDropz").style.display="none";//隐藏关闭按钮
        //写入文件名到input
        window.currentLocalUploadFileInput.value=file.name;//把值写入input中

    })

}

function initDropZ() {
    var dropz = new Dropzone("#dropz", {
        url: uploadFileToCheungSSH,
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
        createLocalServerAndRemoteServerDiv();//显示界面布局
    })
    //https://www.renfei.org/blog/dropzone-js-introduction.html
}




//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getFileTransProgress(tid){
    return function(){
        //访问真正的目标函数
        getFileTransProgress(tid);
    }
}


//获取文件传输进度
function getFileTransProgress(tid){
    jQuery.ajax({
        "url":getScriptInitProgressURL,
        "error":errorAjax,
        "data":{"tid":tid},
        "dataType":"jsonp",
        "success":function(data){
            if(!data.status){
		showErrorInfo(data.content)
                return false;
            }
            else{
                //progressBar.style.width=progress+"%";
                //progressSpan.innerText=progress+"%";
		
		//
			var progress=data.progress;
			for(var key in progress){
				var bar = $('div[progress-sid="' + key + '"')
				if (progress[key].status === false){
					$(bar).css({"width":"100%","background":"red"}).find("span").text(progress[key].content)
					continue
				}
				if(parseInt(progress[key].content) === 100  ){
					showSuccessNotice("操作完成！")
					$(bar).css({"width":"100%"}).removeClass("active progress-bar-striped").find("span").text("已完成").css({"background":"#5cb85c"})
				}
				else{
					$(bar).css({"width":progress[key].content + "%"}).find("span").text(progress[key].content.toFixed(1) + "%")
				}
			}
			if(parseInt(data.whole_progress) < 100){
                    		setTimeout(_getFileTransProgress(tid), 1000);
			}
		//
		/*
                if(progress<100){
                    //小于100的时候，继续获取进度
                    //setTimeout(getFileTransProgress(tid,progressBar,progressSpan),1000)     ;
                    setTimeout(_getFileTransProgress(tid,progressBar,progressSpan),1000);
                    //用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的

                }
                else if(progress==100){
                    //上传成功，把进度条改成成功提示
                    setTimeout(function(){
                        //暂停一秒钟再显示成功
                        $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                        progressBar.textContent="成功";
                        progressBar.className="label label-success";
                    },1000);


                }
		*/
            }
        }
    });

}

    $( ".modal-content" ).draggable();//窗口拖动
window.open("server_groups.html","_blank","location=no,scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,width=2000px,height=10000px")
