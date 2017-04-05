/**
 * Created by 张其川 on 2016/7/10.
 */



$(function () {
    //选择全部服务的复选框
    jQuery1_8("#selectAllServers").toggle(
        function () {
            $(".serverCheck").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $(this).children("i").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
        }, function () {
            $(".serverCheck").removeClass(" glyphicon-check").addClass("glyphicon-unchecked ");
            $(this).children("i").removeClass(" glyphicon-check").addClass("glyphicon-unchecked ");

        }
    );

})

//服务器的单个复选框点击事件处理
function selectServerCheck(team) {
    //team是td，td下面是span
    var span = $(team).children()[0];
    if ($(span).hasClass("glyphicon-unchecked")) {
        //如果点击的时候是未选中,那么就选中，
        $(span).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
    }
    else {
        //如果是选中的，那么就取消选中
        $(span).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
    }

}

function createServerLine(serverLine) {
    //serverLine是一个服务器的全部配置
    var tbody = document.getElementById("serversConfigTbody");
    var tr = document.createElement("tr");//创建一行
    var sid = serverLine.id;
    tr.setAttribute("sid", sid);


    //首先创建一个复选框
    var span = document.createElement("span");
    span.className = "glyphicon glyphicon-unchecked serverCheck";
    var td = document.createElement("td");//复选框td
    td.style.cursor = "pointer";
    td.onclick = function () {
        selectServerCheck(this);//绑定复选框点击事件
    }
    td.appendChild(span);
    tr.appendChild(td);
    tbody.appendChild(tr);


    //第二个字段IP
    var td = document.createElement("td");
    td.textContent = serverLine.ip;
    td.className = "ip";
    tr.appendChild(td);

    //第三个字段是别名
    var td = document.createElement("td");
    td.textContent = serverLine.alias;
    td.className = "alias";
    tr.appendChild(td);

    //第四个字段属主
    var td = document.createElement("td");
    td.className = "owner";
    td.textContent = serverLine.owner;
    tr.appendChild(td);

    //第五个字段主机组
    var td = document.createElement("td");
    td.className = "group";
    td.textContent = serverLine.group;
    tr.appendChild(td);
    //第五个字段 用户名
    var td = document.createElement("td");
    td.className = "username";
    td.textContent = serverLine.username;
    tr.appendChild(td);

    //第六个字段登录方式
    var td = document.createElement("td");
    td.className = "login_method";
    //修改登录方式为中文
    var login_method = serverLine.login_method;
    td.textContent = login_method;
    tr.appendChild(td);

    //第七个字段 密码值
    var td = document.createElement("td");
    td.className = "password";
    td.textContent = serverLine.password;
    tr.appendChild(td);

    //第八个字段 秘钥文件
    var td = document.createElement("td");
    td.className = "keyfile";
    td.textContent = serverLine.keyfile;
    tr.appendChild(td);

    //第九个字段 秘钥密码
    var td = document.createElement("td");
    td.className = "keyfile_password";
    td.textContent = serverLine.keyfile_password;
    tr.appendChild(td);

    //第十个字段端口
    var td = document.createElement("td");
    td.className = "port"
    td.textContent = serverLine.port;
    tr.appendChild(td);

    //第十一个字段 sudo
    var td = document.createElement("td");
    td.className = "sudo"
    var sudo = serverLine.sudo;
    td.textContent = sudo;
    tr.appendChild(td);


    //第十二个字段 sudo密码

    var td = document.createElement("td");
    td.className = "sudo_password";
    td.textContent = serverLine.sudo_password;
    tr.appendChild(td);

    //第十三个字段 su
    var td = document.createElement("td");
    td.className = "su"
    var su = serverLine.su;
    td.textContent = su;
    tr.appendChild(td);

    //第十三个字段 su密码
    var td = document.createElement("td");
    td.className = "su_password";
    td.textContent = serverLine.su_password;
    tr.appendChild(td);

    //第十四个字段 状态
    var td = document.createElement("td");
    td.setAttribute("id", sid);//用来服务器状态后台更新检查
    td.className = "status";
    td.style.cursor = "pointer";
    var span = document.createElement("span");
    //状态应该是一个dict
    var info = serverLine["status"];//{"status":"checking/success/failed","content":"错误内容","time":"2016-1-1"}
    span.setAttribute("time",info.time);
    span.setAttribute("status",info.status);
    span.setAttribute("info",info.content);
    span.setAttribute("alias",serverLine.alias);
    //绑定点击显示详细信息
    span.onclick=function(){
        $("#showServerCheckInfo").show("fast");
        document.getElementById("showCheckHost").textContent=this.getAttribute("alias");
        document.getElementById("showCheckTime").textContent=this.getAttribute("time");
        var status=this.getAttribute("status");
        var showCheckStatus= document.getElementById("showCheckStatus");
        var span=document.createElement("span");
        if(status=="success"){
            span.className="label label-success";
            span.textContent="正常"
        }
        else{
            span.className="label label-danger";
            span.textContent="失败"
        }
        $(showCheckStatus).children().remove();//删除此前的状态，避免重复
        showCheckStatus.appendChild(span);//加入新的状态信息
        document.getElementById("showCheckInfo").textContent=this.getAttribute("info");
        $("#showServerCheckInfo").show("fast");
        startShadow();


    }
    if (info["status"] == "success") {
        span.className = "label label-success";
        span.textContent = "正常";
        td.appendChild(span);
    }
    else if (info["status"] == "failed") {
        span.textContent = "失败";
        var errInfo = info["content"];
        span.className = "label label-danger";
        td.appendChild(span);
    }
    else {
        var i=document.createElement("i");
        i.className="fa-refresh   fa-spin  fa fa-lg  fa-li";
        i.style.position="static";

        td.appendChild(i);

    }
    tr.appendChild(td);


    //第十五个字段 备注
    var td = document.createElement("td");
    td.className = "description";
    td.textContent = serverLine.description;
    tr.appendChild(td);

    //第十六个字段 操作

    //编辑按钮
    var td = document.createElement("td");
    var editButton = document.createElement("button");
    editButton.className = "btn btn-success btn-xs glyphicon glyphicon-edit";
    editButton.setAttribute("sid", serverLine.id);//服务器的每一个参数在className中
    editButton.onclick = function () {
        window.currentEditTr = this;//当前最的编辑行
        //把sid传递给保存按钮
        document.getElementById("saveServerConfig").setAttribute("sid", this.getAttribute("sid"));
        loadServerLineToTable(this);//把当前的编辑按钮传入，按钮中存在各个属性
        window.currentEditServerModel = "edit";//记录当前的编辑模式，有edit/create
    }
    td.appendChild(editButton);
    //删除按钮
    var deleteButton = document.createElement("button");
    deleteButton.style.marginLeft = "3px";
    deleteButton.className = "btn btn-danger btn-xs glyphicon glyphicon-trash";
    deleteButton.setAttribute("sid", serverLine.id);
    deleteButton.onclick = function () {
        //记得从windowallServerList中删除记录
        var deleteButtonElements = [this];//可以批量删除
        deleteServerConfig(deleteButtonElements);
    }
    td.appendChild(deleteButton);
    tr.appendChild(td);


    //最后加入表格
    tbody.appendChild(tr);
}
function deleteServerConfigLine(deleteButton) {
    //删除服务器，请求服务服务器成功后，删除tr行
    var sid = deleteButton.getAttribute("sid");
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    $(tr).remove();//删除TR
    //从内存中删除记录
    for (var i = 0; i < window.allServersList.length; i++) {
        if (window.allServersList[i].id == sid) {
            window.allServersList.pop(i);
        }
    }
}

function deleteServerConfig(deleteButtonElements) {
    //deleteButtonElements=[deleteButton1,deleteButton2]
    //删除服务器，请求服务服务器
    var hosts = [];
    for (var i = 0; i < deleteButtonElements.length; i++) {
        hosts.push(deleteButtonElements[i].getAttribute("sid"));
    }
    var hostsData = JSON.stringify(hosts);
    jQuery.ajax({
        "url": deleteServerURL,
        "dataType": "jsonp",
        "data": {"hosts": hostsData},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                //删除服务器表tr
                for (var i = 0; i < deleteButtonElements.length; i++) {
                    deleteServerConfigLine(deleteButtonElements[i]);
                }
                initGetServersList();//重新加载

            }
        }

    });

}

function loadServerLineToTable(editButton) {
    //editButton是编辑按钮
    //点击编辑按钮，把数据加载到编辑框中
    //首先显示编辑框
    startShadow();
    showEditServerConfigTable();//只是显示编辑框
    var sid = editButton.getAttribute("sid");
    var td = $(editButton).parent();
    var tr = $(td).parent();
    var ip = $(tr).find(".ip")[0].textContent;
    var alias = $(tr).find(".alias")[0].textContent;
    var owner = $(tr).find(".owner")[0].textContent;
    var group = $(tr).find(".group")[0].textContent;
    var username = $(tr).find(".username")[0].textContent;
    var loginMethod = $(tr).find(".login_method")[0].textContent;
    var password = $(tr).find(".password")[0].textContent;
    var keyfile = $(tr).find(".keyfile")[0].textContent;
    var keyfilePassword = $(tr).find(".keyfile_password")[0].textContent;
    var port = $(tr).find(".port")[0].textContent;
    var sudo = $(tr).find(".sudo")[0].textContent;
    var sudoPassword = $(tr).find(".sudo_password")[0].textContent;
    var su = $(tr).find(".su")[0].textContent;
    var suPassword = $(tr).find(".su_password")[0].textContent;
    var description = $(tr).find(".description")[0].textContent;
    //把数据装载进入编辑框中的对象

    document.getElementById("ip").value = ip;//ip
    document.getElementById("alias").value = alias;
    //选中属主
    var ownerSelect = document.getElementById("owner");
    console.log( typeof ownerSelect.options);
    for(var i=0; i<ownerSelect.options.length; i++){
        if(ownerSelect.options[i].textContent == owner){
            ownerSelect.options[i].selected = true;
            break;
        }
    }


    document.getElementById("group").value = group;
    document.getElementById("username").value = username;
    var loginMethodSelect = document.getElementById("loginMethod");
    //选择登录方式
    for(var i=0; i<loginMethodSelect.options.length; i++){
        if(loginMethodSelect.options[i].textContent == loginMethod){
            loginMethodSelect.options[i].selected = true;
            break;
        }
    }
    var keyfileDiv = document.getElementById("keyfileDiv");
    var passwordDiv = document.getElementById("passwordDiv");
    if (loginMethod == "PASSWORD") {
        //密码方式，隐藏key框
        keyfileDiv.style.display = "none";
        passwordDiv.style.display = "";

    }
    else {
        //key方式，隐藏密码框
        passwordDiv.style.display = "none";
        keyfileDiv.style.display = "";
        loginMethod = "KEY";

        var keyfileSelect=document.getElementById("keyfile");
        //选择秘钥文件
        for(var i=0; i<keyfileSelect.options.length; i++){
            if(keyfileSelect.options[i].textContent == keyfile){
                keyfileSelect.options[i].selected = true;
                break;
            }
        }



    }
    document.getElementById("password").value = password;
    document.getElementById("port").value = port;
    if (sudo == "Y") {
        $($("#sudo").find("i")[0]).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
        document.getElementById("sudoPassword").removeAttribute("disabled");
    }
    else {
        //没有启用，封闭输入框
        $($("#sudo").find("i")[0]).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        document.getElementById("sudoPassword").setAttribute("disabled", true);

    }
    document.getElementById("sudoPassword").value = sudoPassword
    document.getElementById("su").value = su;
    document.getElementById("suPassword").value = suPassword
    document.getElementById("description").value = description;
    //连接设备
    console.log(window.allServersList);

    //删除此前的记录
    $("#linkDevice").find(".glyphicon-check").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        $("#linkDevice").find(".glyphicon").each(function(){
        var name=$(this).siblings()[0].textContent;
        for(var i=0;i<window.allServersList.length;i++){
            var edge=window.allServersList[i].link_device.edge;
            for(var h=0;h<edge.length;h++){//所有线路
                var from=edge[h].from;
                if (from===alias){
                    var to=edge[h].to;
                    if(name===to){
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");//命中选项
                    }

                }

            }
        }
    })


}


function showEditServerConfigTable() {
    //显示服务器编辑框
    $("#editServerConfigTable").animate({
        "left": "0px",
        "top": "0px",
    });
}


function loadServersConfigTable() {
    //显示服务器到表格中
    $("#serversConfigTbody").children().remove();//删除此前的HTML，这里有可能是加载刷新
    for (var i = 0; i < window.allServersList.length; i++) {
        var serverLine = window.allServersList[i];
        createServerLine(serverLine);//调用创建服务器的每一行
    }

}


function closeEditServer() {
    stopShadow();
    $("#editServerConfigTable").animate({
        "left": "100%",
        "top": "120%",
    })
}

//绑定编辑框中，各个按钮的事件
function changeServerDataButton() {
    //绑定选择密码登录方式的标签
    var password = document.getElementById("passwordDiv");//密码框
    var keyfilePassword = document.getElementById("keyfilePasswordDiv");//秘钥框
    var keyfilePasswordDiv=document.getElementById("keyfilePasswordDiv");//秘钥密码框

    //绑定登录方式选择
    document.getElementById("loginMethod").onchange=function(){
        var keyfileDiv=document.getElementById("keyfileDiv");
        var passwordDiv=document.getElementById("passwordDiv");
        if(this.value=="KEY"){
            keyfileDiv.style.display="";
            passwordDiv.style.display="none";
            keyfilePasswordDiv.style.display="";

        }
        else if(this.value="PASSWORD"){
            keyfileDiv.style.display="none";
            keyfilePasswordDiv.style.display="none";
            passwordDiv.style.display="";
        }
    }

    //绑定别名唯一性检查
    document.getElementById("alias").onchange = function () {
        aliasCheck(this);
    }


    //绑定sudo选择
    document.getElementById("sudo").onclick = function () {
        //this是div，
        sudoProgress(this)
    }
    //绑定su选择
    document.getElementById("su").onclick = function () {
        //this是div，
        suProgress(this)
    }
    //绑定创建服务器按钮
    document.getElementById("createServer").onclick = function () {
        startShadow();
        cleanEditServerConfigTableData();
        $("#editServerConfigTable").slideUp("fast");
    }
}
function createUserList() {
    //绑定用户归属选择
    var owner = document.getElementById("owner");
    for (var i = 0; i < window.userList.length; i++) {
        var username = window.userList[i];
        var option = document.createElement("option");
        option.value=username;
        option.textContent=username;
        if(window.whoami==username){
            //默认是当前用户
            option.setAttribute("selected","selected");
        }
        owner.appendChild(option);
    }
}

function createKeyFileList(){
    var keyfile=document.getElementById("keyfile");
    for(var i=0;i<window.keyfileList.length;i++){
        var filename=window.keyfileList[i].keyfile;
        var option=document.createElement("option");
        option.textContent=filename;
        option.value=filename;
        keyfile.appendChild(option);
    }
}

function cleanEditServerConfigTableData() {
    //清除编辑框的数据
    document.getElementById("ip").value = "";
    document.getElementById("alias").value = "";
    document.getElementById("owner").innerHTML = '请选择 <span class="caret">';
    document.getElementById("group").value = "";
    document.getElementById("username").value = "";
    document.getElementById("loginMethod").innerHTML = 'PASSWORD <span class="caret">';
    document.getElementById("password").value = "";
    document.getElementById("keyfile").innerHTML = '请选择 <span class="caret">';
    document.getElementById("port").value = 22;
    document.getElementById("sudo").value = sudo;
    $("#sudo").find("")
    document.getElementById("sudoPassword").value = sudoPassword;
    document.getElementById("su").value = su;
    document.getElementById("suPassword").value = ""
    document.getElementById("description").value = "";
}

function sudoProgress(div) {
    //点击sudo按钮的时候要处理的事情
    //div是i和span,i中是check
    var sudoPassword = document.getElementById("sudoPassword");
    var suPassword = document.getElementById("suPassword");

    var check = $(div).find("i")[0];
    if ($(check).hasClass("glyphicon-check")) {
        //如果点击之前是被选中的，则取消选中
        $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
        sudoPassword.setAttribute("disabled", true);//取消了以后，就不能输入密码了
    }
    else {
        $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
        sudoPassword.removeAttribute("disabled");
        //这里做了sudo的选中，所以取消su的选中
        var suDiv = $("#su");
        var suCheck = $(suDiv).find("i")[0];
        $(suCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        suPassword.setAttribute("disabled", true)
    }

}
function suProgress(div) {
    //点击su按钮的时候要处理的事情
    var sudoPassword = document.getElementById("sudoPassword");
    var suPassword = document.getElementById("suPassword");
    //div是i和span,i中是check
    var check = $(div).find("i")[0];
    if ($(check).hasClass("glyphicon-check")) {
        //如果点击之前是被选中的，则取消选中
        $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
        suPassword.setAttribute("disabled", true)
    }
    else {
        $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
        suPassword.removeAttribute("disabled");
        //这里做了su的选中，所以取消sudo的选中
        var sudoDiv = $("#sudo");
        var sudoCheck = $(sudoDiv).find("i")[0];
        $(sudoCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        sudoPassword.setAttribute("disabled", true)
    }

}


function aliasCheck(input) {
    for (var i = 0; i < window.allServersList.length; i++) {
        var serverConf = window.allServersList[i];
        if (input.value == serverConf.alias) {
            showErrorInfo("别名重复！请重新命名")
            input.style.borderColor = "red";
            return false;
        }
    }
    input.style.borderColor = "";

}

function getServerConfigFromTable() {
    //获取编辑框中的服务器配置
    var sid = document.getElementById("saveServerConfig").getAttribute("sid");
    var ip = document.getElementById("ip").value;
    var alias = document.getElementById("alias").value;
    var owner = document.getElementById("owner").value;
    var group = document.getElementById("group").value;
    var username = document.getElementById("username").value;
    var loginMethod = document.getElementById("loginMethod").value;

    var password = document.getElementById("password").value;
    var keyfile = document.getElementById("keyfile").value;
    var keyfilePassword = document.getElementById("keyfilePassword").value;
    var port = document.getElementById("port").value;
    var link={"nodes":[{"name":alias,"x":0,"y":0}],"edge":[]};
    $("#linkDevice").find(".glyphicon-check").each(function(){
        var name=$(this).siblings()[0].textContent;
        link["edge"].push({"from":alias,"to":name});
    })



    if ($($($("#sudo")).find("i")).hasClass("glyphicon-check")) {
        //sudo下面的i才是复选框
        var sudo = "Y"
    }
    else {
        sudo = "N";
    }
    var sudoPassword = document.getElementById("sudoPassword").value;
    if ($($($("#su")).find("i")).hasClass("glyphicon-check")) {
        //sudo下面的i才是复选框
        var su = "Y"
    }
    else {
        su = "N";
    }
    var suPassword = document.getElementById("suPassword").value;
    var description = document.getElementById("description").value;


    //填写的值检查
    if(/^ *$/.test(ip) ||  /^ *$/.test(alias) || /^ *$/.test(owner) ||/^ *$/.test(group) || /^ *$/.test(username) || /^ *$/.test(port)){
        showErrorInfo("请填写完整的主机信息！");
        return false;
    }



    var serverConfig = {
        "id": sid,
        "ip": ip,
        "alias": alias,
        "owner": owner,
        "group": group,
        "username": username,
        "login_method": loginMethod,
        "password": password,
        "keyfile": keyfile,
        "keyfile_password": keyfilePassword,
        "port": port,
        "sudo": sudo,
        "sudo_password": sudoPassword,
        "su": su,
        "su_password": suPassword,
        "description": description,
        "link_device":link,
    };


    if (window.currentEditServerModel == "edit") {
        var data = JSON.stringify(serverConfig);
        jQuery.ajax({
            "url": modifyURL,
            "dataType": "jsonp",
            "data": {"host": data},
            "error": errorAjax,
            "beforeSend": start_load_pic,
            "complete": stop_load_pic,
            "success": function (data) {
                if (!responseCheck(data)) {
                    showErrorInfo(data.content);
                    return false;
                }
                else {
			showSuccessNotic();
                    serverConfig.sudo_password = "******"
                    serverConfig.su_password = "******"
                    serverConfig.keyfile_password = "******"
                    modifyServerConfigTable(serverConfig);
                    initGetServersList();//重新加载服务器清单
                    //立马请求检查服务器状态
                    sshCheck(sid);
                }

            }
        });
        return true;
    }
    else if (window.currentEditServerModel == "create") {
        delete serverConfig["id"];//新建服务器，没有id
        var data = JSON.stringify(serverConfig);
        jQuery.ajax({
            "url": createServerURL,
            "dataType": "jsonp",
            "data": {"host": data},
            "error": errorAjax,
            "beforeSend": start_load_pic,
            "complete": stop_load_pic,
            "success": function (data) {
                if (!responseCheck(data)) {
                    showErrorInfo(data.content);
                    return false;
                }
                else {
                    var sid = data.content;
                    var status = {"status": "checking", "content": ""};//为了显示在表格中为*符号
                    serverConfig["status"] = status;
                    serverConfig["password"] = "******";
                    serverConfig["sudo_password"] = "******";
                    serverConfig["su_password"] = "******";
                    serverConfig["keyfile_password"] = "******";//当有值的时候才显示为***，后端需要判断字符长度是否有密码
                    serverConfig["id"] = sid;
                    //把值加入内存记录中，避免了从网络加载
                    window.allServersList.push(serverConfig);
                    createServerLine(serverConfig);
                    showSuccessNotic();
                    //开启检查
                    sshCheck(sid);
                }
            }
        });
        return true;
    }
    else {
        showEditServerConfigTable("未知编辑模式")
        return false;
    }
}


function modifyServerConfigTable(serverConfig) {
    //修改表格中的数据值
    var td = $(window.currentEditTr).parent();//Tr是一个editbutton
    var tr = $(td).parent();
    $(tr).find(".ip")[0].textContent = serverConfig.ip;
    $(tr).find(".alias")[0].textContent = serverConfig.alias;
    $(tr).find(".owner")[0].textContent = serverConfig.owner;
    $(tr).find(".group")[0].textContent = serverConfig.group;
    $(tr).find(".username")[0].textContent = serverConfig.username;
    $(tr).find(".login_method")[0].textContent = serverConfig.login_method;
    $(tr).find(".password")[0].textContent = serverConfig.password;
    $(tr).find(".keyfile")[0].textContent = serverConfig.keyfile;
    $(tr).find(".keyfile_password")[0].textContent = serverConfig.keyfile_password;
    $(tr).find(".port")[0].textContent = serverConfig.port;
    $(tr).find(".sudo")[0].textContent = serverConfig.sudo;
    $(tr).find(".sudo_password")[0].textContent = serverConfig.sudo_password;
    $(tr).find(".su")[0].textContent = serverConfig.su;
    $(tr).find(".su_password")[0].textContent = serverConfig.su_password;
    $(tr).find(".description")[0].textContent = serverConfig.description;


}

function batchDeleteServersFromTbody() {
    //批量删除服务器，获取tbody中有plypyicon-check的类的元素
    var deleteButtonElements = [];
    $("#serversConfigTbody").find(".glyphicon-check").each(function () {
        //this是每一个复选框,也就是span标签
        //目标是把当前行的deleteButton按钮传递给删除函数deleteServerConfig,deleteButtonElements是[deleteButton1,deleteButton2]
        var td = $(this).parent();
        var tr = $(td).parent();
        var deleteButton = $(tr).find(".btn-danger")[0];
        deleteButtonElements.push(deleteButton);
    })
    deleteServerConfig(deleteButtonElements);//批量删除
}


function batchCreateServers(){
	//批量创建服务器
	var info="#首先，以'#'开头的都是注释，系统将不解析这样的行。\n#第二，每一个字段请使用空格分开区分。\n#第三,服务器字段格式为(如果该字段您不添加值，请使用'#'占位,登录方式为PASSWORD/KEY,su和sudo字段请填写Y/N):\n#IP 别名 主机组 用户名 登录方式 密码 秘钥 秘钥密码 端口 sudo sudo密码 su su密码 备注\n#192.168.1.1 测试主机 测试组 admin PASSWORD password-haha # # 22 N # N # 这里是备注信息"
	var textarea=document.getElementById("batchCreateServers");
	textarea.value=info;
}


function sendCreateServerRequest(){
    //获取批量数据发送到后端
    var textarea=document.getElementById("batchCreateServers").value;
    jQuery.ajax({
        "url":batchCreateServersURL,
        "type":"POST",
        "data":{"hosts":textarea},
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            var data=JSON.parse(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                var content=data.content;
                stopShadow();
                $("#batchServerDiv").hide("fast");
                //重新后台请求数据
                jQuery.ajax({
                    "url":loadServerListURL,
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
                            window.allServersList=data.content;//更新缓存配置
                            loadServersConfigTable();
                            showSuccessNotic(content);
                        }
                    }
                });

            }
        }

    });
}


function createServerAndDevice(){
    //创建连接列表
    var linkDevice=document.getElementById("linkDevice");
    $(linkDevice).children().remove();
    var t=window.allDeviceList;
    //console.log(t);
    t["CheungSSH自动化系统"]={"link":{"node":[{"name":"CheungSSH自动化系统","x":0,"y":0}],"edge":[],}};
    for( var name in t){
        var div=document.createElement("span");
        var check=document.createElement("span");
        check.className="glyphicon glyphicon-unchecked";
        check.style.cssText="margin-left:5px;cursor:pointer;";
        check.onclick=function(){
            if( $(this).hasClass("glyphicon-unchecked")    ){
                $(this).addClass("glyphicon-check").removeClass("glyphicon-unchecked");
            }
            else{
                $(this).addClass("glyphicon-unchecked").removeClass("glyphicon-check");
            }
        }

        var span=document.createElement("span");
        span.style.cssText="margin-left:3px;color:black";
        span.className="label label-defualt";
        span.textContent=name;

        div.appendChild(check)
        div.appendChild(span)

        linkDevice.appendChild(div);
    }
}





//初始化加载
$(function () {//c
    $( ".modal-content" ).draggable();//窗口拖动
    //批量创建
    document.getElementById("batchAddServers").onclick = function () {
		startShadow();
		$("#batchServerDiv").show("fast");
		batchCreateServers();
    }
    //加载服务器
    loadServersConfigTable();
    //绑定关闭编辑服务器按钮
    document.getElementById("closeEditServer").onclick = function () {
        closeEditServer();
    }
    //绑定编辑框中的各种事件
    changeServerDataButton();
    //绑定创建服务器
    document.getElementById("createServer").onclick = function () {
        window.currentEditServerModel = "create";//当前编辑模式是创建
        startShadow();
        showEditServerConfigTable();//显示服务器编辑框
    }
    //绑定保存服务器配置按钮
    document.getElementById("saveServerConfig").onclick = function () {

        if (getServerConfigFromTable()) {
            //获取编辑框中的值
            closeEditServer();//最后关闭编辑框
        }
    }
    //绑定批量删除服务器按钮
    document.getElementById("batchDeleteServers").onclick = function () {
        batchDeleteServersFromTbody();//批量删除服务器按钮
    }
    //悬停显示提示信息
    $("[data-toggle='tooltip']").tooltip();

    setInterval(function () {
        allSSHCheck();
    }, 600000)//十分钟一次，从服务器获取状态信息

    //绑定关闭显示检查服务器信息的按钮
    document.getElementById("closeCheckInfo").onclick=function(){
        $("#showServerCheckInfo").hide("fast");
        stopShadow();
    }
    createUserList();//默认加载用户列表到编辑框中
    createKeyFileList();//加载key清单到用户列表
	//绑定批量创建DIv
	document.getElementById("closeBatchDiv").onclick=function(){
		stopShadow();
		$("#batchServerDiv").hide("fast");
	}
	//最后批量穿件按钮
    document.getElementById("createServers").onclick=function(){
        sendCreateServerRequest();//发送数据到后端
    }

    createServerAndDevice();//加载设备连接列表


})




