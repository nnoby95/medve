javascript:
/*Terv: tömbbe tárolja játékos-falu duplázásokat, és kategorizálva írja ki!*/
if (document.location.href.indexOf("mode=reservations_log")==-1) {alert("Foglalástervezõ Log-jába kell futtatni! A script kilép."); exit(0);}
if (document.location.href.indexOf("page=-1")==-1) {alert("Ajánlott az 'Összes' megjelenítését használni a script futtatásakor! A script futtatódik tovább..."); }
X=document.getElementById("ally_content").getElementsByTagName("table")[0].rows;

function indexOf2(ez){
	for (var k=0;k<tomb.length;k++){
		if (tomb[k].indexOf(ez)>-1) return k;
	}
	return -1;
}
try{
tomb=new Array();
document.getElementById("noblelog_filter").innerHTML="";
for (i=1;i<X.length-1;i++){
	dupla=false;
	if (X[i].cells[2].style.backgroundColor=="#FF0000" || X[i].cells[2].style.backgroundColor=="#FFFFFF") continue;
	if (X[i].cells[3].innerText=="Törölve") continue;
	vizsgal=$.trim(X[i].cells[1].innerText).match(/[0-9]+(\|)[0-9]+/g)[0];
	jatekos=$.trim(X[i].cells[2].innerText);
	for (j=i+1;j<X.length;j++){
		if ($.trim(X[j].cells[1].innerText).match(/[0-9]+(\|)[0-9]+/g)[0]==vizsgal){
			if ($.trim(X[j].cells[2].innerText)==jatekos){
				dupla=true;
				X[j].cells[2].style.backgroundColor="#FF0000";
				X[i].cells[2].style.backgroundColor="#FF0000";
			} else {
				X[i].cells[2].style.backgroundColor="#00F";
				X[j].cells[2].style.backgroundColor="#00F";
			}
		}
	}
	if (dupla) {
		/*document.getElementById("noblelog_filter").innerHTML+=X[i].cells[1].innerHTML+" ------- "+X[i].cells[2].innerHTML+" által duplázva<br>";*/
		ind=indexOf2(jatekos);
		if (ind==-1) tomb.push(jatekos+";"+$.trim(X[i].cells[1].innerText).match(/[0-9]+(\|)[0-9]+/g)[0]); else
					 tomb[ind]+=";"+$.trim(X[i].cells[1].innerText).match(/[0-9]+(\|)[0-9]+/g)[0];
		
	}/* else X[i].style.display="none";*/
}}catch(e){alert(e);}
for (i=0;i<tomb.length;i++){
	document.getElementById("noblelog_filter").innerHTML+=tomb[i].split(";")[0]+" duplázásai: ("+(tomb[i].split(";").length-1)+" db)<br>";
	for (j=1;j<tomb[i].split(";").length;j++){
		document.getElementById("noblelog_filter").innerHTML+=tomb[i].split(";")[j]+"<br>";
	}
	document.getElementById("noblelog_filter").innerHTML+="<br>";
}
document.getElementById("noblelog_filter").innerHTML+='<br>By c&cDAni2, made in <a href="http://muhely2.cncdani2.freeiz.com/">c&c workshop.</a>';
void(0);