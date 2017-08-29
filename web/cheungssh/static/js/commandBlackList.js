/**
 * Created by 张其川 on 2016/7/19.
 */




function deleteCommandBlack(team) {

    var tr = $(team).parent()//当前行
    var td = tr.children(".ID")[0];
    id = td.textContent;//
    jQuery.ajax({
        "url": deleteCommandBlackURL,
        "dataType": "jsonp",
        "data": {"id": id},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                showErrorInfo(data.content);
            }
            else {
                $(tr).remove();//删除行
                showSuccessNotic();
            }
        }
    });
}

function loadCommandBlackList() {
    jQuery.ajax({
        "url": commandBlackListURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            var content = data.content;  //是一个list
            var tbody = document.getElementById("showCommandBlackListTbody");
            for (var i = 0; i < content.length; i++) {
                var line = content[i];
                line = JSON.parse(line);
                console.log(line.id);
                var tr = document.createElement("tr");
                //ID
                var td = document.createElement("td");
                td.className = "ID";
                td.textContent = line.id;//写入IP ，绑定一个ID类
                td.style.display = "none";
                tr.appendChild(td);

                //IP归属地
                var td = document.createElement("td");
                td.textContent = line.ip;
                tr.appendChild(td);

                //IP
                var td = document.createElement("td");
                td.textContent = line.ip_locate;//写入
                tr.appendChild(td);
                //命令
                var td = document.createElement("td");
                td.textContent = line.cmd;//
                tr.appendChild(td);
                //创建时间
                var td = document.createElement("td");
                td.textContent = line.time;
                tr.appendChild(td);
                //归属用户
                var td = document.createElement("td");
                td.textContent = line.owner;//写入IP ，绑定一个ID类
                tr.appendChild(td);

                //删除按钮


                var trashButtonHTML = '<button class="btn btn-danger btn-xs" type="button"><span class="glyphicon glyphicon-trash"></span></button>'
                var td = document.createElement("td");
                td.onclick = function () {
                    //绑定删除计划任务按钮
                    deleteCommandBlack(this);
                }
                td.innerHTML = trashButtonHTML;
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        }
    });

}
function addCommandBlack(team) {
    var command = team.value;
    team.value = "";
    jQuery.ajax({
        "url": addCommandBlackURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "data": {"cmd": command},
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            responseCheck(data);
            if (data.status == true) {
                showSuccessNotic();
            }
            loadCommandBlackHTML();
        }
    });


}

//初始化
$(function () {

    loadCommandBlackList();
    //绑定黑名单命令输入框
    document.getElementById("inputCommandBlack").onkeyup = function () {
        if (event.keyCode === 13) {//回车
            addCommandBlack(this);
        }
    }
    //绑定命令添加
    document.getElementById("addCommand").onclick = function () {
        var input = document.getElementById("inputCommandBlack");
        addCommandBlack(input);
    }
    //刷新按钮
    document.getElementById("refreshCommandBlackList").onclick=function(){
        loadCommandBlackHTML();
    }
})
