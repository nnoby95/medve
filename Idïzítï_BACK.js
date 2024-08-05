javascript:
PONTOS=1600; /*Ennyivel hamarább indítja a támadást.*/
function elkuld(){
	var CURRTIME=new Date();
	CURRTIME.setMilliseconds(CURRTIME.getMilliseconds()+PONTOS);
	if (ERKEZES - CURRTIME <= 0){
		d.forms[0].submit.click();
		clearInterval(TikTak);
		return;
	}
	return;
}
function checktimeshift(){
	var f_ora=document.getElementById("serverDate").innerHTML+" "+document.getElementById("serverTime").innerHTML;
	var f_datum=f_ora.match(/[0-9]+/g);
	var serverido = new Date(f_datum[2],f_datum[1]-1,f_datum[0],f_datum[3],f_datum[4],f_datum[5],0);
	var otthoniido= new Date();
	if (Math.abs(otthoniido-serverido)>5000) alert("Vigyázat!\nA szerver ideje, és az Ön operációs rendszerének ideje erõsen nem egyforma. A támadás küldése viszont az Ön rendszerének idejéhez lesz mérve.\n\nAz idõeltolódás:"+((otthoniido-serverido)/1000)+" mp, azaz "+(((otthoniido-serverido)/1000)/60)+" perc!");
	return;
}
function mod(){
	var a=uj=prompt("Ennyi millisecundummal (1000ms=1 másodperc) HAMARÁBB indítja a támadást. Javasolt próbaküldéseket végezni 0 késleltetéssel, hogy megtudd mennyi idõ a támadást elküldeni.\n\nÚj érték?",PONTOS);
	a=a.replace(/\./g,"").replace(/-/g,"");
	if (isNaN(a)) alert("Ez nem szám"); else {
		document.getElementById("pontos").innerHTML=document.getElementById("pontos").innerHTML.replace(PONTOS,parseInt(a,10));
		PONTOS=parseInt(a,10);
	}
	return;
}
	var d=document;
	if(window.frames.length>0) d=window.main.document;
	url=d.URL;
	if (url.indexOf('try=confirm')==-1) {
		alert('Gyülekezõhelyen, támadás/erõsítés leokézása elõtt próbáld...');
		exit(0);
	}
	
	var utazas=document.getElementById("content_value").innerHTML;
		patt=/(<td>)[0-9]+(:)[0-9]+(:)[0-9]+/g;
		utazas=utazas.match(patt)[0];
		var utazas2=utazas.match(/[0-9]+/g);
	
	var jelenido=document.getElementById("serverTime").innerHTML;
	var jd=document.getElementById("serverDate").innerHTML;
	jelenido=new Date(jd.split("/")[2],parseInt(jd.split("/")[1],10)-1,jd.split("/")[0],jelenido.split(":")[0],jelenido.split(":")[1],jelenido.split(":")[2],0);
	for (var i=0;i<utazas2.length;i++) utazas2[i]=parseInt(utazas2[i]);
	jelenido.setHours(jelenido.getHours() + utazas2[0]); jelenido.setMinutes(jelenido.getMinutes() + utazas2[1]); jelenido.setSeconds(jelenido.getSeconds() + utazas2[2]);
	
	try{checktimeshift();}catch(e){alert(e)}
	
	
	tipusa = document.getElementById("content_value").getElementsByTagName("h2")[0].innerHTML;
	if (tipusa=="Erõsítés") tipusa = "az erõsítés"; else tipusa = "a támadás?";
	var BeIdo=prompt("Mikor érkezzen "+tipusa+"?\nÉÉÉÉ.HH.NN. ÓÓ:PP:mp",jelenido.getFullYear()+"."+(jelenido.getMonth()+1)+"."+jelenido.getDate()+" "+jelenido.getHours()+":"+jelenido.getMinutes()+":"+jelenido.getSeconds());
		if (BeIdo==null) exit(0);
	var datum=BeIdo.match(/[0-9]+/g);
	for (i=0;i<6;i++){
		try{ datum[i]=datum[i].replace(/^0*/g,""); if(datum[i]=="") datum[i]=0; datum[i]=parseInt(datum[i]); 
			if (datum[i]<0) throw "Negatív idõ"; 
		} catch(e){alert("Hibás idõmegadás.\n"+e); exit(0);}
	} if (datum[1]>12 || datum[2]>31 || datum[3]>23 || datum[4]>59 || datum[5]>59) {alert ("Érvénytelen idõpontmegadás"); exit(0);}
	var ADOTTIDO = new Date(datum[0],datum[1]-1,datum[2],datum[3],datum[4],datum[5],0);
	
	var ERKEZES = ADOTTIDO; ERKEZES.setHours(ERKEZES.getHours() - utazas2[0]); ERKEZES.setMinutes(ERKEZES.getMinutes() - utazas2[1]); ERKEZES.setSeconds(ERKEZES.getSeconds() - utazas2[2]);
	
	kieg=document.createElement("p"); 
	kieg.innerHTML="<img src=\"http://cncdani2.freeiz.com/pic/ora.png\"> Felülbírálás:<br>cnc idõzítõ beállítva erre:<br><b>" + BeIdo + "</b><br>Indítás ideje: <blink>" + ERKEZES.getHours() + ":" + ERKEZES.getMinutes() + ":" + ERKEZES.getSeconds() + "</blink><br><p style='display:inline' id='pontos'>Pontosítás: "+PONTOS+"ms (<a href='javascript: mod();' style='font-size:80%; color: blue; text-decoration: none; border-bottom: 1px dashed black;'>Módosítás</a>)</p>"; 
	document.getElementById("date_arrival").innerHTML="";
	document.getElementById("date_arrival").appendChild(kieg);
	
	var TikTak=setInterval("elkuld()",250);
	void(0);