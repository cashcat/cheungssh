/**
 * Created by 张其川CheungSSH on 2016/11/26.
 */



function showCommandLogDetail(span){
    //span就是被点击的元素
    startShadow();
    $("#showCommanLogDetail").show("fast");
    var data=span.getAttribute("data");
    data=JSON.parse(data);
    console.log(data);
    //ip
    document.getElementById("showCommandLogIP").textContent=data.ip;
    //IP地址
    document.getElementById("showCommandLogIPLocate").textContent=data.ip_locate;
    //状态
    var span=document.createElement("span");
    if( data.status===true){
        //命令成功
        span.className="label label-success";
        span.textContent="成功";
    }
    else{
        span.className="label label-danger";
        span.textContent="失败";
    }
    $("#showCommandLogStatus").children().remove();//删除此前添加的HTML
    document.getElementById("showCommandLogStatus").appendChild(span);
    //命令
    document.getElementById("showCommandLogCommand").textContent=data.cmd;
    //用户
    document.getElementById("showCommandLogOwner").textContent=data.owner;
    //时间
    document.getElementById("showCommandLogTime").textContent=data.time;
    //服务器
    $("#showCommandLogServer").children().remove();//删除此前添加的HTML
    for(var i=0;i<data.alias.length;i++){
        var span=document.createElement("span");
        span.className="label label-default";
        span.style.float="left";
        span.style.marginTop="3px";
        if(i>0){
            //1个以上的服务器才用间隔
            span.style.marginLeft="3px";
        }
        span.textContent=data.alias[i];
        document.getElementById("showCommandLogServer").appendChild(span)
    }
    //详情
    document.getElementById("showCommandLogContent").innerHTML=data.content;








}

function createCommandLogLine(line){
    //创建表格的每一行
    var tbody=document.getElementById("showCommandLogTbody");
    var tr=document.createElement("tr");

    //IP
    td=document.createElement("td");
    td.textContent=line.ip;
    tr.appendChild(td);

    //IP归属
    td=document.createElement("td");
    td.textContent=line.ip_locate;
    tr.appendChild(td);
    //命令
    td=document.createElement("td");
    td.textContent=line.cmd;
    tr.appendChild(td);
    //状态
    td=document.createElement("td");
    var span=document.createElement("span");
    span.style.cursor="pointer";
    span.setAttribute("data",JSON.stringify(line));
    span.onclick=function(){
        showCommandLogDetail(this);
    }
    if(line.stage==="done"){
        //如果命令已经完成，则可以判命令执行的状态
        if(line.status==true){
            //执行成功
            span.className="label label-success";
            span.textContent="成功";
        }
        else{
            //命令执行失败
            span.className="label label-danger";
            span.textContent="失败";
        }
    }
    else{
        //在执行后中
        span.className="label label-warning";
        span.textContent="执行中";
    }
    td.appendChild(span);
    tr.appendChild(td);
    //用户
    td=document.createElement("td");
    td.textContent=line.owner;
    tr.appendChild(td);
    //时间
    td=document.createElement("td");
    td.textContent=line.time;
    tr.appendChild(td);



    tbody.appendChild(tr);

}

function loadCommandLog(){
    //加载所有日志记录
    jQuery.ajax({
        "url":commandLogURL,
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                var content=data.content;
                for(var i=0;i<content.length;i++){
                    var line=content[i];
                    createCommandLogLine(line);
                }
            }
        }
    });
}

$(function(){
    loadCommandLog();
    //绑定关闭日志详情按钮
    document.getElementById("closeCommandLogDetail").onclick=function(){
        $("#showCommanLogDetail").hide("fast");
        stopShadow();
    }
    //刷新按钮
    document.getElementById("refreshCommandLog").onclick=function(){
        loadCommandHistoryList();
    }
	    $(".modal-content").draggable();//窗口拖动

})
