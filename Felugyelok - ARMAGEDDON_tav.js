javascript: 
function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}
function tavrendez(bool){try{
	var prodtable=document.getElementById("forum_box").getElementsByTagName("table")[2].rows;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	for (var i=1;i<prodtable.length;i++){
		tavok[i-1]=parseFloat(prodtable[i].cells[0].innerText.split(" mezõ")[0]);
		sorok[i-1]=prodtable[i];
		indexek[i-1]=i-1;
	}
	for (var i=0;i<tavok.length;i++){
		var min=i;
		for (var j=i;j<tavok.length;j++){
			if (bool) {if (tavok[j]>tavok[min]) min=j;}
			else {if (tavok[j]<tavok[min]) min=j;}
		}
		var Ttemp=tavok[i];
		tavok[i]=tavok[min];
		tavok[min]=Ttemp;
		
		var Ttemp=indexek[i];
		indexek[i]=indexek[min];
		indexek[min]=Ttemp;
		
	}
	
	for (var i=prodtable.length-1;i>0;i--){
		document.getElementById("forum_box").getElementsByTagName("table")[2].deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++){
		document.getElementById("forum_box").getElementsByTagName("table")[2].appendChild(sorok[indexek[i]]);
	}
}catch(e){alert("Hiba rendezéskor:\n"+e);}}

try{
var alma=document.getElementById("forum_box").getElementsByTagName("table")[2].rows;
var kord=prompt("Mely falu(k)hoz viszonyítva szeretnél távolságot mérni?\n\nKoordináta szükséges.");

if (kord==null || kord=="") throw "Nem adtál meg semmit";
try{kord=kord.match(/[0-9]+(\|)[0-9]+/g); if (kord.length<1) throw "error"; }catch(e){throw "Érvénytelen koordináta megadás";}
	var min=-1; var temp=0; var minF="";
	for (var i=1;i<alma.length;i++){
		min=-1;
		try{JFalu=$.trim(alma[i].cells[0].innerText).match(/[0-9]+(\|)[0-9]+/g)[0].split("|");}catch(e){
			alma[i].cells[0].setAttribute("style","background-color: red");
			continue;
		}
		for (var j=0;j<kord.length;j++){
			temp=roundNumber(Math.abs(Math.sqrt(Math.pow(kord[j].split("|")[0]-JFalu[0],2)+Math.pow(kord[j].split("|")[1]-JFalu[1],2))),2);
			if (temp<min || min==-1) {min=temp; minF=kord[j];}
		}
		alma[i].cells[0].getElementsByTagName("a")[0].innerHTML=min+" mezõ - "+alma[i].cells[0].getElementsByTagName("a")[0].innerHTML;
		alma[i].cells[0].setAttribute("title",minF);
	}
}catch(e){alert("Hiba\n"+e);}
tavrendez(false);
void(0);