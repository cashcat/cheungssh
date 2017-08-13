/**
 * Created by 张其川 on 2016/7/20.
 */


function  loadCustomAssetsList(){
    var tbody=document.getElementById("showCustomAssetClassListTable");
    jQuery.ajax({
        "url":loadCustomAssetsOptionURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
		if(! data.status){
			showErrorInfo(data.content);
			return false;
		}
            var content=data.content;
            for (id in content){
                var assetID=id;
                var assetName=content[id]["name"];
                var assetUnit=content[id]["unit"];
                var assetDataType=content[id]["type"];
                var assetCommand=content[id]["command"];
                var assetType=content[id]["asset_type"];
                var value=content[id]["value"];
                console.log(assetType)


                var tr=document.createElement("tr");
                /*
                var td=document.createElement("td");
                td.className="ID";
                td.textContent=assetID;
                td.style.display="none";//不显示ID
                tr.appendChild(td);
                */

                //名称
                var td=document.createElement("td");
                td.className="assetName";
                td.textContent=assetName;
                tr.appendChild(td);

                //单位
                var td=document.createElement("td");
                td.className="assetUnit";
                td.textContent=assetUnit;
                tr.appendChild(td);

                //数据类型
                var td=document.createElement("td");
                td.className="assetDataType";
                td.setAttribute("dataType",assetDataType);
                if (assetDataType==="string"){
                    td.textContent="字符";
                }
                else if(assetDataType==="date"){
                    td.textContent="日期";
                }
                else if(assetDataType==="number"){
                    td.textContent="数字";
                }
                tr.appendChild(td);



                if(assetType=="static"){
                    //资产类型
                    var td=document.createElement("td");
                    td.className="assetType";
                    td.textContent="静态";
                    tr.appendChild(td);
                    //没有命令
                    var td=document.createElement("td");
                    td.className="assetCommand";
                    td.textContent="";
                    tr.appendChild(td);
                    //静态固定值
                    var td=document.createElement("td");
                    td.className="value";
                    td.textContent=value;
                    tr.appendChild(td);

                }
                else{
                    //资产类型
                    var td=document.createElement("td");
                    td.className="assetType";
                    td.textContent="动态";
                    tr.appendChild(td);
                    //命令 ，动态，没有静态
                    var td=document.createElement("td");
                    td.className="assetCommand";
                    td.textContent=assetCommand;
                    tr.appendChild(td);
                    //静态固定值
                    var td=document.createElement("td");
                    td.className="value";
                    td.textContent="";
                    tr.appendChild(td);
                }

                //操作按钮
                var td=document.createElement("td");
                var successButton=document.createElement("button");
                successButton.setAttribute("id",assetID);
                successButton.onclick=function(){window.assetAction="modify";editAssetTable(this)};
                successButton.className="btn btn-success  glyphicon glyphicon-edit  btn-xs";
                var deleteButton=document.createElement("button");
                deleteButton.setAttribute("id",assetID);
                deleteButton.onclick=function(){deleteAssetTable(this)};
                deleteButton.className="btn btn-danger  glyphicon glyphicon-trash btn-xs";
		deleteButton.style.cssText="margin-left:3px;";
                td.appendChild(successButton);
                td.appendChild(deleteButton);
                tr.appendChild(td);

                tbody.appendChild(tr);
                //把一行加入tbody


            }



        }
    });
}




function editAssetTable(team){
    //在编辑框中
    document.getElementById("shadow").style.display="block";//阴影
    //team是一个button
    //从数据表格中读取原始数据
    var td=$(team).parent();
    var assetID=team.getAttribute("id");
    var assetName=$(td).siblings(".assetName")[0].textContent;
    var assetUnit=$(td).siblings(".assetUnit")[0].textContent;
    var assetDataType=$(td).siblings(".assetDataType")[0].getAttribute("dataType");
    var assetType=$(td).siblings(".assetType")[0].textContent;
    var value=    $(td).siblings(".value")[0].textContent;
    var assetCommand=$(td).siblings(".assetCommand")[0].textContent;

    //判断文字
    if(assetType=="静态"){
        assetType="static";
        //判断资产类型，然后在加载数据表的时候，才能准确判断
        document.getElementById("assetStaticCommandDIV").style.display="none";//隐藏命令输入框
        document.getElementById("assetStaticValueDIV").style.display="";//显示静态输入框
    }
    else{
        assetType="dynamic";
        document.getElementById("assetStaticValueDIV").style.display="none";//隐藏静态输入框
        document.getElementById("assetStaticCommandDIV").style.display="";//显示命令输入框
    }

    //把数据加载到编辑框

    //加载名称
    var editAssetName=document.getElementById("assetName");
    editAssetName.value=assetName;
    //加载单位
    var editAssetUnit=document.getElementById("assetUnit");
    editAssetUnit.value=assetUnit;
    //加载数据类型
    var editAssetDataType=document.getElementById("assetDataType");
    editAssetDataType.value=assetDataType;
    //资产类型
    var editAssetType=document.getElementById("assetType");
    editAssetType.value=assetType;

    //加载命令
    var editAssetCommand=document.getElementById("assetCommand");
    editAssetCommand.value=assetCommand;
    //静态资产值
    var assetStaticValue=document.getElementById("value");
    assetStaticValue.value=value;
    //ID
    /*
    var editAssetID=document.getElementById("assetID");
    editAssetID.textContent=assetID;
*/

    $("#editAssetDiv").show("fast");
    window.currentEditAssetButton=team;
}

function cleanAssetTable() {
    //在新增的时候需要清除编辑表格的数据
    document.getElementById("assetName").value="";
    //加载单位
    document.getElementById("assetUnit").value="";
    //加载数据类型
    document.getElementById("assetDataType").value="string";
    //加载命令
    document.getElementById("assetCommand").value="";
    document.getElementById("value").value="";
}

function deleteAssetTable(team){
    //team是一个删除按钮
    var td=$(team).parent();//获取的父元素是td
    var tr=$(td).parent();//获取tr行
    var assetID=team.getAttribute("id");


    id=[assetID];
    id=JSON.stringify(id);
    jQuery.ajax({
        "url":deleteAssetURL,
        "data":{"assets":id},
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if(data.status){
                showSuccessNotic();
                $(tr).remove();
            }
        }
    });


}

function createAssetOption(){
    //点击新增按钮
    showErrorInfo("该功能已经升级，为了确保实用性，您需要经过作者的指导后才能自定义添加资产项");
    return false;
    cleanAssetTable();//清除编辑表格产生的数据
    $("#editAssetDiv").show("fast");
}

function updateAssetTable(){
    //获取ID，如果没有ID，则不传递ID，就是新建，否则是更新
    var assetName=document.getElementById("assetName").value;
    //加载单位
    var assetUnit=document.getElementById("assetUnit").value;
    //加载数据类型
    var assetDataType = document.getElementById("assetDataType").value;
    //资产类型
    var assetType=document.getElementById("assetType").value;
    //加载命令
    var assetCommand= document.getElementById("assetCommand").value;
    //静态值
    var value= document.getElementById("value").value;
    if(assetName.match(/^ *$/)){
        //检查资产名称，除了资产名称外，其余的不是必填
        showErrorInfo("资产名称必填 !");
        return false;
    }
    //修改资产值
    if (assetType=="dynamic"){
        //如果资产类型是动态命令，就把资产值修改为空，并且把显示的dynamic修改为中文
            value="";
    }
    else{
        assetCommand="";
    }
    var data={
        "name":assetName,
        "unit":assetUnit,
        "type":assetDataType,
        "command":assetCommand,
        "id":"",
        "asset_type":assetType,
        "value":value,
    }
    if(window.assetAction=="create"){
        delete data["id"];
    }
    else{
        var assetID=window.currentEditAssetButton.getAttribute("id")
        data["id"]=assetID;
    }







    sourceData=data;
    data=JSON.stringify(data)
    jQuery.ajax({
        "url":customCreateAssetURL,
        "error":errorAjax,
        "dataType":"jsonp",
        "data":{"asset":data},
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            responseCheck(data);
            if (data.status){
                showSuccessNotic();
            }
            if (window.assetAction==="create"){
                var assetID=data.content;
                var tbody=document.getElementById("showCustomAssetClassListTable");
                var tr=document.createElement("tr");
                //ID

                /*
                var td=document.createElement("td");
                td.className="ID";
                td.textContent=assetID;
                td.style.display="none";//不显示ID
                tr.appendChild(td);
                */

                //名称
                var td=document.createElement("td");
                td.className="assetName";
                td.textContent=sourceData["name"];
                tr.appendChild(td);

                //单位
                var td=document.createElement("td");
                td.className="assetUnit";
                td.textContent=sourceData["unit"];
                tr.appendChild(td);

                //数据类型
                var td=document.createElement("td");
                td.className="assetDataType";
                td.setAttribute("dataType",sourceData["type"]);
                if (sourceData["type"]==="string"){
                    td.textContent="字符";
                }
                else if(sourceData["type"]==="date"){
                    td.textContent="日期";
                }
                else if(sourceData["type"]==="number"){
                    td.textContent="数字";
                }
                else{
                    td.textContent="未知类型";

                }
                tr.appendChild(td);
                //资产类型
                var td=document.createElement("td");
                td.className="assetType";
                if (sourceData["asset_type"]=="static"){
                    td.textContent="静态"
                }
                else{
                    td.textContent="动态"
                }
                tr.appendChild(td);
                //命令
                var td=document.createElement("td");
                td.className="assetCommand";
                td.textContent=sourceData["command"];
                tr.appendChild(td);
                //静态值

                var td=document.createElement("td");
                td.className="value";
                td.textContent=sourceData["value"];
                tr.appendChild(td);


                //操作按钮
                //修改按钮
                var td=document.createElement("td");
                var successButton=document.createElement("button");
                successButton.setAttribute("id",assetID);
                successButton.onclick=function(){window.assetAction="modify";editAssetTable(this)};
                successButton.className="btn btn-success  glyphicon glyphicon-edit  btn-xs";
                //删除按钮
                var deleteButton=document.createElement("button");
                deleteButton.setAttribute("id",assetID);
                deleteButton.onclick=function(){deleteAssetTable(this)};
                deleteButton.className="btn btn-danger  glyphicon glyphicon-trash btn-xs";
		deleteButton.style.marginLeft="3px";
                td.appendChild(successButton);
                td.appendChild(deleteButton);
                tr.appendChild(td);

                tbody.appendChild(tr);


            }
            else if(window.assetAction==="modify"){
                //这里直接更新html页面的值，不load页面了
                var td=$(window.currentEditAssetButton).parent()//获取编辑按钮的父元素td
                //处理资产名
                $(td).siblings(".assetName")[0].textContent=sourceData.name;
                $(td).siblings(".assetUnit")[0].textContent=sourceData.unit;
                //判断一下数据的类型，用中文显示
                if(sourceData.assetDataType==="string"){
                    //数据是字符串的形式
                    $(td).siblings(".assetDataType")[0].textContent="字符";
                }
                else if(sourceData.assetDataType==="number"){
                    //数据类型是数字类型
                    $(td).siblings(".assetDataType")[0].textContent="数字";
                }
                else if(sourceData.assetDataType==="date"){
                    //数据类型是日期
                    $(td).siblings(".assetDataType")[0].textContent="日期";
                }

                //判断资产类型
                if(sourceData["asset_type"]=="dynamic"){
                    //资产类型
                    $(td).siblings(".assetType")[0].textContent="动态";
                }
                else{
                    //资产类型
                    $(td).siblings(".assetType")[0].textContent="静态";
                }

                //处理的是命令
                $(td).siblings(".assetCommand")[0].textContent=sourceData.command;
                //静态资产值
                $(td).siblings(".value")[0].textContent=sourceData["value"];


            }

        }
    })
}

//初始化加载
$(function(){
    //绑定新增资产类按钮,由于上面删除了新增按钮，设置在最后的一行，所以这里不能用onclick，在cheungssh中强制加载绑定document

    //绑定资产删除按钮
    //给编辑按钮绑定事件

   // loadCustomAssetsOption();
    //给关闭按钮绑定事件
    document.getElementById("closeAssetButton").onclick=function(){
        $("#editAssetDiv").hide("fast");
        document.getElementById("shadow").style.display="none";
    }
    loadCustomAssetsList();
    //给创建资产按钮绑定点击事件
    document.getElementById("createAssetOptionButton").onclick=function(){
        //指定创建/修改资产的动作类型
        window.assetAction="create";
        createAssetOption();
    }
    //给资产创建/更新按钮绑定点击事件
    document.getElementById("updateAsset").onclick=function(){
        $("#editAssetDiv").hide("fast");
        updateAssetTable();//点击保存按钮后，触发该函数更新服务器数据
    }
    //绑定刷新按钮
    document.getElementById("flushCustomAssets").onclick=function(){
        loadAssetSettings();
    }

    //绑定选定的资产类型的按钮
    document.getElementById("assetType").onchange=function(){
        if(this.value==="static"){
            document.getElementById("assetStaticCommandDIV").style.display="none";//隐藏命令输入框
            document.getElementById("assetStaticValueDIV").style.display="";//显示静态输入框
        }
        else{
            document.getElementById("assetStaticValueDIV").style.display="none";//隐藏静态输入框
            document.getElementById("assetStaticCommandDIV").style.display="";//显示命令输入框

        }
    }
    $( ".modal-content" ).draggable();//窗口拖动




})
