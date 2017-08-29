/**
 * Created by 张其川CheungSSH on 2016/12/17.
 */


function createDeviceLine(data){
    //创建表格行
    var tbody=document.getElementById("deviceTbody");
    var tr=document.createElement("tr");

    //设备名
    var td=document.createElement("td");
    td.textContent=data.name;
    tr.appendChild(td);

    //类型
    var td=document.createElement("td");
    if(data.type==="route"){
        td.textContent="路由器";
    }
    else if(data.type==="switch"){
        td.textContent="交换机";
    }
    else if(data.type==="firewall"){
        td.textContent="防火墙";
    }
    tr.appendChild(td);

    //时间
    var td=document.createElement("td");
    td.textContent=data.time;
    tr.appendChild(td);

    //用户
    var td=document.createElement("td");
    td.textContent=data.owner;
    tr.appendChild(td);

    //描述
    var td=document.createElement("td");
    td.textContent=data.description;
    tr.appendChild(td);

    //操作
    var td=document.createElement("td");
    //编辑
    var editButton=document.createElement("button");
    editButton.className="btn btn-info btn-xs glyphicon glyphicon-edit";
    td.appendChild(editButton);

    //删除
    var deleteButton=document.createElement("button");
    deleteButton.className="btn btn-danger btn-xs  glyphicon glyphicon-trash";
    deleteButton.style.marginLeft="3px";

    td.appendChild(deleteButton);


    tr.appendChild(td);
    tbody.appendChild(tr);
}


function addDevice(){
    var deviceName=document.getElementById("deviceName").value;
    var deviceType=document.getElementById("deviceType").value;
    var deviceDescription=document.getElementById("deviceDest").value;
    var deviceLink={"nodes":[{"name":deviceName,"x":0,"y":0}],"edge":[]};
    $("#linkDevice").find(".glyphicon-check").each(function(){
        var name=$(this).siblings()[0].textContent;
        deviceLink["edge"].push({"from":deviceName,"to":name});
    })


    if(/^ *$/.test(deviceName) ){
        $("#editDevice").effect("shake");
        return false;
    }

    var data={
        "name":deviceName,
        "type":deviceType,
        "description":deviceDescription,
        "link":deviceLink,
    }
    data=JSON.stringify(data);
    jQuery.ajax({
        "url":addDeviceURL,
        "data":{"device":data},
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
                createDeviceLine(data.content);
                showSuccessNotic();
                $("#editDevice").hide("fast");
                stopShadow();

            }
        }
    });





}

function createSection(){
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



function loadDeviceList(){
    jQuery.ajax({
        "url":getDeviceURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data)
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                //是{}
                var linkDevice=document.getElementById("linkDevice");
                for( var name in data.content){
                    createDeviceLine(data.content[name]);
                    var span=document.createElement("span")
                    span.className="label label-default";
                    span.textContent=name;
                    linkDevice.appendChild(span);
                }
                //显示设备列表
                window.allDeviceList=data.content;
                createSection();
            }
        }
    });
}




$(function(){
    document.getElementById("saveDevice").onclick=function(){
        addDevice();
    }
    document.getElementById("createDevice").onclick=function(){
        createSection();
        $("#editDevice").show("fast");
        startShadow();
    }
    document.getElementById("closeDevice").onclick=function(){
        stopShadow();
        $("#editDevice").hide("fast");
    }
    loadDeviceList();

})