/**
 * Created by 张其川 on 2016/7/5.
 */
$(function(){


    $("#auptime").on({
        touchstart: function(e){
            timeOutEvent = setTimeout("longPress()",500);
            e.preventDefault();
        },
        touchmove: function(){
            clearTimeout(timeOutEvent);
            timeOutEvent = 0;
        },
        touchend: function(){
            clearTimeout(timeOutEvent);
            if(timeOutEvent!=0){
                //this是一个javascript
                //alert("你这是点击，不是长按");
                removeAPP(this);

            }
            return false;
        }
    })



    //多个元素
    $("#cpud").on({
        touchstart: function(e){
            timeOutEvent = setTimeout("longPress()",500);
            e.preventDefault();
        },
        touchmove: function(){
            clearTimeout(timeOutEvent);
            timeOutEvent = 0;
        },
        touchend: function(){
            clearTimeout(timeOutEvent);
            if(timeOutEvent!=0){
                //alert("你这是点击，不是长按");
                removeAPP(this);
            }
            return false;
        }
    })


});


function longPress(){
    timeOutEvent = 0;
    var shadow=document.getElementById("showMainContent");
    shadow.style.background="rgba(0,0,0,0.4)";
    shadow.onclick=function(){
        this.style.background="";
        this.onclick=null;  //删除背影的点击事件
    }
    //显示删除图标
    //var removePic=$(this).parent().nodeName;
    //alert(removePic);
    console.log(team);
    //removePic.css({"display":"block"});



}
