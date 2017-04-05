/**
 * Created by 张其川CheungSSH on 2016/12/13.
 */



var AtestData={
    nodes:[
        {"name":"中国","x":0,"y":0},
        {"name":"日本","x":0,"y":0},
        {"name":"美国","x":0,y:0},

    ],
    "edge":[
        {"from":"中国","to":"日本"},
        {"from":"中国","to":"美国"}
    ]
}


function createNetworkTopology(testData){
    var g=new Q.Graph("canvas");
	var menu=new Q.PopupMenu();
	g.popupmenu=menu;
	g.popupmenu.getMenuItems=function(g,data,evt){
		return [
			{
				text:"终端",
				action:function(){
					var node = g.getElementByMouseEvent(evt);
					 if(node.sid){
							 var sid=node.sid;
						 showCommandDiv(sid);
					}
					else{
						showErrorInfo("这不是一个服务器，没有终端可用！")
					}
				}
			},
			{
				"text":"主机资产",
				"action":function(){
					showErrorInfo("您当前版本不支持直接查看资产信息，请购买商业版本！");
				}
			},
		]
		        result.unshift(Q.PopupMenu.Separator);

	}
	
	
	g.ondblclick=function(e,g){
        var node = this.getElementByMouseEvent(e);
        if(node.sid){
            var sid=node.sid;
            showCommandDiv(sid);
        }

    }
    window.graph=g;

    var data={};
    for(var i=0;i<testData.nodes.length;i++){
        var ename=testData.nodes[i].name;
        //如果有私有配置，则使用私有配置，否则自动
        try{
            var x=window.myTopologyProfile[ename].x || 0;
        }
        catch(e){
            var x= 0;
		if (testData.nodes.length==2){
			x=i*100//两个的情况下，弹簧无效
		}
        }
        try{
            var y=window.myTopologyProfile[ename].y || 0;
        }
        catch(e){
            var y= 0;
		if (testData.nodes.length==2){
			y=i*100
		}
        }
        var t=g.createNode(ename,x,y);
        t.sid=testData.nodes[i].sid;

        if(testData.nodes[i].type==="route"){
            t.image = Q.Graphs.exchanger2;
        }
        if(testData.nodes[i].type==="switch"){
            t.image = Q.Graphs.exchanger;
        }
        if(testData.nodes[i].type==="firewall"){
           t.image = "../img/firewall.png";
        }
        if(testData.nodes[i].type==="cheungssh"){
            t.image = "../img/earth.jpg";
            t.size={"width":100};
        }
	//t.setStyle(Q.Styles.RENDER_COLOR, '#FF0000')设置颜色
	//主机状态
	if(testData.nodes[i].status==="failed"){
		t.setStyle(Q.Styles.RENDER_COLOR, '#FF0000')
	}

        var name=testData.nodes[i].name;
        data[name]=t;
    }

    for(var h=0;h<testData.edge.length;h++){
        try{
            var f=testData.edge[h].from;
            var t=testData.edge[h].to;
                var M=g.createEdge("",data[f],data[t]);//名字为空

        }
        catch(e){

            console.log(e);
        }
    }


    if(JSON.stringify(window.myTopologyProfile)=="{}"){//字典为空，使用弹簧
        //如果存在私有配置，则不使用弹簧，否则使用弹簧
        console.log('弹簧')
        var layouter = new Q.SpringLayouter(g);
        layouter.repulsion = 200;
        layouter.attractive = 0.5;
        layouter.elastic = 5;
        layouter.start();
    }
else{
	console.log("不是弹簧",window.myTopologyProfile)
}




}





