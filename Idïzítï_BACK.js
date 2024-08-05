javascript:
PONTOS=1600; /*Ennyivel hamar�bb ind�tja a t�mad�st.*/
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
	if (Math.abs(otthoniido-serverido)>5000) alert("Vigy�zat!\nA szerver ideje, �s az �n oper�ci�s rendszer�nek ideje er�sen nem egyforma. A t�mad�s k�ld�se viszont az �n rendszer�nek idej�hez lesz m�rve.\n\nAz id�eltol�d�s:"+((otthoniido-serverido)/1000)+" mp, azaz "+(((otthoniido-serverido)/1000)/60)+" perc!");
	return;
}
function mod(){
	var a=uj=prompt("Ennyi millisecundummal (1000ms=1 m�sodperc) HAMAR�BB ind�tja a t�mad�st. Javasolt pr�bak�ld�seket v�gezni 0 k�sleltet�ssel, hogy megtudd mennyi id� a t�mad�st elk�ldeni.\n\n�j �rt�k?",PONTOS);
	a=a.replace(/\./g,"").replace(/-/g,"");
	if (isNaN(a)) alert("Ez nem sz�m"); else {
		document.getElementById("pontos").innerHTML=document.getElementById("pontos").innerHTML.replace(PONTOS,parseInt(a,10));
		PONTOS=parseInt(a,10);
	}
	return;
}
	var d=document;
	if(window.frames.length>0) d=window.main.document;
	url=d.URL;
	if (url.indexOf('try=confirm')==-1) {
		alert('Gy�lekez�helyen, t�mad�s/er�s�t�s leok�z�sa el�tt pr�b�ld...');
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
	if (tipusa=="Er�s�t�s") tipusa = "az er�s�t�s"; else tipusa = "a t�mad�s?";
	var BeIdo=prompt("Mikor �rkezzen "+tipusa+"?\n����.HH.NN. ��:PP:mp",jelenido.getFullYear()+"."+(jelenido.getMonth()+1)+"."+jelenido.getDate()+" "+jelenido.getHours()+":"+jelenido.getMinutes()+":"+jelenido.getSeconds());
		if (BeIdo==null) exit(0);
	var datum=BeIdo.match(/[0-9]+/g);
	for (i=0;i<6;i++){
		try{ datum[i]=datum[i].replace(/^0*/g,""); if(datum[i]=="") datum[i]=0; datum[i]=parseInt(datum[i]); 
			if (datum[i]<0) throw "Negat�v id�"; 
		} catch(e){alert("Hib�s id�megad�s.\n"+e); exit(0);}
	} if (datum[1]>12 || datum[2]>31 || datum[3]>23 || datum[4]>59 || datum[5]>59) {alert ("�rv�nytelen id�pontmegad�s"); exit(0);}
	var ADOTTIDO = new Date(datum[0],datum[1]-1,datum[2],datum[3],datum[4],datum[5],0);
	
	var ERKEZES = ADOTTIDO; ERKEZES.setHours(ERKEZES.getHours() - utazas2[0]); ERKEZES.setMinutes(ERKEZES.getMinutes() - utazas2[1]); ERKEZES.setSeconds(ERKEZES.getSeconds() - utazas2[2]);
	
	kieg=document.createElement("p"); 
	kieg.innerHTML="<img src=\"http://cncdani2.freeiz.com/pic/ora.png\"> Fel�lb�r�l�s:<br>cnc id�z�t� be�ll�tva erre:<br><b>" + BeIdo + "</b><br>Ind�t�s ideje: <blink>" + ERKEZES.getHours() + ":" + ERKEZES.getMinutes() + ":" + ERKEZES.getSeconds() + "</blink><br><p style='display:inline' id='pontos'>Pontos�t�s: "+PONTOS+"ms (<a href='javascript: mod();' style='font-size:80%; color: blue; text-decoration: none; border-bottom: 1px dashed black;'>M�dos�t�s</a>)</p>"; 
	document.getElementById("date_arrival").innerHTML="";
	document.getElementById("date_arrival").appendChild(kieg);
	
	var TikTak=setInterval("elkuld()",250);
	void(0);