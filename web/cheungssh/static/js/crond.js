/**
 * Created by 张其川 on 2016/7/17.
 */
function showTimeRange(){

    //分钟范围
    document.getElementById("minuteType").onchange=function(){
        var minuteRange=document.getElementById("minuteRange");
        if (this.value==2){
            minuteRange.style.display="block";  //如果值为2，则显示范围选项
        }
        else{
            minuteRange.style.display="none";  //如果值不为2，那么隐藏范围选项
        }
    }
    //小时范围
    document.getElementById("hourType").onchange=function(){
        var hourRange=document.getElementById("hourRange");
        if (this.value==2){
            hourRange.style.display="block";  //如果值为2，则显示范围选项
        }
        else{
            hourRange.style.display="none";  //如果值不为2，那么隐藏范围选项
        }
    }
    //日范围
    document.getElementById("dayType").onchange=function(){
        var dayRange=document.getElementById("dayRange");
        if (this.value==2){
            dayRange.style.display="block";  //如果值为2，则显示范围选项
        }
        else{
            dayRange.style.display="none";  //如果值不为2，那么隐藏范围选项
        }
    }
    //7月范围
    document.getElementById("monthType").onchange=function(){
        var monthRange=document.getElementById("monthRange");
        if (this.value==2){
            monthRange.style.display="block";  //如果值为2，则显示范围选项
        }
        else{
            monthRange.style.display="none";  //如果值不为2，那么隐藏范围选项
        }
    }

    //星期范围
    document.getElementById("weekType").onchange=function(){
        var weekRange=document.getElementById("weekRange");
        if (this.value==2){
            weekRange.style.display="block";  //如果值为2，则显示范围选项
        }
        else{
            weekRange.style.display="none";  //如果值不为2，那么隐藏范围选项
        }
    }



}


//动态的生成时间表

function createTimeTable(){
    //生成分钟时间表
    //指定分钟
    var minute=document.getElementById("minute");
    for (i=1;i<60;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"分钟";
        minute.appendChild(option);//加入section
    }
    //分钟范围
    var minuteRange=document.getElementById("minuteRange");
    for(var i=2;i<60;i++){//生成2-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"分钟";
        minuteRange.appendChild(option);//加入section

    }


    //小时表
    //指定小时

    var hour=document.getElementById("hour");
    for (i=1;i<24;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"小时";
        hour.appendChild(option);//加入section
    }

    //N小时范围
    var hourRange=document.getElementById("hourRange");
    for (i=1;i<24;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"小时";
        hourRange.appendChild(option);//加入section
    }

    //日表
    //指定日表
    var day=document.getElementById("day");
    for (i=2;i<32;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"日";
        day.appendChild(option);//加入section
    }
    //N日范围
    var dayRange=document.getElementById("dayRange");
    for (i=2;i<32;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"日";
        dayRange.appendChild(option);//加入section
    }

    //月表
    //指定月
    var month=document.getElementById("month");
    for (i=2;i<13;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"月";
        month.appendChild(option);//加入section
    }

    //N月范围

    var monthRange=document.getElementById("monthRange");
    for (i=2;i<13;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        option.textContent=i+"月";
        monthRange.appendChild(option);//加入section
    }


    //星期表
    //指定星期
    var week=document.getElementById("week");
    for (i=2;i<8;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        if(i==7){
            option.textContent="星期天";//星期天是用0表示
            option.setAttribute("value",0);  //给option设置一个value，同时设置显示值
        }
        else{
            option.textContent="星期" +i;
            option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        }
        week.appendChild(option);//加入section
    }
    //N星期范围
    var weekRange=document.getElementById("weekRange");
    for (i=2;i<8;i++){  //i从html文件的0开始,生成1-59的值
        var option=document.createElement("option"); //创建一个option标签
        if(i==7){
            option.textContent="星期天";//星期天是用0表示
            option.setAttribute("value",0);  //给option设置一个value，同时设置显示值
        }
        else{
            option.textContent="星期" +i;
            option.setAttribute("value",i);  //给option设置一个value，同时设置显示值
        }
        weekRange.appendChild(option);//加入section
    }




}


//绑定确认按钮


function commitCrond(){

    //获取分钟值
    var minuteType=document.getElementById("minuteType").value;
    var minuteValue="";
    var minute=document.getElementById("minute").value;
    if(minuteType==0){//每N分钟
        if (minute==0){   //特别处理在0分钟的时候等于1分钟
            minuteValue="*"+"/1"
        }

        else{
            minuteValue="*/"+minute;
        }
    }
    else if(minuteType==1){//在N分钟
        minuteValue=minute;
    }
    else{//N分钟范围
        var minuteRange=document.getElementById("minuteRange").value;
        minuteValue=minute+"-"+minuteRange;
    }


    //获取小时值
    var hourType=document.getElementById("hourType").value;
    var hourValue="";
    var hour=document.getElementById("hour").value;
    if(hourType==0){
        if (hour==0){   //特别处理在0分钟的时候等于1分钟
            hourValue="*"+"/1"
        }

        else{
            hourValue="*/"+minute;
        }
    }
    else if(hourType==1){
        hourValue=hour;
    }
    else{//N小时范围
        var hourRange=document.getElementById("hourRange").value;
        hourValue=hour+"-"+hourRange;
    }

    //获取日值
    var dayType=document.getElementById("dayType").value;
    var dayValue="";
    var day=document.getElementById("day").value;
    if(dayType==0){
        dayValue="*/" + day;
    }
    else if(dayType==1){
        dayValue=day;
    }
    else{//N范围
        var dayRange=document.getElementById("dayRange").value;
        dayValue=day+"-"+dayRange;
    }


    //获取月值
    var monthType=document.getElementById("monthType").value;
    var monthValue="";
    var month=document.getElementById("month").value;
    if(monthType==0){
        monthValue="*/" + month;
    }
    else if(monthType==1){
        monthValue=month;
    }
    else{//N范围
        var monthRange=document.getElementById("monthRange").value;
        monthValue=month+"-"+monthRange;
    }

    //获取星期值
    var weekType=document.getElementById("weekType").value;
    var weekValue="";
    var week=document.getElementById("week").value;
    if(weekType==0){
        weekValue="*/1";//每个星期  不管选择的是什么，都需要设置为*，这里应该优化一下，否则让人误会
    }
    else if(weekType==1){//每个星期N
        weekValue=week;
    }
    else{//N范围
        var weekRange=document.getElementById("weekRange").value;
        weekValue=week+"-"+weekRange;
    }

    window.linuxCrondTime=minuteValue +" " +hourValue+" "+dayValue+" "+monthValue+" "+weekValue;  //用于linux的crond格式

    var crondTimeList=[minuteValue,hourValue,dayValue,monthValue,weekValue]; //用来html显示
    var crondTr=document.getElementById("crondTr"); //获取显示时间内容的表格tr行
    for(var i=0;i<crondTimeList.length;i++){
        var td=document.createElement("td");
        td.textContent=crondTimeList[i];
        crondTr.appendChild(td);
    }

    document.getElementById("crondTable").style.display="none";
    document.getElementById("showCrondTable").style.display="block";



}


//关闭计划任务按钮
function closeCrond(){
    $("#crondTable").hide("fast");
    document.getElementById("shadow").style.display="none";//关闭阴影
    document.getElementById("CrondDiv").style.display="none";//command.html中的div需要关闭，初始是不显示，因为挡住了div层
}

//返回计划任务按钮
function backCrond(){
    document.getElementById("showCrondTable").style.display="none";
    document.getElementById("crondTable").style.display="block";
    $("#crondTr").children().remove();//当点击了返回按钮的时候，这里会重复的生成td，所以需要删除tr下生成的内容
    document.getElementById("CrondDiv").style.display="none";//command.html中的div需要关闭，初始是不显示，因为挡住了div层

}
//确认提交计划任务按钮
function confirmCrond(){
    var crondType="cmd";
    var command=document.getElementById("inputCommand").value;
    for(var i=0;i<window.currentSelectedServers.length;i++){
        var data={"id":window.currentSelectedServers[i],"cmd":command};
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":crondURL,
            "dataType":"jsonp",
            "data":{"type":crondType,"runtime":window.linuxCrondTime,"value":data},
            "error":errorAjax,
            "beforeSend":start_load_pic,
            "complete":stop_load_pic,
            "success":function(data){
                responseCheck(data);
                if(data.status==true){
                    showSuccessNotic();
                }
            }
        });
    }

    //关闭显示计划任务表
    $("#showCrondTable").hide("fast");
    document.getElementById("shadow").style.display="none";//关闭阴影
    document.getElementById("CrondDiv").style.display="none";//command.html中的div需要关闭，初始是不显示，因为挡住了div层
}

//初始化加载
$(function(){
    createTimeTable();//创建时间表
    showTimeRange();//给N范围绑定点击显示值
    document.getElementById("commitCrond").onclick=commitCrond;//绑定创建按钮
    document.getElementById("closeCrond").onclick=closeCrond;//绑定关闭计划任务框的按钮
    document.getElementById("backCrond").onclick=backCrond;  //给返回计划任务按钮绑定事件
    document.getElementById("confirmCrond").onclick=confirmCrond;//最后确认提交计划任务表

})