/**
 * Created by 张其川 on 2016/9/19.
 */




//画图函数

function assetHistoryChar(data, element, chartType) {


    var options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 0, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps: 50,

        //String - Animation easing effect
        animationEasing: "easeOutBounce",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

    }


    var canvas=document.createElement("canvas");  //因为要重复使用画图， 所以需要重建
    canvas.setAttribute("id","showAssetChar");
    var showAssetCharBody=document.getElementById("showAssetCharBody");  //获取canvas的上级元素
    var e = document.getElementById("showAssetChar").getContext('2d');
    showAssetCharBody.appendChild(canvas);   //把cavas加入文档
    var canvas=document.getElementById("showAssetChar");  //重新获取canvas

    var scrollWidth = document.body.scrollWidth;  //给canvas设置高度和宽度 ,自动获取
     var scrollHeight = document.body.scrollHeight * 0.8;
     canvas.style.width = scrollWidth + "px";
     canvas.style.height = scrollHeight + "px";


    if (chartType === "pie") {
        //画饼图
        new Chart(e).Pie(data, options);

    } else {
        //画折线图
        new Chart(e).Line(data, options);

    }


}


$(function () {
    loadAssetsConfData();
})


function loadAssetsConfData() {
    jQuery.ajax({
        "url": getAssetsConfURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!responseCheck(data)) {
                return false;
            }
            var content = data["content"];
            var tr = document.getElementById("assetsDataThead");
            var tbody = document.getElementById("assetsDataTbody");

            //读取资产条目
            //每一个服务器


            //读取表头
            window.assetsConf = [];//使用show的时候可能需要
            window.assetsConfName = [];//资产中文名
            var thead = document.getElementById("assetsDataThead");
            var th = document.createElement("th");
            th.textContent = "主机";   //第一个定死的主机名
            thead.appendChild(th);
            for (var asset in content) {
                //每一个资产类型
                var name = content[asset].name;
                var unit = content[asset].unit;
                window.assetsConf.push(asset);
                window.assetsConfName.push(name);
                var th = document.createElement("th");
                if (unit) {
                    th.innerText = name + "(" + unit + ")";  //有的资产类型没有单位
                }
                else {
                    th.innerText = name;
                }
                thead.appendChild(th);


            }
            //创建数据表
            loadAssetsData();


        }
    });
}

function loadAssetsData() {
    jQuery.ajax({
        "url": getCurrentAssetsDataURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!responseCheck(data)) {
                return false;
            }
            else {
                var content = data["content"];
                var tbody = document.getElementById("assetsDataTbody");
                for (var sid in content) {//这里是循环每一个服务器
                    var info = content[sid];
                    var alias = info.alias;
                    var assetsData = info["data"];
                    //开始循环一个服务器中的资产类型字段
                    var tr = document.createElement("tr");
                    //创建主机别名
                    var td = document.createElement("td");
                    td.style.cssText = "cursor:pointer;"; //定死的主机字段
                    td.setAttribute("sid", sid)
                    td.textContent = alias;
                    td.setAttribute("title","查看历史记录");
                    td.onclick = function () {
                        //访问自己的历史记录
                        var sid = this.getAttribute("sid");
                        loadHistoryAssetsData(sid);

                    }
                    tr.appendChild(td);
                    for (var i = 0; i < window.assetsConf.length; i++) {
                        //每一个资产字段
                        var asset = window.assetsConf[i];
                        var td = document.createElement("td");
                        if(!assetsData[asset]){
                            //有的服务器可能没有收集到这个字段
                            assetsData[asset]={"type":"string","value":"无数据"}
                        }
                        var assetType = assetsData[asset]["type"];
                        td.textContent = assetsData[asset].value;

                        td.setAttribute("sid", sid);
                        td.setAttribute("assetName", asset);
                        td.setAttribute("alias", alias);
                        td.setAttribute("assetChinaName", window.assetsConfName[i]);
                        //绑定数字类型的，可以做历史图
                        if (assetType === "number") {
                            td.style.cursor="pointer";
                            td.setAttribute("title","查看数据走势");
                            //绑定点击事件
                            td.onclick = function () {
                                var assetClassDataValue = [];//资产类的历史数据值
                                var assetClassDataTime = [];//资产类的历史数据时间
                                var sid = this.getAttribute("sid");
                                var assetName = this.getAttribute("assetName");
                                var alias = this.getAttribute("alias");
                                var assetChinaName = this.getAttribute("assetChinaName");
                                jQuery.ajax({
                                    "url": getHistoryAssetsDataURL,
                                    "dataType": "jsonp",
                                    "error": errorAjax,
                                    "beforeSend": start_load_pic,
                                    "complete": stop_load_pic,
                                    "success": function (data) {
                                        if (!responseCheck(data)) {
                                            return false;
                                        }
                                        else {
                                            var content = data.content;
                                            for (var i = 0; i < content.length; i++) {
                                                //每一条数据链
                                                var assets = content[i];
                                                assets = JSON.parse(assets);
                                                if (sid.toString() === assets["sid"].toString()) {
                                                    //找到了当前sid
                                                    if(!assets["data"][assetName]){
                                                        continue;//没有值就下一次循环
                                                    }
							console.log(assets["data"])
                                                    assetClassDataTime.push(assets["data"]["time"]["value"]);//获取时间
                                                    assetClassDataValue.push(assets["data"][assetName].value);//获取值
                                                }
                                            }
                                            document.getElementById("showAssetCharTitle").textContent = alias + "的" + assetChinaName + "历史走势"
                                            $("#showAssetParentDIV").slideDown("fast");
                                            //开发到了这里
                                            var assetsDataChar = {
                                                labels: assetClassDataTime,   //底部标签
                                                datasets: [
                                                    {
                                                        label: "测试消息使用",
                                                        fillColor: "rgba(220,220,220,0.2)",
                                                        strokeColor: "rgba(220,220,220,1)",
                                                        pointColor: "rgba(220,220,220,1)",
                                                        pointStrokeColor: "#fff",
                                                        pointHighlightFill: "#fff",
                                                        pointHighlightStroke: "rgba(220,220,220,1)",
                                                        data: assetClassDataValue  //X坐标轴刻度尺上的数据
                                                    },

                                                ]
                                            };
                                            assetHistoryChar(assetsDataChar, "showAssetChar", "line");
                                        }
                                    }
                                });
                            }
                        }
			else{
			td.setAttribute("title",assetsData[asset].value);
			}

                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);


                }
            }

        }
    });
}


//访问历史记录
function loadHistoryAssetsData(sid) {
    //sid是选中的服务器sid
    jQuery.ajax({
        "url": getHistoryAssetsDataURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!responseCheck(data)) {
                return false;
            }
            else {

                //首先创建表头
                var theadTr = document.getElementById("showHistoryAssetsTr");
                var tbody = document.getElementById("showHistoryAssetsTbody");
                for (var i = 0; i < window.assetsConfName.length; i++) {
                    var th = document.createElement("th");
                    th.textContent = window.assetsConfName[i];
                    theadTr.appendChild(th);

                }
                var content = data["content"];
                for (var i = 0; i < content.length; i++) {
                    //每一个服务器的资产信息，是一个string
                    var assets = JSON.parse(content[i]);  //一个服务器的全部资产项
                    if (sid.toString() === assets["sid"]) {
                        //筛选属于查询的服务器的资产
                        var alias = assets.alias;
                        var assetsData = assets["data"];//资产数据
                        var tr = document.createElement("tr");
                        for (var assetI = 0; assetI < window.assetsConf.length; assetI++) {
                            //每一个资产字段
                            var assetName = window.assetsConf[assetI];
                            var assetValue = assetsData[assetName];
                            if(!assetValue){
                                assetValue=""//新增的自定义资产， 那么在添加之前的是没有这个字段的，所以这里为空
                            }
                            else{
                                assetValue=assetValue.value;
                            }
                            var td = document.createElement("td");
                            td.textContent = assetValue;
			    td.setAttribute("title",assetValue);
                            tr.appendChild(td);
                        }
                        //把每一行的数据加入tbody
                        tbody.appendChild(tr);
                    }
                }
                //
                $("#showHistoryAssetsData").slideDown("fast"); //显示表
                document.getElementById("showHistoryAssetTitle").textContent = alias + "的历史资产记录"; //表名称


            }
        }
    });

}


function exportAssets(){
	jQuery.ajax({
		"url":getCurrentAssetsDataExportURL,
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"type":"get",
		"error":errorAjax,
		"success":function(data){
			responseCheck(data)
			if(!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var downloadURL=data.content;
				window.location.href=downloadURL;//下载返回的地址
			}
		}
	})

}
//关闭画图的函数

//初始化加载
$(function () {
    var t = document.getElementById("refreshAssets");
    t.onclick = function () {
        loadAssetsDataHTML();
    }




    //绑定关闭画图按钮
    document.getElementById("closeShowAssetChar").onclick = function () {
        $("#showAssetParentDIV").slideUp("fast");
        $("#showAssetChar").remove(); //删除canvas，因为这里的canvas是重复使用的，如果不删除，图形就会乱
    }

    //绑定关闭历史表按钮
    document.getElementById("closeShowHistoryAsset").onclick = function () {
        $("#showHistoryAssetsData").slideUp("fast");
        $("#showHistoryAssetsTr").children().remove(); //删除历史表头
        $("#showHistoryAssetsTbody").children().remove();
    }
	//绑定导出按钮
	document.getElementById("exportAssets").onclick=function(){
		exportAssets();
	}





})
