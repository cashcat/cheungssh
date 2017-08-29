/**
 * Created by 张其川 on 2016/7/20.
 */



function loadCommandHistoryLog(){
    jQuery.ajax({
        "url":commandHistoryURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);

        }
    });
}


//初始化加载
$(function(){
    $(".modal-content").draggable();//窗口拖动

})
