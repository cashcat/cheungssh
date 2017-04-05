/**
 * Created by 张其川 on 2016/7/15.
 */



$(function(){

    document.getElementById("addApp").onclick=function(){
        $("#addAppDiv").show("fast");
    }
})


function appHTML(name,id){
    var div=document.createElement("div");
    div.setAttribute("id",id);//后台返回的app_id
    div.onclick=function(){
        alert(111);
    };
    div.style.cssText="width: 80px;height: 105px;float: left;margin-left:10px;";
    var divPic=document.createElement("div");
    divPic.style.cssText="width: 80px;height: 80px;border-radius: 15px;cursor: pointer";
    divPic.className="app";
    var divName=document.createElement("div");
    divName.style.cssText="width:80px;color: white;text-align: center;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;"
    divName.textContent=name;
    div.appendChild(divPic);
    div.appendChild(divName);
    return div;
}


function closeAppDiv(){
    $("#addAppDiv").hide("fast");
}
//APP关闭和创建按钮
$(function(){
    //关闭创建APP按钮
    document.getElementById("closeCreateApp").onclick=function(){
        closeAppDiv();
    }
    //创建APP按钮

    document.getElementById("createAppButton").onclick=function(){
        var name=document.getElementById("createAppName").value;
        var command=document.getElementById("createAppCommand").value;
        var owner=document.getElementById("appOwner").value;
        var data={"name":name,"command":command,"owner":owner};
        var app=document.getElementById("APP");
        //app.appendChild(appHTML(name));  //操作成功后，才显示
       // data=JSON.stringify(data);
        jQuery.ajax({
            "url":headURL+createAppURL,
            "data":data,
            "type":"POST",
            "success":function(data){
                responseCheck(data);
                data=JSON.parse(data);
                app.appendChild(appHTML(name,data.content));  //获取返回的app_id

            },
            "error":errorAjax,
            "beforeSend":start_load_pic,
            "complete":stop_load_pic
        });





        closeAppDiv();//关闭窗口
    }

})


//app归属
$(function(){
    var appOwner=document.getElementById("appOwner");
    for(var i=0;i<window.myUserList.length;i++){
        var username=window.myUserList[i];
        var option=document.createElement("option");
        option.setAttribute("value",username);
        option.textContent=username;
        if (username===window.whoami){
            option.setAttribute("selected","selected");
        }
        appOwner.appendChild(option);
    }

})



//初始化加载APP
$(function(){
    loadApp();

})

function loadApp(){
    jQuery.ajax({
        "url":loadAppURL,
        "type":"GET",
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            var app=document.getElementById("APP");
            var appIDS=data.content;   //[{}{}]
            for (var i=0;i<appIDS.length;i++){
                var appName=appIDS[i].app_name;
                var appID=appIDS[i].app_id;
                app.appendChild(appHTML(appName,appID));
            }

        }

    });
}