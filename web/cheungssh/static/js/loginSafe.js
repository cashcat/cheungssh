/**
 * Created by 张其川 on 2016/7/20.
 */



function deleteIPLimitList(team){
    var tr=$(team).parent()//当前行
    var td=tr.children(".IP")[0];
    var ip=td.textContent;
    jQuery.ajax({
        "url":deleteIPLimitURL,
        "dataType":"jsonp",
        "data":{"ip":ip},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(data.status==true){
                showSuccessNotic();
            }
            $(tr).remove();//删除行
		showSuccessNotic()
            //不需要重新加载页面


        }
    });
}
function  loadIPLimitList(){
    jQuery.ajax({
        "url":showIPLimitList,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            var content=data.content;
            var showIPLimitThresholdTbody=document.getElementById("showLoginLimit");
            for(var i=0;i<content.length;i++){
                var tr=document.createElement("tr");

                //ip，删除按钮根据IP类删除
                var td=document.createElement("td");
                td.textContent=content[i].ip;
                td.className="IP";
                tr.appendChild(td);
                //ip归属地
                var td=document.createElement("td");
                td.textContent=content[i]["ip-locate"];
                tr.appendChild(td);
                //状态
                var td=document.createElement("td");
                var status=content[i]["status"];
                var span=document.createElement("span");
                span.textContent=status;
                if(status==="已锁定"){
                    span.className="label label-danger";
                }
                else{
                    span.className="label label-success";

                }
                td.appendChild(span);
                tr.appendChild(td);
                //次数
                var td=document.createElement("td");
                td.textContent=content[i].time;
                tr.appendChild(td);
                //操作
                var trashButtonHTML='<button class="btn btn-danger btn-xs" type="button"><span class="glyphicon glyphicon-trash"></span></button>'
                var td=document.createElement("td");
                td.onclick=function(){
                    //绑定删除计划任务按钮
                    deleteIPLimitList(this);
                }
                td.innerHTML=trashButtonHTML;
                tr.appendChild(td);
                showIPLimitThresholdTbody.appendChild(tr);

            }

        }
    });
}


function modifyIPLimit(){
    //修改登录阈值
    var limit=document.getElementById("ipLimitThreshold").value;
    jQuery.ajax({
        "url":modifyLimitThresholdURL,
        "dataType":"jsonp",
        "data":{"limit":limit},
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function (data) {
            responseCheck(data);
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
            }

        }
    });

}



function loadIPLimitThreshold(){
    jQuery.ajax({
        "url":ipLimitThresholdURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            var limit=parseInt(data.content);
            var showIPLimitThreshold=document.getElementById("ipLimitThreshold");
            showIPLimitThreshold.value=limit;//输入框显示默认的后台设定的限制阈值


        }
    });
}

//初始化
$(function(){
    loadIPLimitThreshold();//加载系统设定的阈值
    loadIPLimitList();//加载黑名单IP列表
    document.getElementById("ipLimitThreshold").onkeyup=function(){
        if(event.keyCode==13){
            modifyIPLimit();
        }

    }
  document.getElementById("setIpLimit").onclick=function(){
	modifyIPLimit();
	}
})
