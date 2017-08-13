

function getMiddleWareInfo(){
	jQuery.ajax({
		"url":getMiddleWareInfoURL,
		"dataType":"jsonp",
		"type":"get",
		"error":errorAjax,
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"success":function(data){
			responseCheck(data);
			if (!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				$("#oracleTbody").children().remove();
				var content=data.content;
				var tbody=document.getElementById("oracleTbody");
				for( sid in content){
					if(content[sid].status){
						var oracle=content[sid].content.oracle;//list
						var tr=document.createElement("tr");
						for(var i=0;i<oracle.length;i++){
							var line=oracle[i]
							var td=document.createElement('td');
							td.textContent=line.alias;
							tr.appendChild(td);

							var td=document.createElement('td');
							td.textContent=line.path;
							tr.appendChild(td);
							var td=document.createElement('td');
							td.textContent=line.version;
							tr.appendChild(td);
							var td=document.createElement('td');
							td.textContent=line.run_time;
							tr.appendChild(td);
							var td=document.createElement('td');
							td.textContent=line.username;
							tr.appendChild(td);
							var td=document.createElement('td');
							td.textContent=line.collect_time;
							tr.appendChild(td);
						}
						tbody.appendChild(tr)
					}
					else{
						//有错误，忽略
						continue
					}
				}
			}
		},
})
}


$(function(){
	document.getElementById("reloadOracle").onclick=function(){
	getMiddleWareInfo()
}
	getMiddleWareInfo()
})
