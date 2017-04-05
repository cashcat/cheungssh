/**
 * Created by 张其川 on 2016/8/3.
 */


function showDockerImageTable(content){
    var tbody=document.getElementById("dockerImageTbody");
    for(i in content){
        var tr=document.createElement("tr");
        //显示复选框
        var checkbox='<th style="color: black;cursor:pointer "> <i class=" glyphicon glyphicon-unchecked "></i> </th>';
        var td=document.createElement("td");
        td.innerHTML=checkbox;
        tr.appendChild(td);


        //显示每一行
        //显示每一个字段,服务器别名字段
        var td=document.createElement("td");
        td.textContent=content[i].alias;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,服务器别名字段
        var td=document.createElement("td");
        td.textContent=content[i].image;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,标签
        var td=document.createElement("td");
        td.textContent=content[i].tag;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,ID
        var td=document.createElement("td");
        td.textContent=content[i].image_id;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,创建时间
        var td=document.createElement("td");
        td.textContent=content[i].create_time;
        //把td加入行
        tr.appendChild(td);


        //显示每一个字段,空间
        var td=document.createElement("td");
        td.textContent=content[i].size;
        //把td加入行
        tr.appendChild(td);

        //显示每一个字段,发现时间
        var td=document.createElement("td");
        td.textContent=content[i].date;
        //把td加入行
        tr.appendChild(td);



        //删除单个镜像按钮
        var td=document.createElement("td");
        td.innerHTML='<button class="btn btn-danger" type="button" id=""><span class="glyphicon glyphicon-trash"></span></button>';
        tr.appendChild(td);

        //启动按钮
        var td=document.createElement("td");
        td.innerHTML='<button class="btn btn-success" type="button" id=""><span class="        glyphicon glyphicon-play-circle"></span></button>';
        tr.appendChild(td);

        //把tr加入tbody
        tbody.appendChild(tr);
    }

}



function loadDockerImageList(){
    jQuery.ajax({
        "url":dockerImageListURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(data.status){
                content=data.content;
                showDockerImageTable(content);
            }

        }

    });
}


//初始化加载
$(function(){

    loadDockerImageList();
    //绑定刷新按钮
    document.getElementById("refreshDockerImage").onclick=function(){
        loadDockerImageHTML();
    }

})