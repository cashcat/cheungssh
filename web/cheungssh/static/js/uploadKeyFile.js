/**
 * Created by 张其川 on 2016/10/5.
 */




//初始化
$(function(){
    initKeyFileDropZ();
    showKeyFileTable();//加载keyfile列表

})



function initKeyFileDropZ(){
    //拖动上传SSHKey
    var dropz = new Dropzone("#uploadKeyFileDropz", {
        url: uploadKeyFileURL,
        clickable:false,//取消点击
    });
    dropz.on("addedfile", function (file) {
        //alert("添加了文件")
        $(".dz-preview").remove(); //删除自带的文本提示
        //显示进度
        document.getElementById("uploadKeyFileProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;//拖动上传的文件名;
        startShadow();

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadKeyFileProgress=document.getElementById("uploadKeyFileProgress");
        progress=parseInt(progress);
        if(isNaN(progress)){
            //表示上传失败
            showErrorInfo("不能连接到服务器")
        }
        uploadKeyFileProgress.innerText=progress +"%";
    });
    dropz.on("success",function(file,tmp){
        //上传成功
        stopShadow();
        document.getElementById("uploadKeyFileProgress").style.display="none"; //关闭进度显示
        createKeyFileTbody(window.whoami,file.name);//创建新的一行记录
        showSuccessNotic();


    })
    //刷新列表
    document.getElementById("refreshKeyFileList").onclick=function(){
        loadKeyFileAdminHTML();
    }

}


function createKeyFileTbody(username,filename){
    //上传成功后，创建新的一行
    var showKeyFileTbody=document.getElementById("showKeyFileTbody");
    var tr=document.createElement("tr");
    var filenameTd=document.createElement("td");
    filenameTd.innerText=filename;//写入keyfile的文件名
    tr.appendChild(filenameTd);
    //用户名
    var usernameTd=document.createElement("td");
    usernameTd.innerText=username;
    tr.appendChild(usernameTd);
    //操作
    //删除按钮
    var opTd=document.createElement("td");
    var deleteButton=document.createElement("button");
    deleteButton.className="btn btn-xs btn-danger glyphicon glyphicon-trash";
    deleteButton.setAttribute("owner",username);//设置归属用户和文件名
    deleteButton.setAttribute("filename",filename);
    deleteButton.onclick=function(){
        deleteKeyFile(this);
    }
    opTd.appendChild(deleteButton);
    //编辑按钮
    var editButton=document.createElement("button");
    editButton.style.marginLeft="3px";
    editButton.className="btn btn-xs btn-success glyphicon glyphicon-edit ";
    editButton.onclick=function(){
        chownKeyFile();
    }
    opTd.appendChild(editButton);
    tr.appendChild(opTd);
    showKeyFileTbody.appendChild(tr);
}

function chownKeyFile(){
    //更改用户归属
    showErrorInfo("标准版不能修改属性,请购买企业版！")
    return false;
}

function deleteKeyFile(team){
    //team是button
    var username=team.getAttribute("owner");
    var filename=team.getAttribute("filename");
    var td=$(team).parent();
    var tr=$(td).parent();
    var data={"username":username,"filename":filename};
    data=JSON.stringify(data);
    jQuery.ajax({
        "url":deleteKeyFileURL,
        "dataType":"jsonp",
        "data":{"parameters":data},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
                //删除tr
                $(tr).remove();

            }
        }
    });
}

