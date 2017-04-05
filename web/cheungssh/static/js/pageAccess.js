/**
 * Created by 张其川CheungSSH on 2016/11/29.
 */



function createTableLine(data) {
    console.log(data);
    // 创建每一行
    var tbody = document.getElementById("pageAccessTobody");
    var tr = document.createElement("tr");
    //页面
    var td = document.createElement("td");
    td.textContent = data.page;
    tr.appendChild(td);
    //时间
    var td = document.createElement("td");
    td.textContent = data.time;
    tr.appendChild(td);
    //IP
    var td = document.createElement("td");
    td.textContent = data.ip;
    tr.appendChild(td);
    //地区
    var td = document.createElement("td");
    td.textContent = data.ip_locate;
    tr.appendChild(td);
    //用户
    var td = document.createElement("td");
    td.textContent = data.username;
    tr.appendChild(td);
    //详情
    
    var td = document.createElement("td");
    var span = document.createElement("span");
    span.className = " btn btn-info btn-xs glyphicon glyphicon-eye-open";
    span.onclick = function (){
        showErrorInfo("您的当前版本不支持查看请求详情，请购买商业版本！");
        return false;
    }
    //td.appendChild(span);
   // tr.appendChild(td);

    tbody.appendChild(tr);


}

function loadPageAccess() {
    jQuery.ajax({
        "url": getPageAccessURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "error": errorAjax,
        "success": function (data) {
            responseCheck(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var content = data.content;
                for (var i = 0; i < content.length; i++) {
                    var line = content[i];
                    createTableLine(line);
                }
            }
        }
    });
}

$(function () {
    loadPageAccess();
})
