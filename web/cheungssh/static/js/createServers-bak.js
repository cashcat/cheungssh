/**
 * Created by CheungKeiCheun on 2016/5/27.
 *
 */



//作者张其川


function getServerOptions() {
    jQuery.ajax({
        "url": headURL + parameterURL,
        "dataType": "jsonp",
        "success": processServerOptions,
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "data": {"parameter": "serverOptions"},
    });
}


function processServerOptions(data) {
    if (responseCheck(data)) {
        var serverOptions = data.content;
        var tr = document.getElementById("serverOptions");
        window.myServerOptions = serverOptions;  //这是一个字典  {"id":"ip","name":"IP"}
        //开始创建每一个表头
        for (i = 0; i < serverOptions.length; i++) {   //这是一个字典  {"id":"ip","name":"IP"}
            var serverSection = serverOptions[i].name;
            var th = document.createElement("th");
            th.textContent = serverSection;
            tr.appendChild(th);
        }

        tr.appendChild(th);
        var operationTh = document.createElement("th");
        operationTh.style.minWidth="80px";
        operationTh.textContent = "操作";
        tr.appendChild(operationTh);
        getServersList();  //获取服务器配置列表

    }
}

function loadServers() {
    window.allServersList=undefined;
    if(!window.keyFileList){
        getKeyFileList();
    }
    //document.getElementById("showServers").style.display = "block";
    $("#showMainContent").load("static/html/servers.html");
    getServerOptions();  //自动获取表头
    //getServersList();  //获取服务器配置列表


}


//用于初始化加载
function initGetServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        "dataType": "jsonp",
        "success": function(data){
            responseCheck(data);
            window.allServersList=data.content;

        },
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic
    });

}




function getServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        "dataType": "jsonp",
        "success": processServersList,
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic
    });

}

function processServersList(data) {
    if (responseCheck(data)) {
        var serverOptions = [];
        for (s in window.myServerOptions) {  //s => {"id":"IP","name":"IP"}
            serverOptions.push(window.myServerOptions[s].id);   //["ip","port"....]
        }
        var tbody = document.getElementById("serversList");
        var content = data.content;        //content全部服务器的配置
        window.allServersList = content;

        for (var i = 0; i < content.length; i++) {   //i 是单个服务器的全部配置
            var tr = document.createElement("tr");
            //复选框
            var checkTd = document.createElement("td");
            checkTd.style.cssText = "cursor:pointer";
            jQuery1_8(checkTd).toggle(   //绑定复选框
                function () {
                    $(this).children("i").removeClass("glyphicon-unchecked");
                    $(this).children("i").addClass("glyphicon-check");

                }, function () {
                    $(this).children("i").removeClass("glyphicon-check");
                    $(this).children("i").addClass("glyphicon-unchecked");
                }
            );

            var iTag = document.createElement("i");
            iTag.className = "glyphicon glyphicon-unchecked serverCheck";
            checkTd.appendChild(iTag);
            tr.appendChild(checkTd);
            //复选框

            //服务器ID
            var serverID = document.createElement("td");
            serverID.className = "serverID";
            serverID.textContent = content[i]["id"];  //服务器的ID
            serverID.style.display = "none";
            tr.appendChild(serverID);
            for (var ii = 0; ii < serverOptions.length; ii++) {  //每一个服务器的每一个选项
                var td = document.createElement("td");
                var id = serverOptions[ii];
                if(id==="login_method"){
                    if(content[i]["login_method"]==="PASSWORD"){
                        td.textContent = "密码";    //服务器选项选项ID
                    }
                    else{
                        td.textContent = "秘钥";    //服务器选项选项ID
                    }
                }
                else  if(id==="key_file"){
                    var fid=content[i][id];
                    if(content[i]["login_method"]==="KEY"){
                        //如果是key登录，这里替换fid为文件名
                        for (var keyfile_i=0;keyfile_i<window.keyFileList.length;keyfile_i++){
                            if (fid===window.keyFileList[keyfile_i]["fid"])  {
                                var fileName=window.keyFileList[keyfile_i].filename;
                                td.textContent = fileName;   //服务器选项选项ID
                                break;
                            }
                        }
                    }

                }
                else{
                    td.textContent = content[i][id];    //服务器选项选项ID

                }
                tr.appendChild(td);
            }

            //操作区域
            var operationTd = document.createElement("td");
            var a = document.createElement("a");
            a.className = "btn btn-primary btn-sm";
            a.onclick = function () {
                editServer(this);
            };
            a.setAttribute("href", "#");
            var span = document.createElement("span");
            span.className = "glyphicon  glyphicon-edit";
            a.appendChild(span);
            operationTd.appendChild(a);

            var a = document.createElement("a");
            a.className = "btn btn-danger btn-sm";
            a.setAttribute("id", "inLineDeleteServer");
            a.onclick=function(){
                deleteServer(this);
            };
            var span = document.createElement("span");
            span.className = "glyphicon  glyphicon-trash";
            a.appendChild(span);
            operationTd.appendChild(a);
            tr.appendChild(operationTd);
            //操作区域
            try{
                tbody.appendChild(tr);

            }
            catch (e){
                //
            }
        }


    }
}





function editServer(team) {
    document.getElementById("updateServerConfig").style.display="";
    document.getElementById("createConfig").style.display="none";
    var serverID = $(team).parent().siblings(".serverID")[0].textContent.toString();
    window.serverID=serverID;
    for (var i = 0; i < window.allServersList.length; i++) {
        var tID = window.allServersList[i].id.toString();
        //这是一个字典
        if (tID == serverID) {
            //找到了对应的服务器ID，开始工作
            var serverConfig = window.allServersList[i];  //获取自己的全部配置行
            document.getElementById("editDiv").style.display="block"; //开启编辑框
            document.getElementById("shadow").style.display="block";  //开启背影
            //开始加载数据
            var serverOptions=window.myServerOptions;
            var showEditList=document.getElementById("showEditList");
            for (s in serverOptions){
                var id=serverOptions[s].id; //获取表头的选项
                var sectionName=serverOptions[s].name; //比如 端口  别名
                //每一行
                var div=document.createElement("div");
                div.className="col-md-12 input-group";
                div.style.paddingBottom="5px";
                //div包含了每一行
                var span=document.createElement("span");
                span.className="input-group-addon";
                span.style.width="90px";
                span.innerHTML="&nbsp;"+sectionName;
                //每一行数据
                //上面创建了每一行的头，比如[端口]



                //开始加载数据到每一个input中
                var dynamicTag="";  //选择加入的情况，这里定义一个变量标记
                if(id==="owner"){
                    var dropClassDiv=document.createElement("div");
                    dropClassDiv.className="dropdown";
                    dropClassDiv.style.width="auto";
                    var button =document.createElement("button");
                    button.className="btn btn-default  iphoneButton";
                    button.setAttribute("id","owner");
                    button.setAttribute("type","button");
                    button.textContent=serverConfig[id];
                    button.onclick=function(){
                        if (document.getElementById("showUserList").style.display==="block"){
                            document.getElementById("showUserList").style.display="none";
                        }
                        else{
                            document.getElementById("showUserList").style.display="block";
                        }
                    }


                    var picSpan=document.createElement("span");
                    picSpan.className="caret";

                    button.appendChild(picSpan);
                    dropClassDiv.appendChild(button);

                    var ul=document.createElement("ul");
                    ul.setAttribute("id","showUserList");
                    ul.className="dropdown-menu";
                    ul.style.width="100%";

                    //循环显示用户清单
                    //页面加载的时候已经获取了用户清单
                    for(var userI=0;userI<window.myUserList.length;userI++){
                        var liTag=document.createElement("li");
                        liTag.className="form-control ng-pristine ng-valid ng-touched";
                        liTag.textContent=window.myUserList[userI];
                        liTag.style.paddingTop="10px";
                        liTag.onclick=function(){
                            document.getElementById("owner").textContent=this.textContent;
                            $(this).parent().css({"display":"none"});
                        }
                        ul.appendChild(liTag);
                    }


                    dropClassDiv.appendChild(ul);
                    dynamicTag=dropClassDiv;

                }
                else if(id==="key_file"){
                    if(serverConfig.login_method==="KEY"){
                        var key_file=document.getElementById("key_file");
                        key_file.setAttribute("value",serverConfig[id]);
                        var fid=serverConfig[id];
                        for (var _i=0;_i<window.keyFileList.length;_i++){
                            if(window.keyFileList[_i]["fid"].toString()===fid.toString()){
                                var fileName=window.keyFileList[_i]["filename"];
                                break;
                            }
                        }
                        key_file.textContent=fileName;
                    }
                    continue;
                }
                 else if(id==="login_method"){
                     var showLoginMethod=document.getElementById("login_method");
                     if(serverConfig[id]==="PASSWORD"){
                         showLoginMethod.textContent="密码";
                         document.getElementById("passwordFrame").style.display="";
                         document.getElementById("password").value=serverConfig["password"];
                         document.getElementById("keyFrame").style.display="none";
                     }else{
                         showLoginMethod.textContent="秘钥";
                         document.getElementById("passwordFrame").style.display="none";
                         document.getElementById("keyFrame").value=serverConfig["key_file"];
                         document.getElementById("keyFrame").style.display="";
                     }
                     showLoginMethod.setAttribute("value",serverConfig[id]);
                     continue;
                }
                else  if(id==="su_password"){
                    continue;
                }
                else if(id==="password"){
                    document.getElementById("password").value=serverConfig[id];
                    continue
                }
                else if(id==="su"){
                     if(serverConfig[id].toUpperCase()==false){
                         document.getElementById("su_password").setAttribute("disabled",true);
                         document.getElementById("su").setAttribute("value",false);

                         //如果没有选中，还记得把值删除
                         document.getElementById("su_password").value="";
                         $("#su").children("i").removeClass("glyphicon-check");//删除未选中图标
                         $("#su").children("i").addClass("glyphicon-unchecked");  //变为选中图标
                     }
                     else{
                         document.getElementById("su").setAttribute("value",true);
                         document.getElementById("su_password").value=serverConfig["su_password"];
                         $("#su").children("i").removeClass("glyphicon-unchecked");//删除未选中图标
                         $("#su").children("i").addClass("glyphicon-check");  //变为选中图标
                     }

                    continue;
                }
                else if(id==="sudo_password"){
                    continue;
                }
                else  if(id==="sudo"){
                     if(serverConfig[id].toUpperCase()==false){
                         document.getElementById("sudo_password").setAttribute("disabled",true);
                         document.getElementById("sudo").setAttribute("value",false);

                         //如果没有选中，还记得把值删除
                         document.getElementById("sudo_password").value="";
                         $("#sudo").children("i").removeClass("glyphicon-check"); //删除未选中图标
                         $("#sudo").children("i").addClass("glyphicon-unchecked");

                     }
                     else{
                         document.getElementById("sudo").setAttribute("value",true);
                         document.getElementById("sudo_password").value=serverConfig["sudo_password"];
                         $("#sudo").children("i").removeClass("glyphicon-unchecked"); //删除未选中图标
                         $("#sudo").children("i").addClass("glyphicon-check");

                     }
                     continue;
                }
                else{
                    //默认的标签是input
                    var input=document.createElement("input");
                    input.setAttribute("type","text");
                    input.setAttribute("id",id);
                    input.className="form-control ng-pristine ng-valid ng-touched";
                    input.style.display="inline";
                    input.value=serverConfig[id];
                    dynamicTag=input;

                }
                //不通选项的标签
                div.appendChild(span);
                div.appendChild(dynamicTag);
                showEditList.appendChild(div);
            }
            break;
        }
    }


}




function deleteServer(team){
    var serverID=$(team).parent().siblings(".serverID")[0].textContent.toString();
    var servers=JSON.stringify([serverID]);
    jQuery.ajax({
        "url":headURL+deleteServerURL,
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "dataType":"jsonp",
        "success":function(data){
            responseCheck(data);
            if (data.status){
                showSuccessNotic();
                var  t=$(team).parent().parent().remove();  //删除tr
            }
        },
        "data": {"hosts":servers}
    });
}




$(document).on("click","#batchDeleteServers",function(){
    var serversID=[];
    $("#serversList>tr .glyphicon-check").each(function(){
        //i标签
        var td=$(this).parent();//td
        var id=td.siblings(".serverID").text();
        serversID.push(id);

    });
    serversID=JSON.stringify(serversID);
    jQuery.ajax({
        "url":headURL+deleteServerURL,
        "data":{"hosts":serversID},
        "type":"get",
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            if (data.status){
                showSuccessNotic();
            }
            $("#serversList>tr .glyphicon-check").each(function(){
                //i标签
                var td=$(this).parent();//td
                var tr=td.parent();//tr
                tr.remove();

            });



        }
    });


})





//初始化加载
$(function(){
    //绑定批量添加服务器按钮





})

