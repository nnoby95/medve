javascript: try{
var alma=document.forms[0].getElementsByTagName("table")[0].rows;
var kord="519|505 510|509 512|511";
kord=kord.match(/[0-9]+(\|)[0-9]+/g);
var dup=new Array();
for (var i=alma.length-1;i>0;i--){try{
	if (alma[i].cells[0].getElementsByTagName("img")[0].src.indexOf("closed")==-1){
		cutt=$.trim(alma[i].cells[0].innerText.match(/[0-9]+(\|)[0-9]+/g)[0]);
		if (dup.indexOf(cutt)>-1) {
			alma[i].cells[0].getElementsByTagName("input")[0].checked=true; 
			alma[i].cells[0].setAttribute("style","background-color: blue");
		} else dup.push(cutt);
		if (kord.indexOf(cutt)==-1){
			alma[i].cells[0].setAttribute("style","background-color: red");
			alma[i].cells[0].getElementsByTagName("input")[0].checked=true;
		}
	}
}catch(e){}}
}catch(e){alert(e);}
void(0);