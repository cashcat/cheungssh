$(function () {
        var sidebar = document.getElementById("sidebar");
        var ul = document.createElement("ul");
        ul.className = "sidebar-menu";

        for (var ii = 0; ii < menu.length; ii++) {

            var iSection = menu[ii];
            for (key in iSection) {
                var myClass = iSection[key]["class"];
                var myId = iSection[key]["id"];
                var isSubMenu = iSection[key]["subMenu"];


                //创建父级菜单
                var li = document.createElement("li");

                var a = document.createElement("a");
                a.style.color = "white";
                a.style.position = "relative";
                a.setAttribute("href", "#" + myId);
                a.setAttribute("id", myId);



                if (isSubMenu) {

                    li.className = "sub-menu";

                    jQuery1_8(a).toggle(
                        function () {
                            $(this).siblings("ul").slideDown("fast");
                            $(this).children(".showSwitch").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-down");
                        }, function () {
                            $(this).siblings("ul").slideUp("fast");
                            $(this).children(".showSwitch").removeClass("glyphicon-menu-down").addClass("glyphicon-menu-right");


                        }
                    );

                }


                var i = document.createElement("i");
                i.className = myClass;
                a.appendChild(i);
                var span = document.createElement("span");
                span.innerHTML = "&nbsp;" + key;
                span.style.fontWeight = "bold";
                a.appendChild(span);

                if (isSubMenu) {
                    //切换图标

                    var rightImg = document.createElement("i");
                    rightImg.className = "glyphicon glyphicon-menu-right showSwitch";
                    rightImg.style.float = "right";


                    a.appendChild(rightImg);

                }


                li.appendChild(a);


                //创建子菜单
                if (isSubMenu) {
                    var subUL = document.createElement("ul");
                    subUL.className = "sub";

                    for (subKey in isSubMenu) {
                        var subClass = isSubMenu[subKey]["class"];
                        var subId = isSubMenu[subKey]["id"];

                        var subLI = document.createElement("li");
                        subLI.style.background = "black";
                        subLI.setAttribute("id", subId);

                        var subA = document.createElement("a");
                        subA.setAttribute("href", "#" + subId);
                        //鼠标变色

                        var subI = document.createElement("i");
                        subI.style.color = "white";
                        subI.className = subClass;

                        var subSpan = document.createElement("span");
                        subSpan.innerHTML = "&nbsp;" + subKey;
                        subSpan.style.fontWeight = "bold";
                        subSpan.style.color = "white";
                        subSpan.style.letterSpacing = "2px";

                        subA.appendChild(subI);
                        subA.appendChild(subSpan);


                        subLI.appendChild(subA);
                        subUL.appendChild(subLI);


                        li.appendChild(subUL);
                    }
                }


                ul.appendChild(li);


            }


        }


        sidebar.appendChild(ul);


    }
)


$(function () {

    document.getElementById("showMenu").onclick=function(){
        var sidebar = document.getElementById("sidebar");
        var mainContent=document.getElementById("main-content");
        if(sidebar.style.display==="none"){
            //sidebar.style.display="block";
            $(sidebar).slideDown("fast");
            document.getElementById("showMainContent").style.left="90";
            document.getElementById("showMainContent").style.position="relative";
        }
        else{
           // sidebar.style.display="none";
            $(sidebar).slideUp("fast");
            document.getElementById("showMainContent").style.left="0px";
            document.getElementById("showMainContent").style.position="absolute";
        }

    }

})





