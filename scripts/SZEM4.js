function stop(){
	var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);
}
stop(); /*Időstop*/
document.getElementsByTagName("html")[0].setAttribute("class","");

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

if (typeof(AZON)!="undefined") { alert("Itt már fut SZEM. \n Ha ez nem igaz, nyitsd meg új lapon a játékot, és próbáld meg ott futtatni"); exit();}
var VERZIO = '4.5 Build 23.05.04';
try{ /*Rendszeradatok*/
	var AZON="S0";
	if (window.name.indexOf(AZON)>-1) AZON="S1";
	var BASE_URL=document.location.href.split("game.php")[0];
	var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");
	var SPEED=parseFloat(CONFIG.getElementsByTagName("speed")[0].textContent);
	var UNIT_S=parseFloat(CONFIG.getElementsByTagName("unit_speed")[0].textContent);
	var VILL1ST="";
	var ALTBOT=true;
	var MAX_IDO_PERC = 20; // MOCKED DATA: SHOULD BE A FARM SETTING
	AZON=game_data.player.id+"_"+game_data.world+AZON;
	var CLOUD_AUTHS = localStorage.getItem('szem_firebase');
	var USER_ACTIVITY = false;
	var USER_ACTIVITY_TIMEOUT;
	var worker = createWorker(function(self){
		self.TIMERS = {};
		self.addEventListener("message", function(e) {
			if (e.data.id == 'stopTimer') {
				e.data.timers = self.TIMERS;
				clearTimeout(self.TIMERS[e.data.value]);
			} else {
				self.TIMERS[e.data.id] = setTimeout(() => { postMessage(e.data); }, e.data.time);
			}
		}, false);
	});
	worker.onmessage = function(worker_message) {
		worker_message = worker_message.data;
		switch(worker_message.id) {
			case 'farm': szem4_farmolo_motor(); break;
			case 'vije': szem4_VIJE_motor(); break;
			case 'epit': szem4_EPITO_motor(); break;
			case 'adatok': szem4_ADAT_motor(); break;
			default: debug('worker','Ismeretlen ID', JSON.stringify(worker_message))
		}
	};
	function createWorker(main){
		var blob = new Blob(
			["(" + main.toString() + ")(self)"],
			{type: "text/javascript"}
		);
		return new Worker(window.URL.createObjectURL(blob));
	}
}catch(e){alert('SZEM Nem tud elindulni/n' + e); exit(0);}

function vercheck(){try{
	naplo('Globál','Verzió ['+VERZIO+'] legfrissebb állapotban, GIT-ről szedve. ');
}catch(e){alert2(e);}}

function init(){try{
	if (document.getElementById("production_table"))  var PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table"))  var PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table"))  var PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table"))  var PFA=document.getElementById("techs_table"); else 
	{alert("Ilyen nézetbe való futtatás nem támogatott. Kísérlet az áttekintés betöltésére...\n\nLaunching from this view is not supported. Trying to load overview..."); document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages"); return false;}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem találok koordinátákat ebbe a listába.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++) {
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[i-1]=kord+";"+PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0];
	}
	document.getElementsByTagName("head")[0].innerHTML += `
	<style type="text/css">
		body { background: #111; }
		.fej {
			width: 1024px;
			margin:auto;
			color: white;
			position: relative;
		}
		.fej > table {
			padding:1px;
			border: 1px solid yellow;
		}
		#global_notifications {
			position: absolute;
			top: 0;
			left: -22px;
			width: 18px;
		}
		#global_notifications img { width: 18px; }
		#global_notifications img.rotate { animation: rotation 2s infinite linear; }
		@keyframes rotation {
			from {
			  transform: rotate(0deg);
			}
			to {
			  transform: rotate(360deg);
			}
		  }
		table.menuitem {
			vertical-align:top;
			text-align: top;
			padding: 20px;
			margin:auto;
			color: white;
			border: 1px solid yellow;
		}
		table.menuitem td {
			padding: 0px;
			vertical-align:top;
		}
		table {
			padding: 0px;
			margin: auto;
			color: white;
		}
		table.vis { color:black; }
		table.vis td, table.vis th { padding: 3px 6px 3px 6px;  }
		#farm_honnan tr td:last-child {
			font-size:50%;
			width:130px;
		}
		#farm_hova tr td:last-child {
			font-size:50%;
			width:130px;
		}
		textarea {
			background-color: #020;
			color:white;
		}
		.divrow { display: flex; align-items: center; }
		.divcell {
			display: table-cell;
			text-align: center;
			vertical-align:top;
		}
		a { color: white; }
		img{
			border-color: grey;
			padding:1px;
		}
		#naploka a { color:blue; }
		input[type="button"] {
			font-size:13px;
			font-family: Century Gothic, sans-serif;
			color:#FFFF77;
			background-color:#3366CC;
			border-style: ridge;
			border-color:#000000;
			border-width:3px;
		}
		.szem4_vije_optsTable {
			margin: initial;
			border-collapse: separate;
			border-spacing: 0px 7px;
		}
		.szem4_vije_optsTable input {
			font-size: 10pt;
		}
		#vije_opts input[type="checkbox"] { width: 17px; height: 17px; }
		</style>`;
	document.getElementsByTagName("body")[0].innerHTML=`
		<div id="alert2" style="width: 300px; background-color: #60302b; color: #FFA; position: fixed; left:40%; top:40%; border:3px solid black; font-size: 11pt; padding: 5px; z-index:200; display:none">
			<div id="alert2head" style="width:100%;cursor:all-scroll; text-align:right; background: rgba(255,255,255,0.1)">
				<a href='javascript: alert2("close");'>X (Bezár)</a>
			</div>
			<p id="alert2szov"></p>
		</div>
		<div class="fej">
			<div id="global_notifications"></div>
			<table width="100%" align="center" style="background: #111; background-image:url('${pic("wallp.jpg")}'); background-size:1024px;">
				<tr>
					<td width="70%" id="fejresz" style="vertical-align:middle; margin:auto;">
						<h1><i></i></h1>
					</td>
					<td id="sugo" height="110px"></td>
				</tr>
				<tr><td colspan="2" id="menuk" style="">
					<div class="divrow" style="width: 1016px">
						<span class="divcell" id="kiegs" style="text-align:left; padding-top: 9px;width:870px;">
							<img src="${pic("muhely_logo.png")}" alt="GIT" title="GIT C&amp;C Műhely megnyitása" onclick="window.open('https://github.com/cncDAni2/klanhaboru')">
							<img src="${pic("kh_logo.png")}" alt="Game" title="Klánháború megnyitása" onclick="window.open(document.location.href)">
							|
						</span>
						<span class="divcell" style="text-align:right; width:250px">
							<a href=\'javascript: nyit("naplo");\' onmouseover="sugo(this,\'Események naplója\')">Napló</a>
							<a href=\'javascript: nyit("debug");\' onmouseover="sugo(this,\'Hibanapló\')">Debug</a>
							<a href=\'javascript: nyit("hang");\'><img src="${pic("hang.png")}" onmouseover="sugo(this,\'Hangbeállítások\')" alt="hangok"></a>
						</span>
					</div>
				</td></tr>
			</table>
		</div>
		<p id="content" style="display: inline"></p>`;
	document.getElementById("content").innerHTML='<table class="menuitem" width="1024px" align="center" id="naplo" style="display: none"> <tr><td> <h1 align="center">Napló</h1><br> <br> <table align="center" class="vis" id="naploka"><tr><th onclick=\'rendez("datum2",false,this,"naploka",0)\'  style="cursor: pointer;">Dátum</th><th  onclick=\'rendez("szoveg",false,this,"naploka",1)\' style="cursor: pointer;">Script</th><th  onclick=\'rendez("szoveg",false,this,"naploka",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="debug" style="display: none"> <tr><td> <h1 align="center">DeBugger</h1><br> <br> <table align="center" class="vis" id="debugger"><tr><th onclick=\'rendez("datum2",false,this,"debugger",0)\' style="cursor: pointer;">Dátum</th><th onclick=\'rendez("szoveg",false,this,"debugger",1)\' style="cursor: pointer;">Script</th><th onclick=\'rendez("szoveg",false,this,"debugger",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="hang" style="display: none"> <tr><td> <p align="center"><audio id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio></p> <h1 align="center">Hangbeállítás</h1><br> <div id="hangok" style="display:table;"> 	<div style="display:table-row;"><div style="display:table-cell; padding:10px;" onmouseover=\'sugo(this,"Ha be van kapcsolva, bot védelem esetén ez a link is megnyitódik, mint figyelmeztetés.")\'><b>Alternatív botriadó? <a href="javascript: altbot()">BEKAPCSOLVA</a><br>Megnyitott URL (egyszer)<br><input type="text" id="altbotURL" size="42" value="http://www.youtube.com/watch?v=k2a30--j37Q"></div>   </div> </div> </td></tr> </table>';
	document.title="SZEM IV";
	
	debug("SZEM 4","Verzió: GIT_"+new Date().toLocaleDateString());
	debug("SZEM 4","Prog.azon: "+AZON);
	debug("SZEM 4","W-Speed: "+SPEED);
	debug("SZEM 4","U-Speed: "+UNIT_S);
	return true;
}catch(e){alert("Hiba indításkor:\n\nError at starting:\n"+e); return false;}}

function pic(file){
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+file;
}

function altbot(){try{
	ALTBOT=!ALTBOT;
	if (ALTBOT) {
		document.getElementById("altbotURL").parentNode.getElementsByTagName("a")[0].innerHTML="BEKAPCSOLVA";
		document.getElementById("altbotURL").removeAttribute("disabled");
	} else {
		document.getElementById("altbotURL").parentNode.getElementsByTagName("a")[0].innerHTML="KIKAPCSOLVA";
		document.getElementById("altbotURL").setAttribute("disabled","true");
	}
	return;
}catch(e){alert(e);}}

function soundVolume(vol){
	document.getElementById("audio1").volume=vol;
}

function playSound(hang){try{
	var ison=document.getElementsByName(hang)[0];
	if (ison==undefined) {debug("hanghiba","Nem definiált hang: "+hang); return}
	if (ison.checked==false) return;
	var play="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+hang+".wav";
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	setTimeout(function() { if (document.getElementById("audio1").paused) document.getElementById("audio1").play()}, 666);
}catch(e){alert2(e);}}

function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
	theEvent.returnValue = false;
	if(theEvent.preventDefault) theEvent.preventDefault();
  }
}

function shorttest(){try{
	var hiba=""; var warn="";
	var nez=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	
	if (nez[0].value=="") hiba+="Termelés/óra értéke üres. Legalább egy 0 szerepeljen!\n";
	if (parseInt(nez[0].value,10)<50) warn+="Termelés/óra értéke nagyon alacsony. \n";
	
	if (nez[1].value=="") hiba+="Max táv/óra: Üres érték. \n";
	if (nez[2].value=="") hiba+="Max táv/perc: Üres érték. \n";
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<1) hiba+="A jelenleg megadott max távolság 0!\n";	
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<40) warn+="A jelenleg megadott max távolság nagyon rövid!\n";	
	
	if (nez[3].value=="") hiba+="A határszám értéke üres. Minimum megengedett értéke: 100.\n";
	if (parseInt(nez[3].value,10)<100) hiba+="A határszám értéke túl alacsony. Minimum megengedett értéke: 100.\n";
	
	
	if (nez[4].value=="") hiba+="Ha nem szeretnél kémet küldeni, írj be 0-t.\n";
	if (parseInt(nez[4].value,10)>3) warn+="3-nál több kém egyik szerveren sem szükséges. Javasolt: 1 vagy 3.\n";
	if (nez[5].checked && parseInt(nez[4].value,10)==0) warn+="Kényszeríted a kémek küldését, de a küldendő kém értékére 0 van megadva!\n";
	//if (nez[6].checked && parseInt(nez[4].value,10)==0) warn+="Kezdő kémtámadást szeretnél, de a küldendő kém értékére 0 van megadva!\n";
	
	if (nez[7].value=="") hiba+="Ha minimum limit nélkül szeretnéd egységeid küldeni, írj be 0-t.\n";
	var hatarszam=parseInt(nez[3].value,10);
	var minsereg=parseInt(nez[7].value,10);
	
	if (Math.ceil(hatarszam/20)<minsereg) hiba+="A minimum sereg/falu legalább 20x-osa kell hogy legyen a határszám. Javaslatok: Minimum sereg "+Math.ceil(hatarszam/20)+", vagy Határszám: "+Math.ceil(minsereg*20)+"\n";
	
	if (nez[8].value=="") hiba+="A legkevesebb pihenő idő: 1 perc, ne hagyd üresen.\n";
	if (parseInt(nez[8].value,10)<1) hiba+="A legkevesebb pihenő idő: 1 perc.\n";
	if (parseInt(nez[8].value,10)>150) hiba+="150 percnél több pihenő időt nem lehet megadni.\n";
	if (nez[9].value=="") hiba+="A leggyorsabb ciklusidő: 200 ms, ne hagyd üresen.\n";
	if (parseInt(nez[9].value,10)<200) hiba+="A leggyorsabb ciklusidő: 200 ms\n";
	if (parseInt(nez[9].value,10)>3000) hiba+="3000 ms-nél több ciklusidő felesleges, és feltűnő. Írj be 3000 alatti értéket.\n";
	
	if (parseInt(nez[10].value,10)<20) hiba+="Raktár telítettségi értéke túl alacsony, így vélhetőleg sehonnan se fog fosztani.";
	
	if (hiba!="" && !FARM_PAUSE) szunet("farm",document.getElementsByName("farm")[0]);
	if (FARM_PAUSE) warn+="A farmoló jelenleg meg van állítva!";
	if (hiba!="") {alert2("<b>Egy vagy több beállítási hiba miatt nem indítható a farmoló! Javítsa, majd indítsa el a kiegészítőt.</b><br><br>"+hiba); return false;} 
		else { if (warn=="") alert2("close");
					else alert2("Javaslatok:\n"+warn);
			   return true;} 
}catch(e){alert2("Hiba :(\n"+e);}}

var SUGOORA;
function sugo(el, str) {
	if (str == '') {
		document.getElementById("sugo").innerHTML=str;
		return;
	}
	if (!el.hasAttribute("data-hossz")) {
		el.addEventListener("mouseout", (event) => {
			SUGOORA = setTimeout(() => sugo(event.fromElement, ""), parseInt(event.fromElement.getAttribute('data-hossz'), 10));
		});
	}
	var hossz=str.length;
	hossz=Math.round((hossz*1000)/40);
	if (SUGOORA!="undefined") clearTimeout(SUGOORA);
	document.getElementById("sugo").innerHTML=str;
	el.setAttribute('data-hossz', hossz);
}

function prettyDatePrint(m){
	return m.getFullYear() + "/" +
    ("0" + (m.getMonth()+1)).slice(-2) + "/" +
    ("0" + m.getDate()).slice(-2) + " " +
    ("0" + m.getHours()).slice(-2) + ":" +
    ("0" + m.getMinutes()).slice(-2) + ":" +
    ("0" + m.getSeconds()).slice(-2);
}
function nyit(ezt){try{
	var temp=document.getElementById("content").childNodes;
	var cid="";
	for (var i=0;i<temp.length;i++) {
		if (temp[i].nodeName.toUpperCase()=="TABLE") {cid=temp[i].getAttribute("id");
		$("#"+cid).fadeOut(300);}
	} var patt=new RegExp("\""+ezt+"\"");
	temp=document.getElementById("menuk").getElementsByTagName("a");
	for (i=0;i<temp.length;i++) {
		temp[i].style.padding="3px";
		if (patt.test(temp[i].getAttribute("href"))) temp[i].style.backgroundColor="#000000"; else temp[i].style.backgroundColor="transparent";
	}
	setTimeout(function(){$("#"+ezt).fadeIn(300)},300);
	//addFlyingOptions(ezt);
}catch(e){alert(e);}}

function alert2(szov){
	szov=szov+"";
	if (szov=="close") {$("#alert2").hide(); return;}
	szov=szov.replace("\n","<br>");
	document.getElementById("alert2szov").innerHTML="<b>Üzenet:</b><br>"+szov;
	$("#alert2").show();
}

function naplo(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("naploka");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	playSound("naplobejegyzes");
	return;
}
function debug(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("debugger");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	if (table.rows.length > 300) {
		$("#debugger").find('tr:gt(150)').remove();
	}
}

function ujkieg(id,nev,tartalom){
	if (document.getElementById(nev)) return false;
	document.getElementById("kiegs").innerHTML+='<img onclick=\'szunet("'+id+'",this)\' name="'+id+'" onmouseover=\'sugo(this,"Az érintett scriptet tudod megállítani/elindítani.")\' src="'+pic(((id=='farm'||id=='vije')?'pause':'play')+ ".png")+'" alt="Stop" title="Klikk a szüneteltetéshez"> <a href=\'javascript: nyit("'+id+'");\'>'+nev.toUpperCase()+'</a> ';
	document.getElementById("content").innerHTML+='<table class="menuitem" width="1024px" align="center" id="'+id+'" style="display: none">'+tartalom+'</table>';
	return true;
}
function ujkieg_hang(nev,hangok){
	try{var files=hangok.split(";");}catch(e){var files=hangok;}
	var hely=document.getElementById("hangok").getElementsByTagName("div")[0];
	var kieg=document.createElement("div"); kieg.setAttribute("style","display:table-cell; padding:10px;");
	var str="<h3>"+nev+"</h3>";
	for (var i=0;i<files.length;i++) {
		str+='<input type="checkbox" name="'+files[i]+'" checked> <a href="javascript: playSound(\''+files[i]+'\');">'+files[i]+'</a><br>';
	}
	kieg.innerHTML=str;
	hely.appendChild(kieg);
	return;
}

function szunet(script,kep){try{
	switch (script) {
		case "farm":
			FARM_PAUSE=!FARM_PAUSE;
			var sw=FARM_PAUSE;
			break;
		case "vije":
			VIJE_PAUSE=!VIJE_PAUSE;
			var sw=VIJE_PAUSE;
			break;
		case "idtamad":
			alert2("Ezt a script nem állítható meg, mivel nem igényel semmilyen erőforrást.<br>Ha a hangot szeretnéd kikapcsolni, megteheted azt a hangbeállításoknál.");
			break;
		case "epit":
			EPIT_PAUSE=!EPIT_PAUSE;
			var sw=EPIT_PAUSE;
			break;
		case "adatok":
			ADAT_PAUSE=!ADAT_PAUSE;
			var sw=ADAT_PAUSE;
			break;
		default: {alert2("Sikertelen script megállatás. Nincs ilyen alscript: "+script);return;}
	}
	
	if (sw) {
		kep.src=pic("pause.png");
		kep.alt="Start";
		kep.title="Klikk a folytatáshoz";
	} else {
		kep.src=pic("play.png");
		kep.alt="Stop";
		kep.title="Klikk a szüneteltetéshez";
	}
	
	if (script=="farm") shorttest();
}catch(e){alert2("Hiba:\n"+e);}}

function distCalc(S,D){
	S[0]=parseInt(S[0]);
	S[1]=parseInt(S[1]);
	D[0]=parseInt(D[0]);
	D[1]=parseInt(D[1]);
	return Math.abs(Math.sqrt(Math.pow(S[0]-D[0],2)+Math.pow(S[1]-D[1],2)));
}

function rendez(tipus,bool,thislink,table_azon,oszlop){try{
/*Tipus: "szoveg" v "szam"*/
	var OBJ=document.getElementById(table_azon).getElementsByTagName("tbody")[0];
	var prodtable=document.getElementById(table_azon).rows;
	if (prodtable.length<2) return;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	var no=0;
	var vizsgal=$.trim(prodtable[1].cells[oszlop].innerText).replace(" ","");
	
	for (var i=1;i<prodtable.length;i++) {
		switch (tipus) {
			case "szoveg": tavok[i-1]=prodtable[i].cells[oszlop].innerText; break;
			case "szam": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(".","")); break;
			case "datum": if (prodtable[i].cells[oszlop].innerText=="") tavok[i-1]=new Date(); else tavok[i-1]=new Date(prodtable[i].cells[oszlop].innerText); break;
			case "datum2": var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
				var d=new Date();
				var s=prodtable[i].cells[oszlop].innerText;
				d.setMonth(honap.indexOf(s.split(" ")[0]));
				d.setDate(s.split(" ")[1].replace(",",""));
				d.setHours(s.split(" ")[2].split(":")[0]);
				d.setMinutes(s.split(" ")[2].split(":")[1]);
				d.setSeconds(s.split(" ")[2].split(":")[2]);
				tavok[i-1]=d; break;
			case "lista": tavok[i-1]=prodtable[i].cells[oszlop].getElementsByTagName("select")[0].value; break;
			default: throw("Nem értelmezhető mi szerint kéne rendezni."); return;
		}
		sorok[i-1]=prodtable[i];
		indexek[i-1]=i-1;
	}
	
	for (var i=0;i<tavok.length;i++) {
		var min=i;
		for (var j=i;j<tavok.length;j++) {
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
	
	for (var i=prodtable.length-1;i>0;i--) {
		OBJ.deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++) {
		OBJ.appendChild(sorok[indexek[i]]);
	}
	
	thislink.setAttribute("onclick","rendez(\""+tipus+"\","+!bool+",this,\""+table_azon+"\","+oszlop+")");
	return;
}catch(e){alert2("Hiba rendezéskor:\n"+e);}}

function koordTOid(koord){
	for (var i=0;i<KTID.length;i++) {
		if (KTID[i].split(";")[0]==koord) return KTID[i].split(";")[1];
	}
	return 0;
}

function rovidit(tipus){
	var ret="";
	switch (tipus) {
		case "egysegek": 
			for (var i=0;i<UNITS.length;i++)
			ret+='<img style="width:15px" src="/graphic/unit/unit_'+UNITS[i]+'.png"><input type="checkbox" onclick="szem4_farmolo_multiclick('+i+',\'honnan\',this.checked)">';
			break;
		default: ret="";
	}
	return ret;
}

function getServerTime(ref){ /* !!! */
	var d=new Date();
	return d;
}

function maplink(koord){
	return '<a href="'+VILL1ST.replace("screen=overview","x="+koord.split("|")[0]+"&y="+koord.split("|")[1]+"&screen=map")+'" target="_BLANK">'+koord+'</a>';
}
/*dupla klikk események*/
function multipricer(ez,tip,s1){try{
	if (ez==undefined) return;
	if (!(document.getElementById("farm_multi_"+ez).checked)) return;
	var x=document.getElementById("farm_"+ez).rows;
	for (var i=x.length-1;i>0;i--) {
		if (x[i].style.display!="none") {
			switch(tip) {
			case "del": x[i].parentNode.removeChild(x[i]);break;
			case "urit": if (ez=="honnan") x[i].cells[2].innerHTML="";else x[i].cells[5].innerHTML="";break;
			case "mod": x[i].cells[3].innerHTML=s1;break;
			case "htor": x[i].cells[0].style.backgroundColor="#f4e4bc";break;
			case "hcser": x[i].cells[2].style.backgroundColor=s1;break;
			}
		}
	}
}catch(e){}}

function sortorol(cella,ismulti) {
 var row = cella.parentNode;
 row.parentNode.removeChild(row);
 multipricer(ismulti,"del");
}
function urit(cella,ismulti){
	cella.innerHTML="";
	multipricer(ismulti,"urit");
}
function modosit_szam(cella){
	var uj=prompt('Új érték?');
	if (uj==null) return;
	uj=uj.replace(/[^0-9]/g,"");
	if (uj=="") return;
	cella.innerHTML=uj;
	multipricer("hova","mod",uj);
}
function hattertolor(cella){
	cella.style.backgroundColor="#f4e4bc";
	multipricer("hova","htor");
}
function hattercsere(cella){
	var szin="#00FF00";
	if (cella.style.backgroundColor=="rgb(0, 255, 0)" || cella.style.backgroundColor=="#00FF00") szin="#f4e4bc";
	cella.style.backgroundColor=szin;
	multipricer("hova","hcser",szin);
}
function addFreezeNotification() {
	if (!USER_ACTIVITY) document.getElementById('global_notifications').innerHTML = `<img src="${pic('freeze.png')}" class="rotate" onmouseover="sugo(this,'Amíg SZEM keretrendszert piszkálod, SZEM pihen hogy fókuszálni tudj (automata)')">`;
	USER_ACTIVITY = true;
	clearTimeout(USER_ACTIVITY_TIMEOUT);
	USER_ACTIVITY_TIMEOUT = setTimeout(() => {
		USER_ACTIVITY = false;
		document.getElementById('global_notifications').innerHTML = '';
	}, 5000);
}

var BOTORA, ALTBOT2=false, BOT_VOL=0.0; /*ALTBOT2 --> megnyílt e már 1x az ablak*/
function BotvedelemBe(){try{
	BOT_VOL+=0.2;
	if (BOT_VOL>1.0) BOT_VOL=1.0;
	soundVolume(BOT_VOL);
	playSound("bot2");
	BOT=true;
	alert2('BOT VÉDELEM!!!<br>Írd be a kódot, és kattints ide lentre!<br><br><a href="javascript: BotvedelemKi()">Beírtam a kódot, mehet tovább!</a>');
	if (ALTBOT && !ALTBOT2) {window.open(document.getElementById("altbotURL").value);ALTBOT2=true;}
	}catch(e){debug("BotvedelemBe()",e);}
	BOTORA=setTimeout("BotvedelemBe()",1500);
}
function BotvedelemKi(){
	BOT=false; ALTBOT2=false; BOT_VOL=0.0;
	document.getElementById("audio1").pause;
	alert2("OK");
	clearTimeout(BOTORA);
	/*Megnyitott lapok frissítése*/
	try{FARM_REF.location.reload();}catch(e){}
	try{VIJE_REF1.location.reload();}catch(e){}
	try{VIJE_REF2.location.reload();}catch(e){}
	try{IDTAMAD_REF.location.reload();}catch(e){}
	try{EPIT_REF.location.reload();}catch(e){}
	return;
}

function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.title=="Bot védelem") {
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1) {
		naplo("Globális","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
		BotvedelemBe();
		return false;
	}
	if (!address) return false;
	if (address.indexOf("not ")>-1) var neg=true; else var neg=false;
	if (faluid>-1) if (ref.game_data.village.id!=faluid) return false;
	if (ref.document.getElementById("serverTime").innerHTML.length>4) {
		if (neg) {
			if (ref.document.location.href.indexOf(address.split(" ")[1])==-1) return true;
		} else {
			if (ref.document.location.href.indexOf(address)>-1)	return true;
		}
	}
	return false;
}catch(e){return false;}}
function windowOpener(id, url, windowId) {
	return window.open(url, windowId);
}

/* ------------------- FARMOLÓ ----------------------- */
function add_farmolo(){ try{
	var datas=document.getElementById("farm_opts");
	var faluk=datas.rows[1].cells[0].getElementsByTagName("input")[0].value;
	if (faluk=="") return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk=faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	var istarget=false;
	for (var j=0;j<datas.rows[2].cells[0].getElementsByTagName("input").length;j++) {
		if (datas.rows[2].cells[0].getElementsByTagName("input")[j].checked==true) {istarget=true; break;}
	}
	if (!istarget) {
		if (!confirm("Nincs semmilyen egység megadva, amit küldhetnék. Folytatod?\n(később ez a megadás módosítható)")) return;
	}
	
	var dupla="";
	for (var i=0;i<faluk.length;i++) {
		var a=document.getElementById("farm_honnan");
		var b=document.getElementById("farm_hova");
		for (var j=1;j<a.rows.length;j++) {
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		for (var j=1;j<b.rows.length;j++) {
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		if (koordTOid(faluk[i])==0) {dupla+=faluk[i]+", "; faluk[i]=""; continue;}
		
		var b=a.insertRow(-1);
		var c=b.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick",'sortorol(this,"honnan")');
		var c=b.insertCell(1); c.innerHTML=rovidit("egysegek");
		for (var j=0;j<c.getElementsByTagName("input").length;j++) {
			if (datas.rows[2].cells[0].getElementsByTagName("input")[j].checked==true) c.getElementsByTagName("input")[j].checked=true;
		}
		var c=b.insertCell(2); c.innerHTML=""; c.setAttribute("ondblclick",'urit(this,"honnan")');
	}
	datas.rows[1].cells[0].getElementsByTagName("input")[0].value="";
	if (dupla!="") alert2("Dupla falumegadások, esetleg nem lévő saját faluk kiszűrve:\n"+dupla);
	return;	
}catch(e){alert(e);}}
function add_farmolando(){try{
	var datas=document.getElementById("farm_opts");
	var faluk=datas.rows[1].cells[1].getElementsByTagName("input")[0].value;
	if (faluk=="") return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk=faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	datas.rows[2].cells[1].getElementsByTagName("input")[3].value=datas.rows[2].cells[1].getElementsByTagName("input")[3].value.replace(/[^0-9]/g,"");
	if 	(datas.rows[2].cells[1].getElementsByTagName("input")[3].value=="") datas.rows[2].cells[1].getElementsByTagName("input")[3].value=3600;
	
	var dupla="";
	for (var i=0;i<faluk.length;i++) {
		var a=document.getElementById("farm_hova");
		var b=document.getElementById("farm_honnan");
		for (var j=1;j<a.rows.length;j++) {
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		for (var j=1;j<b.rows.length;j++) {
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		var b=a.insertRow(-1); 
		var c=b.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick","hattertolor(this)"); c.setAttribute("data-age","0");
		var c=b.insertCell(1); c.innerHTML=""; c.setAttribute("ondblclick",'sortorol(this,"hova")');
		var c=b.insertCell(2); c.innerHTML="0"; c.setAttribute("ondblclick","hattercsere(this)");
		var c=b.insertCell(3); c.innerHTML="0"; c.setAttribute("ondblclick",'modosit_szam(this)');
		var c=b.insertCell(4); c.innerHTML='<input type="checkbox" onclick="szem4_farmolo_multiclick(0,\'hova\',this.checked)">';
		var c=b.insertCell(5); c.innerHTML=""; c.setAttribute("ondblclick",'urit(this,"hova")');
	}
		
	datas.rows[1].cells[1].getElementsByTagName("input")[0].value="";
	if (dupla!="") alert2("Dupla falumegadások kiszűrve:\n"+dupla);
	return;	
}catch(e){alert(e);}}
function szem4_farmolo_multiclick(no,t,mire){try{
	if (!(document.getElementById("farm_multi_"+t).checked)) return;
	var x=document.getElementById("farm_"+t).rows;
	if (t=="honnan") t=1; else t=4;
	for (var i=1;i<x.length;i++) {
		if (x[i].style.display!="none") x[i].cells[t].getElementsByTagName("input")[no].checked=mire;
	}
	return;
}catch(e){alert2("Hiba: "+t+"-"+no+"\n"+e);}}
function szem4_farmolo_csoport(tabla){try{
	var lista=prompt("Faluszűrő\nAdd meg azon faluk koordinátáit, melyeket a listában szeretnél látni. A többi falu csupán láthatatlan lesz, de tovább folyik a használata.\nSpeciális lehetőségid:\n-1: Csupán ezt az értéket adva meg megfordítódik a jelenlegi lista láthatósága (negáció)\n-...: Ha az első karakter egy - jel, akkor a felsorolt faluk kivonódnak a jelenlegi listából (különbség)\n+...: Ha az első karaktered +, akkor a felsorolt faluk hozzáadódnak a listához (unió)\nÜresen leokézva az összes falu láthatóvá válik");
	if (lista==null)return;
	var type="norm";
	if (lista=="-1") type="negalt";
		else {
			if (lista[0]=="-")type="kulonbseg";
			if (lista[0]=="+")type="unio";
		}
	if (lista=="") type="all";
	if (lista=="S") type="yellow";
	lista=lista.match(/[0-9]+(\|)[0-9]+/g);
	var uj=false; var jel;
	var x=document.getElementById("farm_"+tabla).rows;
	for (var i=1;i<x.length;i++) {
		uj=false; jel=x[i].cells[0].textContent;
		switch(type) {
			case "norm": if (lista.indexOf(jel)>-1) uj=true; break;
			case "negalt": if (x[i].style.display=="none") uj=true; break;
			case "kulonbseg": if (x[i].style.display!="none" && lista.indexOf(jel)==-1) uj=true; break;
			case "unio": if (x[i].style.display!="none" || lista.indexOf(jel)>-1) uj=true; break;
			case "all": uj=true; break;
			case "yellow": if (x[i].cells[0].style.backgroundColor=="yellow") uj=true; break;
		}
		if(uj)x[i].setAttribute("style","display:line");else x[i].setAttribute("style","display:none");
	}
}catch(e){alert2("Hiba: \n"+e);}}
function getAllResFromVIJE(coord) {
	var allAttack = ALL_UNIT_MOVEMENT[coord];
	if (!allAttack) return 0;
	var allRes = 0;
	for (let att in allAttack) {
		allRes+=allAttack[att][2];
	}
	if (isNaN(allRes)) {debug('getAllResFromVIJE', 'allRes is NaN at ' + coord + ': ' + JSON.stringify(allAttack)); return 0;}
	return allRes;
}
function subtractNyersValue(coord, val) {
	var nyersTable = document.getElementById('farm_hova').rows;
	var cells;
	for (var i=1;i<nyersTable.length;i++) {
		cells = nyersTable[i].cells;
		if (cells[0].textContent == coord) {
			var oldValue = parseInt(cells[3].innerText,10);
			oldValue-=val;
			if (oldValue<0) oldValue=0;
			cells[3].innerHTML = oldValue;
			break;
		}
	}
}
function clearAttacks() {try{
	const currentTime = new Date().getTime();
	for (let item in ALL_UNIT_MOVEMENT) {
		// Current utáni érkezések kivágása
		var outdatedArrays = [];
		for (var i=ALL_UNIT_MOVEMENT[item].length-1;i>=0;i--) {
			if (ALL_UNIT_MOVEMENT[item][i][1] <= currentTime - (MAX_IDO_PERC * 3 * 60000)) { // Kuka, ha nagyon régi
				ALL_UNIT_MOVEMENT[item].splice(i, 1);
				continue;
			}
			if (ALL_UNIT_MOVEMENT[item][i][1] <= currentTime) outdatedArrays.push(ALL_UNIT_MOVEMENT[item][i]);
		}
		// Beérkezett támadások nyerstörlése
		if (!outdatedArrays) continue;
		for (let movement of outdatedArrays) {
			if (movement.length != 3) {
				debug('clearAttacks', 'Anomaly, nem szabályszerű mozgás ('+item+'):'+JSON.stringify(movement)+' -- össz:'+JSON.stringify(outdatedArrays));
			}
			if (movement[2] > 0) {
				subtractNyersValue(movement[0], movement[2]);
				movement[2] = 0;
			}
		}

		if (outdatedArrays.length < 2) continue;
		// Leghamarábbi keresése
		var closestArray = outdatedArrays.reduce(function(prev, current) {
			return (current[1] > prev[1]) ? current : prev;
		}, outdatedArrays[0]);

		ALL_UNIT_MOVEMENT[item] = ALL_UNIT_MOVEMENT[item].filter(function(array) {
			return array[1] >= closestArray[1];
		});
	}
	for (let item in ALL_VIJE_SAVED) {
		if (ALL_VIJE_SAVED[item] < currentTime - (3 * 60 * 60000)) {
			subtractNyersValue(item, 400000);
			delete ALL_VIJE_SAVED[item];
		}
	}
}catch(e) {debug('clearAttacks', e);}}

function getCorrigatedMaxIdoPerc(banyaszintek) {
	var hatarszam=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10);
	return Math.max(MAX_IDO_PERC, convertTbToTime(banyaszintek, hatarszam));
}
function getProdHour(banyaszintek) {
	var prodHour = 0;
	if (banyaszintek.split(',').length<3) {
		prodHour=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[0].value;
		if (prodHour!="") prodHour=parseInt(prodHour); else prodHour=1000;
	} else {
		var r=banyaszintek.split(",").map(item => parseInt(item, 10));
		prodHour=(TERMELES[r[0]]+TERMELES[r[1]]+TERMELES[r[2]])*SPEED;
	}
	return prodHour;
}
function getResourceProduction(banyaszintek, idoPerc) {try{
	var corrigatedMaxIdoPerc = getCorrigatedMaxIdoPerc(banyaszintek);
	if (idoPerc == 'max' || idoPerc > corrigatedMaxIdoPerc) idoPerc = corrigatedMaxIdoPerc;

	prodHour = getProdHour(banyaszintek);
	
	var idoOra = idoPerc/60;
	return Math.round(prodHour * idoOra);
}catch(e) {debug('getResourceProduction', e);}}
function convertTbToTime(banyaszintek, tb) {
	var termeles = getProdHour(banyaszintek); // 1000 
	var idoPerc = (tb / termeles) * 60;
	return idoPerc;
}
function calculateNyers(farmCoord, banyaszintek, travelTime) {try{
	//  Kiszámolja a többi támadásokhoz képest, mennyi a lehetséges nyers, kivonva amiért már megy egység.
	// Az érkezési idő +-X perc közötti rablási lefedettséget néz
	var foszthatoNyers = 0;
	var arriveTime = new Date();
	arriveTime.setMinutes(arriveTime.getMinutes() + travelTime);
	arriveTime = arriveTime.getTime();
	if (!ALL_UNIT_MOVEMENT[farmCoord]) {
		foszthatoNyers = getResourceProduction(banyaszintek, 'max');
		return foszthatoNyers;
	}

	allAttack = JSON.parse(JSON.stringify(ALL_UNIT_MOVEMENT[farmCoord]));
	var closests = findClosestTimes(allAttack, arriveTime);
	var lastBefore = closests[0],
		firstAfter = closests[1];
	if (lastBefore) {
		foszthatoNyers+=getResourceProduction(banyaszintek, (arriveTime - lastBefore[1]) / 60000);
	} else {
		foszthatoNyers+=getResourceProduction(banyaszintek, 'max');
	}

	if (firstAfter) {
		var lefedesPerc = convertTbToTime(banyaszintek, firstAfter[0]);
		var corrigatedMaxIdoPerc = getCorrigatedMaxIdoPerc(banyaszintek);
		if (lefedesPerc > corrigatedMaxIdoPerc) lefedesPerc = corrigatedMaxIdoPerc;
		firstAfter[1]-=(lefedesPerc * 60000);
		if (firstAfter[1] < arriveTime) {
			foszthatoNyers-=getResourceProduction(banyaszintek, (arriveTime - firstAfter[1])  / 60000);
		}
	}
	return foszthatoNyers;
}catch(e) {debug('calculateNyers', e);}}
function findClosestTimes(allAttack, arriveTime) { //@AI
	// Initialize variables to store the closest array before and after the target epoch time
	var closestBefore = null;
	var closestAfter = null;
  
	// Use reduce() to iterate over the array of arrays
	allAttack.reduce(function(prev, current) {
	  // Calculate the difference between the current epoch time and the target epoch time
	  var diff = current[1] - arriveTime;
  
	  // If the current epoch time is before the target epoch time and closer than the current closest before, update closestBefore
	  if (diff < 0 && (closestBefore === null || diff > closestBefore[1] - arriveTime)) {
		closestBefore = current;
	  }
	  // If the current epoch time is after the target epoch time and closer than the current closest after, update closestAfter
	  else if (diff > 0 && (closestAfter === null || diff < closestAfter[1] - arriveTime)) {
		closestAfter = current;
	  }
	  return prev;
	}, null);
  
	// Return the closest before and after arrays
	return [closestBefore, closestAfter];
}
function addCurrentMovementToList(formEl, farmCoord, farmHelyRow) {
	var patternOfIdo = /<td>[0-9]+:[0-9]+:[0-9]+<\/td>/g;
	var travelTime = formEl.innerHTML.match(patternOfIdo)[0].match(/[0-9]+/g);
	travelTime = parseInt(travelTime[0],10) * 3600 + parseInt(travelTime[1],10) * 60 + parseInt(travelTime[2],10);
	var arriveTime = new Date();
	arriveTime.setSeconds(arriveTime.getSeconds() + travelTime);
	if (arriveTime < new Date()) debugger;
	arriveTime = arriveTime.getTime();

	var teherbiras = parseInt(formEl.querySelector('.icon.header.ressources').parentElement.innerText.replaceAll('.',''), 10);
	var VIJE_teher = 0;
	var VIJE_nyers = parseInt(farmHelyRow.cells[3].textContent,10);
	if (VIJE_nyers > 0) {
		VIJE_nyers-=getAllResFromVIJE(farmCoord);
		if (VIJE_nyers > 0) {
			VIJE_teher = Math.min(teherbiras, VIJE_nyers);
			teherbiras-=VIJE_teher;
		}
	}

	var allAttack = ALL_UNIT_MOVEMENT[farmCoord];
	if (!allAttack) {
		ALL_UNIT_MOVEMENT[farmCoord] = [[teherbiras, arriveTime, VIJE_teher]];
	} else {
		allAttack.push([teherbiras, arriveTime, VIJE_teher]);
	}
	// KÉM?
	if (!FARM_REF.document.getElementById('place_confirm_units').querySelector('[data-unit="spy"]').getElementsByTagName('img')[0].classList.contains('faded')) {
		if (!ALL_SPY_MOVEMENTS[farmCoord] || ALL_SPY_MOVEMENTS[farmCoord] < arriveTime) ALL_SPY_MOVEMENTS[farmCoord] = arriveTime;
	}
}
function isgyalog(sor){try{
/*  0: Semmi sem engedélyezett
	1: Csak ló mehet
	2: Minden mehet e?
	3: Csak gyalog? */
	var ered=0;
	var c=document.getElementById("farm_honnan").rows[sor].cells[1].getElementsByTagName("input");
	if (c[5].checked || c[6].checked || c[7].checked) ered=1;
	if (c[0].checked || c[1].checked || c[2].checked || c[3].checked) {
		if (ered==1) ered=2; else ered=3;
	}
	return ered;
}catch(e){debug("isgyalog()",e);}}

/*function getLastDate(ref,fastest){try{
	var table=ref.document.getElementById("content_value").getElementsByTagName("table");
	table=table[table.length-1].rows;
	if (ref.document.location.href.indexOf("try=confirm")>0 || !table[1].cells[0].getElementsByTagName("img")[0]) return false;
	var currVill=[ref.game_data.village.x,ref.game_data.village.y];
	var target, curr, result, time;
	for (var i=1;i<table.length;i++){
		if (table[i].cells[0].getElementsByTagName("img")[0].src.indexOf("support")>-1) continue;
		target=table[i].cells[0].innerText.match(/[0-9]+(\|)[0-9]+/g);
		target=target[target.length-1];
		curr=new Date();
		
		time=table[i].cells[2].innerText.split(":");
		time[0] = parseInt(time[0],10); if (isNaN(time[0]) || time[0]>23) {return table[i].cells[2].innerText;}
		time[1] = parseInt(time[1],10); if (isNaN(time[1]) || time[1]>59) {return table[i].cells[2].innerText;}
		time[2] = parseInt(time[2],10); if (isNaN(time[2]) || time[2]>59) {return table[i].cells[2].innerText;}
		curr.setSeconds(curr.getSeconds() + (time[0]*3600)+(time[1]*60)+time[2]);
		if (table[i].cells[0].getElementsByTagName("img")[0].src.indexOf("return")==-1) {
			curr.setSeconds(curr.getSeconds() + fastest*60*distCalc(currVill,target.split("|")));
		}
		if (!result || curr<result) result=curr;
	}
	return result;
}catch(e){debug('getLastDate', e)}}
*/
function szem4_farmolo_1kereso(){try{/*Farm keresi párját :)*/
	var a=document.getElementById("farm_hova").rows;
	var b=document.getElementById("farm_honnan").rows;
	var par=[]; /*Becsült útidő;Gyalogosok e?;koord-honnan;koord-hova;nyers_termelésből*/
	var currDate=new Date(); var sp;
	if (a.length==1 || b.length==1) return "zero";
	var maxspeed=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[1].value)*60+(parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[2].value));

	for (var i=1;i<a.length;i++) {
		if (a[i].cells[0].style.backgroundColor=="red") continue;
		var hatarszam=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10);
		var farmCoord = a[i].cells[0].textContent;
		var nyers_VIJE = parseInt(a[i].cells[3].textContent,10);
		if (nyers_VIJE > 0) nyers_VIJE -= getAllResFromVIJE(farmCoord);
		var verszem = false;
		if (nyers_VIJE > (hatarszam * 5)) verszem = true;
		
		/*Farm vizsgálat (a[i]. sor), legközelebbi saját falu keresés hozzá (van e egyátalán (par.length==3?))*/
		var hogyok="";
		var closest_vill = {
			coord: '',
			traverTime: 0,
			units: ''
		};
		for (var j=1;j<b.length;j++) {
			sp=0;
			var fromVillRow = b[j];
			/*Elérhető forrás keresése*/
			if (fromVillRow.cells[2].innerHTML!="") {
				var fromVillDate=new Date(fromVillRow.cells[2].textContent);
				if (!(fromVillDate instanceof Date && !isNaN(fromVillDate.valueOf()))) {
					fromVillRow.cells[2].innerHTML = '';
					fromVillDate = new Date();
				}
				if (currDate>fromVillDate) {
					fromVillRow.cells[2].innerHTML="";
					hogyok="all";
				} else {
					if (fromVillRow.cells[2].style.backgroundColor=="yellow")
						hogyok="gyalog";
					else
						continue;
				}
			} else hogyok="all";
			
			/*Sebesség kiszámítása*/
			var gy=isgyalog(j); // Mi van bepipálva?
			if (gy==0) continue;
			if (gy==1 && hogyok=="gyalog") continue;
			if (gy==1 && hogyok=="all") sp=10;
			if (gy==2 && hogyok=="gyalog") sp=18;
			if (gy==2 && hogyok=="all") sp=10;
			if (gy==3) {sp=18; hogyok="gyalog";}
			if (sp==0) {debug("Farmoló","Anomália lépett fel farmkereséskor."); continue;}

			sp=sp*(1/SPEED)*(1/UNIT_S);
			sp=sp*(distCalc(farmCoord.split("|"), fromVillRow.cells[0].textContent.split("|"))); /*a[i]<->fromVillRow távkeresés*/

			if (closest_vill.coord == '' || closest_vill.traverTime > sp) {
				closest_vill = {
					coord: fromVillRow.cells[0].textContent,
					traverTime: sp,
					units: hogyok
				};
			}
		}
		if (closest_vill.traverTime <= maxspeed && closest_vill.traverTime > 0 && (verszem || par.length == 0 || closest_vill.traverTime < par[0])) {
			var nyers_termeles = calculateNyers(farmCoord, a[i].cells[1].textContent, closest_vill.traverTime);
			if ((nyers_VIJE + nyers_termeles) < hatarszam) continue;
			par = [closest_vill.traverTime, closest_vill.units, closest_vill.coord, farmCoord, nyers_VIJE+nyers_termeles];
		}
		if (verszem && par.length > 1) { debug('szem4_farmolo_1kereso', 'Vérszemet kaptam, sok nyers: '+ par[3] + ' ('+ par[4] + ')'); break;}
	}
	if (par.length==0) return ""; /*Nincs munka*/
	
	if (par[0]>maxspeed) return "";
	console.info('Támadás '+par[3], JSON.stringify(par), JSON.stringify(ALL_UNIT_MOVEMENT[par[3]]));
	return par;
}catch(e){debug("szem4_farmolo_1kereso()",e); return "";}}

function szem4_farmolo_2illeszto(adatok){try{/*FIXME: határszám alapján számolódjon a min. sereg*/
	/*adatok: [0:Becsült útidő; 1:Gyalogosok e?; 2:koord-honnan; 3:koord-hova; 4:nyers]*/
	/*Lovat a gyalogossal együtt nem küld. Ha adatok[1]=="all" -->ló megy. Ha az nincs, majd return-ba rászámolunk*/
	try{TamadUpdt(FARM_REF);}catch(e){}
	var C_form=FARM_REF.document.forms["units"];
	C_form.x.value=adatok[3].split("|")[0];
	C_form.y.value=adatok[3].split("|")[1];
	if (C_form["input"].value == undefined) {
		throw "Nem töltött be az oldal?"+C_form["input"].innerHTML;
	}
	
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i].cells[1].getElementsByTagName("input"); break;}
	}
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==adatok[3]) {farm_helye=farm_helye[i]; break;}
	}
	
	var opts=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	/*Elérhető sereg*/
	var elerheto=new Array();
	for (var i=0;i<UNITS.length;i++){try{
		if (falu_helye[i].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		else {
			if (i==4 && opts[5].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
			else elerheto[i]=0;
		}
		}catch(e){elerheto[i]=0;}
	}
	
	/*Listaösszeállítás*/
	var sslw=10;
	var ny=adatok[4];
	// var debugstr="";
	var debugzsak=0;
	var betesz_ossz=0;
	
	if (adatok[1]=="all") {
		for (var i=5;i<UNITS.length;i++){try{
			if (ny>TEHER[i]) {
				var kellene=Math.ceil(ny/TEHER[i]);
				var van=elerheto[i];
				if (kellene>van) var betesz=van; else var betesz=kellene;
				ny-=(betesz*TEHER[i]);
				debugzsak+=betesz*TEHER[i];
				// debugstr+=UNITS[i]+":"+betesz+"; ";
				FARM_REF.document.getElementById("unit_input_"+UNITS[i]).value=betesz;
				betesz_ossz+=TANYA[i]*betesz;
				if (sslw<E_SEB[i]) sslw=E_SEB[i];
			}}catch(e){}
		}
	} else {
		for (var i=0;i<4;i++){try{
			if (ny>TEHER[i]) {
				var kellene=Math.ceil(ny/TEHER[i]);
				var van=elerheto[i];
				if (kellene>van) var betesz=van; else var betesz=kellene;
				ny-=(betesz*TEHER[i]);
				debugzsak+=betesz*TEHER[i];
				// debugstr+=UNITS[i]+":"+betesz+"; ";
				FARM_REF.document.getElementById("unit_input_"+UNITS[i]).value=betesz;
				/*debug("illeszto",i+". Kellene: "+kellene+", van: "+elerheto[i]+". Betesz: "+betesz+". Ny--"+ny);*/
				betesz_ossz+=TANYA[i]*betesz;
				if (sslw<E_SEB[i]) sslw=E_SEB[i];
			}}catch(e){}
		}
	}

	/* Kémek, kém/perc figyelés */
	var kpp = opts[6].value;
	C_form.spy.value=0;
	if (falu_helye[4].checked) {
		var ut_perc = distCalc(adatok[2].split('|'), adatok[3].split('|')) * sslw * (1/SPEED)*(1/UNIT_S);
		var erk = new Date(); erk=erk.setMinutes(erk.getMinutes() + ut_perc);
		
		if (!ALL_SPY_MOVEMENTS[adatok[3]] || (erk - ALL_SPY_MOVEMENTS[adatok[3]]) > (kpp * 60000)) {
			C_form.spy.value=(elerheto[4]>=opts[4].value?opts[4].value:0);
		}
	}
	
	var kek=false;
	/*Forced?*/
	if (opts[5].checked && elerheto[4]<parseInt(opts[4].value)) {
		console.info('Forced not OK', opts[5].checked, '&&', elerheto[4], '<', parseInt(opts[4].value));
		ezt=adatok[1]+"|semmi";
	} else {
	
	/*Raktár túltelített?*/
	
	var nyersarany=((FARM_REF.game_data.village.wood+FARM_REF.game_data.village.stone+FARM_REF.game_data.village.iron) / 3) / FARM_REF.game_data.village.storage_max;
	/*debug("Illeszt","Nyersarány: "+Math.round(nyersarany*100)+", limit: "+parseInt(opts[10].value));*/
	if (Math.round(nyersarany*100)>parseInt(opts[10].value))  {
		ezt=adatok[1]+"|semmi";
		naplo('Farmoló', 'Raktár túltelített ebben a faluban: ' + adatok[2] + '. (' + Math.round(nyersarany*100) + '% > ' + parseInt(opts[10].value) + '%)');
	} else {
		/*MIN LIMIT!?*/
		/*console.info('Össz:', betesz_ossz, parseInt(opts[7].value), betesz_ossz>parseInt(opts[7].value));*/
		if (betesz_ossz>=parseInt(opts[7].value)) {
			if (parseInt(C_form.spy.value,10)>0 && farm_helye.cells[1].innerHTML=="") kek=true;
			
			/*debug("Farmolo()","Seregküldés "+adatok[3]+"-re. Nyers_faluba: "+adatok[4]+". Egység küldés: "+debugstr+". Teherbírás: "+debugzsak);*/
			if ((debugzsak-100)>adatok[4]) debug("Farmolo()","<b>ERROR: TOO MANY UNITS</b>");
			C_form.attack.click(); ezt=adatok[1]; 						
		} else {
			ezt=adatok[1]+"|semmi";
		}
	}}
	
	/*console.info('Beillesztve', [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]);*/
	return [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]; /*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;kém ment e;teherbírás*/
}catch(e){debug("Illeszto()",e);FARM_LEPES=0;return "";}}

function szem4_farmolo_3egyeztet(adatok){try{
	/*0: nyers_maradt; 1:all/gyalog/semmi; 2:honnan; 3:hova; 4:speed_slowest; 5:kekesit*/
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==adatok[3]) {farm_helye=farm_helye[i]; break;}
	}
	
	/*Piros szöveg*/
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].getAttribute("class")=="error_box") {
			naplo("Farmoló","Hiba "+adatok[3]+" farmolásánál: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].textContent+". Tovább nem támadom");
			farm_helye.cells[0].style.backgroundColor="red";
			FARM_LEPES=0;
			if (FARM_REF.document.querySelector('.village-item')) {
				FARM_REF.document.querySelector('.village-item').click();
			}
			return "";
		}
	}catch(e){/*debug("3()","Nincs hiba");*/}
	
	/*Játékos-e?*/	
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].getElementsByTagName("a")[0].href.indexOf("info_player")>-1) {
			if (!farm_helye.cells[4].getElementsByTagName("input")[0].checked) {
				naplo("Farmoló","Játékos "+maplink(adatok[3])+" helyen: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].innerHTML.replace("href",'target="_BLANK" href')+". Tovább nem támadom");
				farm_helye.cells[0].style.backgroundColor="red";
				FARM_LEPES=0;
				return "";
			}
		}
	}catch(e){/*debug("3()","Nincs játékos");*/}
	
	/*adatok[6]==teherbírás?. Egyezik?*/
	try{
		var a=FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows;
		a=parseInt(a[a.length-1].cells[0].textContent.replace(/[^0-9]+/g,""));
		/*debug("farm3","Teher: "+adatok[6]+"_Itteni teher: "+a);*/
		if (adatok[6]!=a) debug("farm3","Valódi teherbírás nem egyezik a kiszámolttal. Hiba, ha nincs teherbírást módosító \"eszköz\".");
	}catch(e){debug("farm3","Teherbírás megállapítás hiba: "+e);}
	
	hatszam=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10);
	if (adatok[1].indexOf("semmi")==-1 || adatok[6]>hatszam*2) {
		var opts=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
		if (adatok[5]) farm_helye.cells[1].style.backgroundColor="rgb(213, 188, 244)";

		addCurrentMovementToList(FARM_REF.document.getElementById('command-data-form'), adatok[3], farm_helye);
		FARM_REF.document.getElementById("troop_confirm_submit").click();
		farm_helye.cells[0].setAttribute("data-age",0);
	}
	//farm_helye.cells[3].innerHTML=adatok[0];
	if (adatok[1]=="all") var sarga=true; else var sarga=false;
	var nez=false; if (adatok[0]>25) nez=true;
	return [nez,sarga,adatok[2],adatok[3]];
	/*Legyen e 3. lépés;sárga hátteres idő lesz?;honnan;---*/
}catch(e){debug("szem4_farmolo_3egyeztet()",e); FARM_LEPES=0;}}

function szem4_farmolo_4visszaell(adatok){try{
	/*
		true,sarga?,honnan,hova
		vagy
		nyers_maradt(db);all/gyalog + semmi;honnan;hova;speed_slowest
	*/	
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	
	if (typeof adatok[1]=="boolean") var lehetEGyalog=adatok[1]; else {
		if (adatok[1].indexOf("all")>-1) var lehetEGyalog=true; else var lehetEGyalog=false;
	}

	if (lehetEGyalog) { /*Sárga; de ha nincs gyalog->fehér*/
		var backtest=false;
		for (var i=0;i<3;i++) {
			if (falu_helye.cells[1].getElementsByTagName("input")[i].checked) {
				if (FARM_REF.document.getElementById("unit_input_"+UNITS[i])) {
					if (parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0])>5) {
						backtest=true;
						break;
					}
				}
			}
		}
		if (!backtest) lehetEGyalog=false;
	} /*ellenben nézd meg van e bent ló amit lehet küldeni!?*/
	
	/*Leggyorsabb kijelölt egység*/
	var a=falu_helye.cells[1].getElementsByTagName("input");
	var fastest=22;
	for (var i=0;i<a.length;i++) {
		if (i==4) continue;
		if (a[i].checked && E_SEB[i]<fastest) fastest=E_SEB[i];
	}
	fastest = fastest*(1/SPEED)*(1/UNIT_S);
	
	/*Leghamarább visszaérő sereg FIXME: Csak nézd meg melyik a legelső visszatérő ikon a listába oszt bazd vissza azt+5mp*/
	/*var mozgas = getLastDate(FARM_REF,fastest);
	if (!(mozgas instanceof Date && !isNaN(mozgas.valueOf()))) {
		debug('Advanced error at #1', mozgas + " - Fastest: " + fastest);
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egység, vagy túltelített a raktár!.');
		sarga=false;
		var d = new Date();
		d.setMinutes(d.getMinutes()+(30*SPEED));
		falu_helye.cells[2].innerHTML=d;
		return;
	}*/
	
	var sarga=true;
	
	if (/*mozgas && */!lehetEGyalog) sarga=false;
	/*if (!mozgas && !lehetEGyalog) {
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egység, vagy túltelített a raktár!.');
		/*falu_helye.cells[0].style.backgroundColor="red"; FIXME
		sarga=false;
	} else falu_helye.cells[0].style.backgroundColor="#f4e4bc";*/
	
	var d=new Date();
	if (sarga) falu_helye.cells[2].style.backgroundColor="yellow"; else falu_helye.cells[2].style.backgroundColor="#f4e4bc";
	/*if (mozgas) {
		mozgas.setSeconds(mozgas.getSeconds() + 10);
		falu_helye.cells[2].innerHTML=mozgas;
	} else {*/
		// "Sebesség" beállítása pihenőidőnek
		d.setMinutes(d.getMinutes()+(parseInt( document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10) ));
		falu_helye.cells[2].innerHTML=d;
	/*}*/
}catch(e){debug("szem4_farmolo_4visszaell()",e); return;}}

function szem4_farmolo_motor(){try{
	var nexttime=500;
	nexttime=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[9].value,10);
	
	if (BOT||FARM_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	/*if (FARM_REF!="undefined" && FARM_REF.closed) FARM_LEPES=0;*/
	if (FARM_HIBA>10) {
		FARM_HIBA=0; FARM_GHIBA++; FARM_LEPES=0;
		if(FARM_GHIBA>3) {
			if (FARM_GHIBA>5) {
				naplo("Globál","Nincs internet? Folyamatos hiba farmolónál");
				nexttime=60000;
				playSound("bot2");
			}
			FARM_REF.close();
		}
	}
	switch (FARM_LEPES) {
		case 0: /*Meg kell nézni mi lesz a célpont, +nyitni a HONNAN-t.*/
				PM1=szem4_farmolo_1kereso();
				console.info('Case 0, PM1=', PM1);
				if (PM1=="zero") {nexttime=10000; break;} /*Ha nincs még tábla feltöltve*/
				if (PM1=="") {
						nexttime=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10)*60000;
						isPageLoaded(FARM_REF, -1);
						try{FARM_REF.document.title = 'Szem4/farmoló';}catch(e){}
						break;
				}
				if (!isPageLoaded(FARM_REF,koordTOid(PM1[2]),"screen=place")) {
					FARM_REF=windowOpener('farm', VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(PM1[2])).replace("screen=overview","screen=place"), AZON+"_Farmolo");
				}
				/*debug("Farmoló_ToStep1",PM1);*/
				FARM_LEPES=1;
				break;
		case 1: /*Gyül.helyen vagyunk, be kell illeszteni a megfelelő sereget, -nyers.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"screen=place")) {
					FARM_REF.document.title = 'Szem4/farmoló';
					FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_2illeszto(PM1);
					console.info("Case 1, PM1=", PM1);
					if (typeof(PM1)=="object" && PM1.length>0) {
						if (PM1[1].indexOf("semmi")>0) 
							FARM_LEPES=3;
						else
							FARM_LEPES=2;
					} else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 2: /*Confirm: nem e jött piros szöveg, játékos e -> OK-ézás.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_3egyeztet(PM1);
					if (typeof(PM1)=="object" && PM1.length>0 && PM1[0]==true) { FARM_LEPES=3; } else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 3: /*Támadás elküldve, időt és ID-t nézünk, ha kell.*/ 
				/*Kell e időt nézni? Kell, ha PM1[1].indexOf("semmi")>-1 VAGY PM1[0]=TRUE; */
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"not try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					szem4_farmolo_4visszaell(PM1);
					FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		default: FARM_LEPES=0;
	}}
}catch(e){debug("szem4_farmolo_motor()",e+" Lépés:"+FARM_LEPES);}

var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'farm', 'time': nexttime});
}catch(e){debug('farm', 'Worker engine error: ' + e);setTimeout(function(){szem4_farmolo_motor();}, 3000);}}

var KTID=new Array(), /*Koord-ID párosok*/
	TERMELES=new Array(5,30,35,41,47,55,64,74,86,100,117,136,158,184,214,249,289,337,391,455,530,616,717,833,969,1127,1311,1525,1774,2063,2400),
	UNITS=new Array("spear","sword","axe","archer","spy","light","marcher","heavy"),
	TEHER=new Array(25,15,10,10,0,80,50,50),
	TANYA=new Array(1,1,1,1,2,4,5,6),
	E_SEB=new Array(18,22,18,18,9,10,10,11),
	BOT=false,
	FARMOLO_TIMER,
	ALL_UNIT_MOVEMENT = {}, //{..., hova(koord): [[ mennyi_termelésből(teherbírás), mikorra(getTime()), mennyi_VIJE_miatt(teherbírás) ], ...], ...}
	ALL_SPY_MOVEMENTS = {}; // hova(koord): mikor
	
init();
ujkieg_hang("Alaphangok","naplobejegyzes;bot2");
ujkieg("farm","Farmoló",'<tr><td><table class="vis" id="farm_opts" style="width:100%; margin-bottom: 50px;"><tr><th>Farmoló falu hozzáadása</th><th>Farmolandó falu hozzáadása</th></tr><tr><td style="width:48%;" onmouseover="sugo(this,\'Adj meg koordinátákat, melyek a te faluid és farmolni szeretnél velük. A koordináták elválasztása bármivel történhet.\')">Koordináták: <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozzáad" onclick="add_farmolo()"></td><td style="width:52%;" onmouseover="sugo(this,\'Adj meg koordinátákat, amelyek farmok, és farmolni szeretnéd. A koordináták elválasztása bármivel történhet.\')">Koordináták:  <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozzáad" onclick="add_farmolando()"></td></tr><tr><td onmouseover="sugo(this,\'A felvivendő falukból ezeket az egységeket használhatja SZEM IV farmolás céljából. Később módosítható.\')" style="vertical-align:middle;">Mivel? '+rovidit("egysegek")+'</td><td>Termelés/óra: <input onkeypress="validate(event)" type="text" size="5" value="3600" onmouseover="sugo(this,\'Ha nincs felderített bányaszint, úgy veszi ennyi nyers termelődik\')"> Max táv: <input type="text" size="2" value="4" onkeypress="validate(event)" onmouseover="sugo(this,\'A max távolság, amin túl már nem küldök támadásokat\')">óra <input onkeypress="validate(event)" type="text" size="2" value="0" onmouseover="sugo(this,\'A max távolság, amin túl már nem küldök támadásokat\')">perc. Határszám: <input type="text" onkeypress="validate(event)" onmouseover="sugo(this,\'Az új farmok ennyi nyersanyaggal lesznek felvíve. Másrész, ez alatti nyersanyagért még nem indulok el.\')" value="3600" size="5"><br>Kém/falu: <input onkeypress="validate(event)" type="text" value="1" size="2" onmouseover="sugo(this,\'Minden támadással ennyi kém fog menni\')"> Kényszerített?<input type="checkbox" onmouseover="sugo(this,\'Kémek nélkül nem indít támadást, ha kéne küldenie az időlimit esetén. Kémeket annak ellenére is fog vinni, ha nincs bepipálva a kém egység.\')">Kém/perc: <input type="text" value="60" size="3" onmouseover="sugo(this,\'Max ekkora időközönként küld kémet falunként\')">&nbsp;&nbsp;Min sereg/falu: <input onkeypress="validate(event)" type="text" value="100" size="4" onmouseover="sugo(this,\'Ennél kevesebb fő támadásonként nem indul. A szám tanyahely szerinti foglalásban értendő.\')"><br>Sebesség: <input onkeypress="validate(event)" type="text" size="2" value="10" onmouseover="sugo(this,\'Ha a farmoló nem talál több feladatot magának megáll, ennyi időre. Érték lehet: 1-300. Javasolt érték: 10-120 perc\')">perc/<input onkeypress="validate(event)" type="text" size="3" value="500" onmouseover="sugo(this,\'Egyes utasítások/lapbetöltődések ennyi időközönként hajtódnak végre. Érték lehet: 200-6000. Javasolt: 500ms, lassabb gépek esetén 1000-2000.\')">ms. Ha a raktár &gt;<input type="text" size="2" onmouseover="sugo(this,\'Figyeli a raktár telítettségét, és ha a megadott % fölé emelkedik, nem indít támadást onnan. Telítettség össznyersanyag alapján számolva. Min: 20. Ne nézze: 100-nál több érték megadása esetén.\')" value="90">%, nem foszt.</td></tr></table>  <table class="vis" id="farm_honnan" style="vertical-align:top; display: inline-block; width:550px"><tr><th width="55px" onmouseover="sugo(this,\'Ezen falukból farmolsz. Dupla klikk az érintett sor koordinátájára=sor törlése.<br>Rendezhető\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_honnan",0)\'>Honnan</th><th onmouseover="sugo(this,\'Ezen egységeket használ fel SZEM a farmoláshoz. Bármikor módosítható.\')">Mivel?</th><th onmouseover="sugo(this,\'Ekkor ér vissza sereg a számításaim szerint. Dupla klikk=törlés=már megérkezett/nézd újra.<br>Rendezhető.<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.\')" onclick=\'rendez("datum",false,this,"farm_honnan",2)\' style="cursor: pointer; vertical-align:middle;">Return <span style="margin-left: 45px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'honnan\')"><input type="checkbox" id="farm_multi_honnan" onmouseover="sugo(this,\'Ha bepipálod, akkor egy cellán végzett dupla klikkes művelet minden sorra érvényes lesz az adott oszlopba (tehát minden falura), ami jelenleg látszik. Légy óvatos!\')"></span></th></tr></table> <table class="vis" id="farm_hova" style="vertical-align:top; display: inline-block;"><tr><th onmouseover="sugo(this,\'Ezen falukat farmolod. A háttérszín jelöli a jelentés színét: alapértelmezett=zöld jelik/nincs felderítve. Sárga=veszteség volt a falun. Piros: a támadás besült, nem megy rá több támadás.<br>Dupla klikk a koordira: a háttérszín alapértelmezettre állítása.<br>Rendezhető\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_hova",0)\'>Hova</th><th onmouseover="sugo(this,\'Felderített bányaszintek, ha van. Kék háttér: megy rá kémtámadás.<br>Dupla klikk=az érintett sor törlése\')">Bányák</th><th onmouseover="sugo(this,\'Fal szintje. Dupla klikk=háttér csere (csak megjelölésként). <br>Rendezhető.\')" onclick=\'rendez("szam",false,this,"farm_hova",2)\' style="cursor: pointer;">Fal</th><th onmouseover="sugo(this,\'Számítások szerint ennyi nyers van az érintett faluba. Dupla klikk=érték módosítása.<br>Rendezhető.\')" onclick=\'rendez("szam",false,this,"farm_hova",3)\' style="cursor: pointer;">Nyers</th><th onmouseover="sugo(this,\'Játékos e? Ha játékost szeretnél támadni, pipáld be a falut mint játékos uralta, így támadni fogja. Ellenben piros hátteret kap a falu.\')">J?</th><th onmouseover="sugo(this,\'Üres oszlop, jelenleg nincs használatban<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.\')" style="cursor: pointer; vertical-align:middle;">---<span style="margin-left: 65px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'hova\')"><input type="checkbox" id="farm_multi_hova"></span></th></tr></table></p></td></tr>');
/*Table IDs:  farm_opts; farm_honnan; farm_hova*/
var FARM_LEPES=0, FARM_REF, FARM_HIBA=0, FARM_GHIBA=0,
	PM1, FARM_PAUSE=true;
szem4_farmolo_motor();

function VIJE_FarmElem(koord){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	var BenneVanE=false;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==koord) {BenneVanE=true; farm_helye=farm_helye[i]; break;}
	}
	if (!BenneVanE) return [false,false,0];
	
	var BanyaVanE=true;
	if (farm_helye.cells[1].textContent=="") BanyaVanE=false;
	
	var d=getServerTime(VIJE_REF1);
	d.setMinutes(d.getMinutes()-1);
	return [BenneVanE,BanyaVanE,d];
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function VIJE_elemzett(jid){try{
	var a=document.getElementById("VIJE_elemzett").textContent;
	if (a=="") return false;
	a=a.split(",");
	for (var i=0;i<a.length;i++) {
		if (a[i]==jid) return true;
	}
	if (a.length>130) document.getElementById("VIJE_elemzett").innerHTML=a.slice(a.length-100,a.length);
	return false;
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function szem4_VIJE_1kivalaszt(){try{
	/*Eredménye: jelentés azon;célpont koord;jelentés SZÍNe;volt e checkbox-olt jeli*/
	try{TamadUpdt(VIJE_REF1);}catch(e){}
	VT=VIJE_REF1.document.getElementById("report_list").rows;
	if (VT.length<3) return [0,0,"",false];
	var vane=false;
	for (var i=VT.length-2;i>0;i--) {
		try{var koord=VT[i].cells[1].textContent.match(/[0-9]+(\|)[0-9]+/g);
		koord=koord[koord.length-1];}catch(e){continue;}
		var jid=VT[i].cells[1].getElementsByTagName("span")[0].getAttribute("data-id").replace("label_","");
		if (VIJE_elemzett(jid)) continue;
		var szin=VT[i].cells[1].childNodes;
		for (var s=0;s<szin.length;s++) {
			if (szin[s].nodeName=="IMG") {szin=szin[s].src.split(".png")[0].split("/"); szin=szin[szin.length-1]; break;}
		}
		var eredm=VIJE_FarmElem(koord); /*BenneVanE,VanEBanyaSzint,ut. támadás ideje*/
		if (eredm[0]==false) continue;
		/*+++IDŐ*/
		var d=getServerTime(VIJE_REF1); var d2=getServerTime(VIJE_REF1);
		if (eredm[2]>d) {/*debug("VIJE1()",jid+":"+koord+"-et nem nézem, mert van rá \"nagy\" támadás.");*/ continue;}
		
		(function convertDate() {
			var ido = VT[i].cells[2].textContent;
			var oraperc=ido.match(/[0-9]+:[0-9]+/g)[0];
			var nap=ido.replace(oraperc,"").match(/[0-9]+/g)[0];
			d.setMinutes(parseInt(oraperc.split(":")[1],10));
			d.setHours(parseInt(oraperc.split(":")[0],10));
			d.setDate(parseInt(nap,10));
		})();
		
		/*debug("VIJE1()","Ezt nézem: koord "+koord+". Idő: "+d+", most: "+d2+". Különbség: "+(d2-d));*/
		if ((d2-d) > 10800000 || (d2-d) < 0) var regi=true; else var regi=false; /*3 óra*/
		if (eredm[1]==false) { vane=true; break;}
		if (regi) continue;
		if (eredm[1]==true) { /*bányaszint ismert, de elemezni kell*/
			vane=true; break;
		}
	}
	if (!vane) {
		for (var i=VT.length-2;i>0;i--) {
			if (VT[i].cells[0].getElementsByTagName("input")[0].checked) return [0,0,"",true];
		}
		return [0,0,"",false];
	} /*Ha nincs talált jeli --> nézd meg volt e checkboxolt, és ha igen, akkor a 4. PM=true;*/
	
	if (szin=="green") VT[i].cells[0].getElementsByTagName("input")[0].checked=true;
	/*debug("VIJE_1()","Megvan a jeli amit nézni kell majd! Koord: "+koord+" ID="+jid);*/
	return [jid,koord,szin,false,regi];
}catch(e){debug("VIJE1","Hiba: "+e);return [0,0,"",false];}}

function VIJE_adatbeir(koord,nyers,banya,fal,szin, hungarianDate){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==koord) {farm_helye=farm_helye[i]; break;}
	}
	farm_helye.cells[0].setAttribute("data-age",0);
	if (banya!=="") 	{farm_helye.cells[1].innerHTML=banya; farm_helye.cells[1].backgroundColor="#f4e4bc"; if(fal=="") fal=0;}
	if (fal!=="") {
		if (parseInt(farm_helye.cells[2].innerHTML)!==parseInt(fal))
			farm_helye.cells[2].backgroundColor="#f4e4bc";
		farm_helye.cells[2].innerHTML=fal;
	}
	if (nyers!=="")	{
		farm_helye.cells[3].innerHTML=nyers; 
		if (nyers>parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10)*50)
			naplo("VIJE_adatbeír","Sok nyers van itt, lehet hiba? "+koord+" falunál: ", nyers);
	}
	if (szin==="green") farm_helye.cells[0].style.backgroundColor="#f4e4bc"; else 
	if (szin==="yellow") farm_helye.cells[0].style.backgroundColor="yellow"; else 
	if (szin!="blue") {
		farm_helye.cells[0].style.backgroundColor="red";
		naplo("Jelentés Elemző",koord+" farm veszélyesnek ítélve. Jelentésének színe "+szin+".");
	}

	// Mockolt támadás beillesztése ha nem regisztrált támadásról jött jelentés
	var allAttack = ALL_UNIT_MOVEMENT[koord];
	if (!allAttack) ALL_UNIT_MOVEMENT[koord] = [[10000, hungarianDate, 0]];
	else {
		var smallestDifference = null;
		ALL_UNIT_MOVEMENT[koord].forEach(arr => {
			var difference = Math.abs(arr[1] - hungarianDate);
			if (!smallestDifference || difference < smallestDifference) {
				smallestDifference = difference;
			}
		});
		if (smallestDifference > 60000) ALL_UNIT_MOVEMENT[koord].push([10000, hungarianDate, 0])
	}
	if (nyers!=='') ALL_VIJE_SAVED[koord] = hungarianDate.getTime();
}catch(e){debug("VIJE_adatbeir","Hiba: "+e);}}
function szem4_VIJE_2elemzes(adatok){try{
	/*Adatok: [0]jelentés azon;[1]célpont koord;[2]jelentés SZÍNe;[3]volt e checkbox-olt jeli;[4]régi jeli e? (igen->nincs nyerselem)*/
	var nyersossz=0;
	var isOld = false;
	var reportTable=VIJE_REF2.document.getElementById("attack_info_att").parentNode;
	while (reportTable.nodeName != 'TABLE') {
		reportTable = reportTable.parentNode;
	}
	var hungarianDate = reportTable.rows[1].cells[1].innerText;
	var defUnits = VIJE_REF2.document.getElementById('attack_info_def_units');
	if (defUnits && defUnits.textContent.match(/[1-9]+/g)) adatok[2] = 'Sereg a faluban!';
	hungarianDate = new Date(Date.parse(hungarianDate.replace(/jan\./g, "Jan").replace(/febr?\./g, "Feb").replace(/márc\./g, "Mar").replace(/ápr\./g, "Apr").replace(/máj\./g, "May").replace(/jún\./g, "Jun").replace(/júl\./g, "Jul").replace(/aug\./g, "Aug").replace(/szept\./g, "Sep").replace(/okt\./g, "Oct").replace(/nov\./g, "Nov").replace(/dec\./g, "Dec")));
	if (ALL_VIJE_SAVED[adatok[1]] >= hungarianDate.getTime()) isOld = true;
	if (!isOld && VIJE_REF2.document.getElementById("attack_spy_resources")) {
		var x=VIJE_REF2.document.getElementById("attack_spy_resources").rows[0].cells[1];
		if (adatok[4]) {var nyersossz="";debug("VIJE2","Nem kell elemezni (régi)"); } else {
			try{
				if (/\d/.test(x.textContent)) {
					var nyers=x.textContent.replace(/\./g,"").match(/[0-9]+/g); 
					var nyersossz=0;
					for (var i=0;i<nyers.length;i++) nyersossz+=parseInt(nyers[i],10);
				} else {
					nyersossz=0;
				}
			}catch(e){var nyersossz=0; debug("VIJE","<a href='"+VIJE_REF2.document.location+"' target='_BLANK'>"+adatok[0]+"</a> ID-jű jelentés nem szokványos, talált nyers 0-ra állítva. Hiba: "+e);}
		}
	
		// Épületek
		if (VIJE_REF2.document.getElementById("attack_spy_buildings_left")) {
			var i18nBuildings=document.getElementById("vije_opts");
			const spyLevels = {
				wood: 0,
				stone: 0,
				iron: 0,
				wall: 0,
				main: 1,
				barracks: 0
			}
			
			var spyBuildingRows_left=VIJE_REF2.document.getElementById("attack_spy_buildings_left").rows;
			var spyBuildingRows_right=VIJE_REF2.document.getElementById("attack_spy_buildings_right").rows;
			for (var i=1;i<spyBuildingRows_left.length;i++) {
				let buildingName_l = spyBuildingRows_left[i].cells[0].textContent.toUpperCase();
				let buildingName_r = spyBuildingRows_right[i].cells[0].textContent.toUpperCase();
				for (const key in spyLevels) {
					if (buildingName_l.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_left[i].cells[1].textContent,10);
					if (buildingName_r.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_right[i].cells[1].textContent,10);
				}
			}
			if (spyLevels.wall == 0) {
				if (spyLevels.barracks == 0) spyLevels.wall--;
				if (spyLevels.main == 2) spyLevels.wall--;
				if (spyLevels.main == 1) spyLevels.wall-=2;
			}
			var banyak = [spyLevels.wood, spyLevels.stone, spyLevels.iron];
			var fal = spyLevels.wall;
		} else { /*Csak nyerset láttunk*/
			var banyak = "";
			var fal = "";
		}
		VIJE_adatbeir(adatok[1],nyersossz,banyak,fal,adatok[2], hungarianDate);
	} else if (!isOld) {
		var atkTable = VIJE_REF2.document.getElementById('attack_results');
		var fosztogatas = atkTable?atkTable.rows[0].cells[2].innerText.split('/').map(item => parseInt(item,10)):0;
		var nyers = '';
		if (fosztogatas[0] != fosztogatas[1]) nyers=0;
		VIJE_adatbeir(adatok[1],nyers,"","",adatok[2], hungarianDate);
	}
	
	/*Tedd be az elemzettek listájába az ID-t*/
	document.getElementById("VIJE_elemzett").innerHTML+=adatok[0]+",";
	if (document.getElementById("VIJE_elemzett").innerHTML.split(",").length>200) {
		document.getElementById("VIJE_elemzett").innerHTML=document.getElementById("VIJE_elemzett").innerHTML.split(",").splice(100,100)+",";
	}
	
	return true;
}catch(e){debug("VIJE2","Elemezhetetlen jelentés: "+adatok[0]+":"+adatok[1]+". Hiba: "+e); VIJE_adatbeir(adatok[1],nyersossz,"","",adatok[2]); return false;}}

function szem4_VIJE_3torol(){try{
	if (document.getElementById("vije").getElementsByTagName("input")[4].checked) {
		try{VIJE_REF1.document.forms[0].del.click();}catch(e){VIJE_REF1.document.getElementsByName("del")[0].click();}
	}
}catch(e){debug("VIJE3","Hiba: "+e);return;}}

function szem4_VIJE_motor(){try{
	var nexttime=1500;
	if (VIJE_PAUSE) clearAttacks();
	if (BOT||VIJE_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	if (VIJE_HIBA>10) {
		VIJE_HIBA=0; VIJE_GHIBA++; 
		if(VIJE_GHIBA>3) {
			if (VIJE_GHIBA>5) {
				naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); nexttime=60000; playSound("bot2");
			}
			debug('szem4_VIJE_motor', 'Jelentés elemzo hiba >3, ablak bezár/újranyit');
			VIJE_REF1.close();
		} VIJE_LEPES=0;
	}
	
	if (VIJE2_HIBA>10) {VIJE2_HIBA=0; VIJE2_GHIBA++; if(VIJE2_GHIBA>3) {if (VIJE2_GHIBA>5) naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); VIJE_REF2.close();} VIJE_LEPES=0;}
	if (!VIJE_REF1 || (VIJE_LEPES!=0 && VIJE_REF1.closed)) VIJE_LEPES=0;
	
	
	switch(VIJE_LEPES) {
		case 0: /*Támadói jelentések megnyitása*/
			if (document.getElementById("farm_hova").rows.length>1) {
			var csoport="";
			if (game_data.player.premium) csoport="group_id=-1&";
			VIJE_REF1=windowOpener('vije', VILL1ST.replace("screen=overview","mode=attack&"+csoport+"screen=report"), AZON+"_SZEM4VIJE_1");
			VIJE_LEPES=1;
			} else nexttime=10000;
			break;
		case 1: /*Megnyitandó jelentés kiválasztás(+bepipálás)*/
			if (isPageLoaded(VIJE_REF1,-1,"screen=report")) {
				VIJE_HIBA=0; VIJE_GHIBA=0;
				PM2=szem4_VIJE_1kivalaszt();
				if (PM2[0]===0) { // Nincs meló
					if (PM2[3]) VIJE_LEPES=3; else {VIJE_LEPES=0; nexttime=120000;}
				} else {
					VIJE_REF2=windowOpener('vije2', VILL1ST.replace("screen=overview","mode=attack&view="+PM2[0]+"&screen=report"), AZON+"_SZEM4VIJE_2");
					VIJE_LEPES=2;
				}
				VIJE_REF1.document.title = 'Szem4/vije1';
			} else { VIJE_HIBA++;}
			break;
		case 2: /*Megnyitott jelentés elemzése*/
			if (isPageLoaded(VIJE_REF2,-1,PM2[0])) {
				clearAttacks();
				VIJE2_HIBA=0; VIJE2_GHIBA=0;
				szem4_VIJE_2elemzes(PM2);
				if (PM2[3]) VIJE_LEPES=3; else VIJE_LEPES=1;
				VIJE_REF2.document.title = 'Szem4/vije2';
			} else { VIJE2_HIBA++;}
			break;
		case 3: /*bepipált jelentések törlése*/
			szem4_VIJE_3torol();
			VIJE_LEPES=0;
			break;
		default: VIJE_LEPES=0;
	}}
}catch(e){debug("szem4_VIJE_motor()","ERROR: "+e+" Lépés:"+VIJE_LEPES);}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'vije', 'time': nexttime});
}catch(e){debug('vije', 'Worker engine error: ' + e);setTimeout(function(){szem4_VIJE_motor();}, 3000);}}
/*VIJE*/
ujkieg("vije","Jelentés Elemző",`<tr><td>
	A VIJE a Farmoló táblázatába dolgozik, itt csupán működési beállításokat módosíthatsz.
	<form id="vije_opts">
	<table class="szem4_vije_optsTable">
		<tr><td>"Fatelep" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wood" value="Fatelep"></td></tr>
		<tr><td>"Agyagbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="stone" value="Agyagbánya"></td></tr>
		<tr><td>"Vasbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="iron" value="Vasbánya"></td></tr>
		<tr><td>"Fal" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wall" value="Fal"></td></tr>
		<tr><td>"Főhadiszállás" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="main" value="Főhadiszállás"></td></tr>
		<tr><td>"Barakk" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="barracks" value="Barakk"></td></tr>
	</table>
	<input type="checkbox"> Zöld farmjelentések törlése?<br><br><br>
	</form>
	<i>Elemzett jelentések:</i><div id="VIJE_elemzett" style="font-size:30%;width:980px;word-wrap: break-word;"></div></td></tr>`);

var VIJE_PAUSE=true;
var VIJE_LEPES=0;
var VIJE_REF1; var VIJE_REF2;
var VIJE_HIBA=0; var VIJE_GHIBA=0;
var VIJE2_HIBA=0; var VIJE2_GHIBA=0;
var ALL_VIJE_SAVED = {}; // coord: date
var PM2;
szem4_VIJE_motor();

/*-----------------TÁMADÁS FIGYELŐ--------------------*/

function TamadUpdt(lap){try{
	var table=document.getElementById("idtamad_Bejovok");
	var d=new Date();
	var jelenlegi=parseInt(lap.game_data.player.incomings,10);
	var eddigi=0;
	if (table.rows.length>1) eddigi=parseInt(table.rows[1].cells[1].innerHTML,10);
	if (jelenlegi==eddigi) return;
	
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	cell1.innerHTML=d;
	cell2.innerHTML=jelenlegi;
	
	if (jelenlegi>eddigi) playSound("bejovo"); /*replace: ATTACK SOUND!*/
	return;
}catch(e){debug("ID beir","Hiba: "+e);}}

ujkieg_hang("Bejövő támadások","bejovo");
ujkieg("idtamad","Bejövő támadások",'<tr><td align="center" ><table class="vis" id="idtamad_Bejovok" style="vertical-align:top; display: inline-block;"><tr><th>Időpont</th><th>Támadások száma</th></tr></table> </td></tr>');


/*-----------------ÉPÍTŐ--------------------*/
function szem4_EPITO_perccsokkento(){try{
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	var patt=/[0-9]+( perc)/g; var sz=0;
	for (var i=1;i<hely.length;i++) {
		if (hely[i].cells[3].textContent.search(patt)>-1) {
			sz=hely[i].cells[3].textContent.match(/[0-9]+/g)[0];
			if (sz=="0") continue;
			sz=parseInt(sz,10); 
			sz--;
			if (sz>0) {
				sz=sz+"";
				if (sz.length==1) sz="000"+sz;
				if (sz.length==2) sz="00"+sz;
				if (sz.length==3) sz="0"+sz;
			}
			hely[i].cells[3].innerHTML=hely[i].cells[3].innerHTML.replace(/[0-9]+/,sz);
		}
	}
}catch(e){debug("Építő_pcsökk",e); setTimeout("szem4_EPITO_perccsokkento()",60000);}}

function szem4_EPITO_getlista(){try{
	var ret='<select>';
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		ret+='<option value="'+Z[i].cells[0].textContent+'">'+Z[i].cells[0].textContent+'</option> ';
	}
	ret+='</select>'; 
	return ret;
}catch(e){debug("Építő",e);}}

function szem4_EPITO_csopDelete(ezt){try{
	var name=ezt.innerHTML;
	if (!confirm("Biztos kitörlöd a "+name+" nevű csoportot?\nA csoportot használó faluk az Alapértelmezett csoportba fognak tartozni.")) return;
	sortorol(ezt,"");
	var bodyTable=document.getElementById("epit_lista").rows;
	for (var i=1;i<bodyTable.length;i++) {
		var selectedElement=bodyTable[i].cells[1].getElementsByTagName("select")[0];
		if (selectedElement.value==name) selectedElement.value=document.getElementById("epit").getElementsByTagName("table")[0].rows[1].cells[0].innerHTML;
	}
	bodyTable=document.getElementById("epit_ujfalu_adat").getElementsByTagName("option");
	for (var i=0;i<bodyTable.length;i++) {
		if (bodyTable[i].value==name) {
			document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0].remove(i);
			break;
		}
	}
}catch(e){alert2("Hiba:\n"+e);}}

function szem4_EPITO_ujFalu(){try{
	var adat=document.getElementById("epit_ujfalu_adat");
	var f_nev=adat.getElementsByTagName("input")[0].value;
	if (f_nev=="" || f_nev==null) return;
	f_nev=f_nev.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
	var Z=document.getElementById("epit_lista"); var str="";
	var lista=szem4_EPITO_getlista();
	for (var i=0;i<f_nev.length;i++) {
		var vane=false;
		for (var j=1;j<Z.rows.length;j++) {
			if (Z.rows[j].cells[0].textContent==f_nev[i]) vane=true;
		} if (vane) {str+="DUP:"+f_nev[i]+", "; continue;}
		if (koordTOid(f_nev[i])==0) {str+="NL: "+f_nev[i]+", "; continue;}
		
		var ZR=Z.insertRow(-1);
		var ZC=ZR.insertCell(0); ZC.innerHTML=f_nev[i]; ZC.setAttribute("ondblclick","sortorol(this)");
			ZC=ZR.insertCell(1); ZC.innerHTML=lista; ZC.getElementsByTagName("select")[0].value=adat.getElementsByTagName("select")[0].value;
			ZC=ZR.insertCell(2); ZC.style.fontSize="x-small"; var d=new Date(); ZC.innerHTML=d; ZC.setAttribute("ondblclick","szem4_EPITO_most(this)");
			ZC=ZR.insertCell(3); ZC.innerHTML="<i>Feldolgozás alatt...</i>"+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+koordTOid(f_nev[i])).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';; ZC.setAttribute("ondblclick",'szem4_EPITO_infoCell(this.parentNode,\'alap\',"")');
	}
	if (str!="") alert2("Dupla megadások/nem létező faluk kiszűrve: "+str);
	adat.getElementsByTagName("input")[0].value="";
	return;
}catch(e){alert2("Új falu(k) felvételekori hiba:\n"+e);}}

function szem4_EPITO_ujCsop(){try{
	var cs_nev=document.getElementById("epit_ujcsopnev").value.replace(/[;\._]/g,"").replace(/( )+/g," ");;
	if (cs_nev=="" || cs_nev==null) return;
	var Z=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=1;i<Z.rows.length;i++) {
		if (Z.rows[i].cells[0].textContent==cs_nev) throw "Már létezik ilyen nevű csoport";
	}
	var ZR=Z.insertRow(-1);
	var ZC=ZR.insertCell(0); ZC.innerHTML=cs_nev; ZC.setAttribute("ondblclick","szem4_EPITO_csopDelete(this)");
		ZC=ZR.insertCell(1); ZC.innerHTML=Z.rows[1].cells[1].innerHTML; ZC.getElementsByTagName("input")[0].disabled=false;
	
	var Z=document.getElementById("epit_lista").rows;
	for (var i=1;i<Z.length;i++) {
		var Z2=Z[i].cells[1].getElementsByTagName("select")[0];
		var option=document.createElement("option");
		option.text=cs_nev;
		Z2.add(option);
	}
	Z2=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	option=document.createElement("option");
	option.text=cs_nev;
	Z2.add(option);
	document.getElementById("epit_ujcsopnev").value="";
	return;
}catch(e){alert2("Új csoport felvételekori hiba:\n"+e);}}

function szem4_EPITO_cscheck(alma){try{
	var Z=alma.parentNode.getElementsByTagName("input")[0].value;
	Z=Z.split(";");
	
	var epuletek=new Array("main","barracks","stable","garage","church_f","church","smith","snob","place","statue","market","wood","stone","iron","farm","storage","hide","wall","MINES");
	for (var i=0;i<Z.length;i++) {
		if (epuletek.indexOf(Z[i].match(/[a-zA-Z]+/g)[0])>-1) {} else throw "Nincs ilyen épület: "+Z[i].match(/[a-zA-Z]+/g)[0];
		if (parseInt(Z[i].match(/[0-9]+/g)[0])>30) throw "Túl magas épületszint: "+Z[i];
	}
	alert2("Minden OK");
}catch(e){alert2("Hibás lista:\n"+e);}}

function szem4_EPITO_most(objektum){try{
	var d=new Date();
	objektum.innerHTML=d;
	return;
}catch(e){alert2("Hiba lépett fel:\n"+e);}}

function szem4_EPITO_csopToList(csoport){try{
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		if (Z[i].cells[0].textContent==csoport) return Z[i].cells[1].getElementsByTagName("input")[0].value;
	}
	return ";";
}catch(e){debug("epito_csopToList",e);}}

function szem4_EPITO_Wopen(){try{
	/*Eredmény: faluID, teljes építendő lista, pointer a sorra*/
	var TT=document.getElementById("epit_lista").rows;
	var now=new Date();
	for (var i=1;i<TT.length;i++) {
		var datum=new Date(TT[i].cells[2].textContent);
		if (datum<now) {
			var lista=szem4_EPITO_csopToList(TT[i].cells[1].getElementsByTagName("select")[0].value);
			return [koordTOid(TT[i].cells[0].textContent),lista,TT[i]];
		}
	}
	return [0,";"];
}catch(e){debug("Epito_Wopen",e);}}

function szem4_EPITO_addIdo(sor, perc){try{
	if (perc == "del") {
		document.getElementById("epit_lista").deleteRow(sor.rowIndex);
	} else {
		if (perc == 0) perc = 30;
		var d=new Date();
		d.setMinutes(d.getMinutes()+Math.round(perc));
		sor.cells[2].innerHTML=d;
	}
}catch(e){debug("epito_addIdo",e); return false;}}

function szem4_EPITO_infoCell(sor,szin,info){try{
	if (szin=="alap") szin="#f4e4bc";
	if (szin=="blue") szin="#44F";
	if (szin=="red") setTimeout('playSound("kritikus_hiba")',2000);
	sor.cells[3].style.backgroundColor=szin;
	
	sor.cells[3].innerHTML=info+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+koordTOid(sor.cells[0].textContent)).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';
	return;
}catch(e){debug("építő_infoCell",e);}}

function szem4_EPITO_getBuildLink(ref, type) {
  var row = ref.document.getElementById('main_buildrow_' + type);
  if (row.cells.length < 3) return false;
  var patt = new RegExp('main_buildlink_'+type+'_[0-9]+','g');
  var allItem = row.getElementsByTagName("*");
  for (var i=0;i<allItem.length;i++) {
    if (patt.test(allItem[i].id)) {
      return allItem[i];
    }
  }
}

function szem4_EPITO_IntettiBuild(buildOrder){try{
	try{TamadUpdt(EPIT_REF);}catch(e){}
	var buildList=""; /*Current BuildingList IDs*/
	var allBuildTime=0; /*Ennyi perc építési idő, csak kiírás végett*/
	var firstBuildTime=0; /*Az első épület építési ideje*/
	var textTime;

	try{
		if (!EPIT_REF.document.getElementById("buildqueue")) throw 'No queue';
		var buildQueueRows=EPIT_REF.document.getElementById("buildqueue").rows;
		for (var i=1;i<buildQueueRows.length;i++) {try{
			buildList+=buildQueueRows[i].cells[0].getElementsByTagName("img")[0].src.match(/[A-Za-z0-9]+\.(png)/g)[0].replace(/[0-9]+/g,"").replace(".png","");
			textTime=buildQueueRows[i].cells[1].textContent.split(":");
			allBuildTime+=parseInt(textTime[0])*60+parseInt(textTime[1])+(parseInt(textTime[2])/60);
			if (firstBuildTime==0) firstBuildTime=allBuildTime;
			buildList+=";";
		}catch(e){}}

		allBuildTime=Math.round(allBuildTime);
		allBuildTime=allBuildTime+"";
		if (allBuildTime!="0") {
			if (allBuildTime.length==1) allBuildTime="000"+allBuildTime;
			if (allBuildTime.length==2) allBuildTime="00"+allBuildTime;
			if (allBuildTime.length==3) allBuildTime="0"+allBuildTime;
		}
		firstBuildTime = Math.ceil(firstBuildTime);
		if (firstBuildTime>180) firstBuildTime=180;
	}catch(e){var buildList=";"; var allBuildTime=0; var firstBuildTime=0;}
	
	if (buildList == '') buildList = ';';
	buildList=buildList.split(";");
	buildList.pop();
	if (buildList.length>4) {
		szem4_EPITO_infoCell(PMEP[2],"alap","Építési sor megtelt. Építés még"+allBuildTime+" percig.");
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime);
		return;
	}
	
	/* Jelenlegi épületszintek kiszámítása építési sorral együtt */
	let currentBuildLvls=EPIT_REF.game_data.village.buildings;
	currentBuildLvls = Object.fromEntries(Object.entries(currentBuildLvls).map(([key, value]) => [key, parseInt(value)]));
	
	for (var i=0;i<buildList.length;i++) {
		currentBuildLvls[buildList[i]]++;
	}

	/* Következő építendő épület meghatározása */
	var nextToBuild = '';
	var buildOrderArr=buildOrder.split(";");
	for (var i=0;i<buildOrderArr.length;i++) {
		let cel = buildOrderArr[i].split(' ');
		cel[1] = parseInt(cel[1]);
		if (cel[0] == 'MINES') {
			let smallest = 31;
			if (currentBuildLvls['wood'] < cel[1]) {
				smallest = currentBuildLvls['wood'];
				nextToBuild = 'wood';
			}
			if (currentBuildLvls['stone'] < cel[1] && currentBuildLvls['stone'] < smallest) {
				smallest = currentBuildLvls['stone'];
				nextToBuild = 'stone';
			}
			if (currentBuildLvls['iron'] < cel[1] && currentBuildLvls['iron'] < smallest) {
				smallest = currentBuildLvls['iron'];
				nextToBuild = 'iron';
			}
			if (nextToBuild != '') break;
		}
		// TODO: FASTEST
		if (currentBuildLvls[cel[0]] < cel[1]) {
			nextToBuild = cel[0];
			break;
		}
	}

	/* Minden épület kész */
	if (nextToBuild == '') {
		naplo("Építő",'<a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+PMEP[0])+'" target="_BLANK">'+EPIT_REF.game_data.village.name+" ("+EPIT_REF.game_data.village.x+"|"+EPIT_REF.game_data.village.y+")</a> falu teljesen felépült és törlődött a listából");
		setTimeout(() => playSound("falu_kesz"), 1500);
		szem4_EPITO_addIdo(PMEP[2],"del");
		return;
	}

	/* Cél szükségeletének lekérése */
	var nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
	if (!nextToBuildRow) {
		szem4_EPITO_infoCell(PMEP[2],firstBuildTime==0?"red":"yellow", nextToBuild+" nem építhető. Előfeltétel szükséges? Építés még "+allBuildTime+" percig.");
		szem4_EPITO_addIdo(PMEP[2], firstBuildTime>0?firstBuildTime:60);
		return;
	}
	var resNeed = {
		wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
		stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
		iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
		pop: parseInt(nextToBuildRow.cells[5].textContent.match(/[0-9]+/g),10)
	}
	if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) nextToBuild = 'storage+';
	if (resNeed.pop > (EPIT_REF.game_data.village.pop_max - EPIT_REF.game_data.village.pop)) nextToBuild = 'farm+';
	if (nextToBuild == 'farm+' && EPIT_REF.game_data.village.buildings.farm == 30) {
		szem4_EPITO_infoCell(PMEP[2],"red","Tanya megtelt, építés nem folytatható. Építés még "+allBuildTime+" percig.");
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' && buildList.includes('farm')) {
		szem4_EPITO_infoCell(PMEP[2],'yellow', 'Tanya megtelt, de már építés alatt... Építés még '+allBuildTime+' percig.');
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' || nextToBuild == 'storage+') {
		nextToBuild = nextToBuild.slice(0, -1);
		nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
		resNeed = {
			wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
			stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
			iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
			pop: 0
		}
		// Farm kéne, de raktár nincs hozzá ~>
		if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) {
			nextToBuild = 'storage';
			nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
			resNeed = {
				wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
				stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
				iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
				pop: 0
			}
		}
	}

	if (EPIT_REF.game_data.village.wood < resNeed.wood || EPIT_REF.game_data.village.stone < resNeed.stone || EPIT_REF.game_data.village.iron < resNeed.iron) {
		szem4_EPITO_infoCell(PMEP[2],"yellow","Nyersanyag hiány lépett fel. Építés még "+allBuildTime+" percig.");
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?Math.min(firstBuildTime, 60):60);
		return;
	} 

	/* Minden rendben, építhető, klikk */
	szem4_EPITO_infoCell(PMEP[2],"alap","Építés folyamatban.");
	var buildBtn = nextToBuildRow.querySelector('.btn.btn-build');
	if (buildBtn.style.display == 'none') {
		if (buildList.length < 2) {
			szem4_EPITO_infoCell(PMEP[2],"red","Ismeretlen hiba. Építés még "+allBuildTime+" percig.");
		} else {
			szem4_EPITO_infoCell(PMEP[2],"alap","Építkezési sor megtelt. Építés még "+allBuildTime+" percig.");
		}
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?firstBuildTime:60);
		return;
	}
	buildBtn.click();
	playSound("epites");
}catch(e){debug("epit_IntelliB",e);}}

function szem4_EPITO_motor(){try{
	var nexttime=2000;
	if (BOT||EPIT_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	if (EPIT_HIBA>10) {EPIT_HIBA=0; EPIT_GHIBA++; if(EPIT_GHIBA>3) {if (EPIT_GHIBA>5) {naplo("Globál","Nincs internet? Folyamatos hiba az építőnél"); nexttime=60000; playSound("bot2");} EPIT_REF.close();} EPIT_LEPES=0;}
	switch (EPIT_LEPES) {
		case 0: PMEP=szem4_EPITO_Wopen(); /*FaluID;lista;link_a_faluhoz*/
				if (PMEP[0]>0) {
					EPIT_REF=windowOpener('epit', VILL1ST.replace("screen=overview","screen=main").replace(/village=[0-9]+/,"village="+PMEP[0]), AZON+"_SZEM4EPIT");
					EPIT_LEPES=1;
				} else {
					if (document.getElementById("epit_lista").rows.length==1) 
						nexttime=5000;
					else
						nexttime=60000;
				}
				if (EPIT_REF && EPIT_REF.document) EPIT_REF.document.title = 'szem4/építő';
				break;
		case 1: if (isPageLoaded(EPIT_REF,PMEP[0],"screen=main")) {EPIT_HIBA=0; EPIT_GHIBA=0;
					/*PMEP=*/szem4_EPITO_IntettiBuild(PMEP[1]);
				} else {EPIT_HIBA++;}
				EPIT_LEPES=0;
				break;
		default: EPIT_LEPES=0;
	}
	
	/*
	 1.) Megnézzük melyik falut kell megnyitni -->főhadi.
	 2.) <5 sor? Mit kell venni? Lehetséges e? Ha nem, lehet e valamikor az életbe? (tanya/raktár-vizsgálat)
	 3.) Nincs! xD
	*/}
}catch(e){debug("Epito motor",e); EPIT_LEPES=0;}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'epit', 'time': nexttime});
}catch(e){debug('epit', 'Worker engine error: ' + e);setTimeout(function(){szem4_EPITO_motor();}, 3000);}}

ujkieg_hang("Építő","epites;falu_kesz;kritikus_hiba");
ujkieg("epit","Építő",'<tr><td><h2 align="center">Építési listák</h2><table align="center" class="vis" style="border:1px solid black;color: black;"><tr><th onmouseover=\'sugo(this,"Építési lista neve, amire később hivatkozhatunk")\'>Csoport neve</th><th onmouseover=\'sugo(this,"Az építési sorrend megadása. Saját lista esetén ellenőrizzük az OK? linkre kattintva annak helyességét!")\' style="width:800px">Építési lista</th></tr><tr><td>Alapértelmezett</td><td><input type="text" disabled="disabled" value="main 10;storage 10;wall 10;main 15;wall 15;storage 15;farm 10;main 20;wall 20;MINES 10;smith 5;barracks 5;stable 5;main 15;storage 20;farm 20;market 10;main 22;smith 12;farm 25;storage 28;farm 26;MINES 24;market 19;barracks 15;stable 10;garage 5;MINES 26;farm 28;storage 30;barracks 20;stable 15;farm 30;barracks 25;stable 20;MINES 30;smith 20;snob 1" size="125"><a onclick="szem4_EPITO_cscheck(this)" style="color:blue; cursor:pointer;"> OK?</a></td></tr></table><p align="center">Csoportnév: <input type="text" value="" size="30" id="epit_ujcsopnev" placeholder="Nem tartalmazhat . _ ; karaktereket"> <a href="javascript: szem4_EPITO_ujCsop()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+' " height="17px"> Új csoport</a></p></td></tr><tr><td><h2 align="center">Építendő faluk</h2><table align="center" class="vis" style="border:1px solid black;color: black;width:900px" id="epit_lista"><tr><th style="width: 75px; cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",0)\' onmouseover=\'sugo(this,"Rendezhető. Itt építek. Dupla klikk a falura = sor törlése")\'>Falu koord.</th><th onclick=\'rendez("lista",false,this,"epit_lista",1)\' onmouseover=\'sugo(this,"Rendezhető. Felső táblázatban használt lista közül választhatsz egyet, melyet később bármikor megváltoztathatsz.")\' style="width: 135px; cursor: pointer">Használt lista</th><th style="width: 220px; cursor: pointer;" onclick=\'rendez("datum",false,this,"epit_lista",2)\' onmouseover=\'sugo(this,"Rendezhető. Ekkor fogom újranézni a falut, hogy lehet e már építeni.<br>Dupla klikk=idő azonnalira állítása.")\'>Return</th><th style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",3)\' onmouseover=\'sugo(this,"Rendezhető. Szöveges információ a faluban zajló építésről. Sárga hátterű szöveg orvosolható; kék jelentése hogy nem tud haladni; piros pedig kritikus hibát jelöl; a szín nélküli a normális működést jelzi.<br>Dupla klikk=alaphelyzet")\'><u>Infó</u></th></tr></table><p align="center" id="epit_ujfalu_adat">Csoport:  <select><option value="Alapértelmezett">Alapértelmezett</option> </select> \Faluk: <input type="text" value="" placeholder="Koordináták: 123|321 123|322 ..." size="50"> \<a href="javascript: szem4_EPITO_ujFalu()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+'" height="17px"> Új falu(k)</a></p></td></tr>');
/*Dupla klikk események; súgó; infóba linkmegnyitás*/
/*Table IDs:  farm_opts; farm_honnan; farm_hova*/
var EPIT_LEPES=0;
var EPIT_REF; var EPIT_HIBA=0; var EPIT_GHIBA=0;
var PMEP; var EPIT_PAUSE=false;
szem4_EPITO_motor();
szem4_EPITO_perccsokkento();

/*-----------------PF TŐZSDE--------------------*/

/*-----------------Export/Import kezelő--------------------*/
function szem4_ADAT_saveNow(tipus){
	switch (tipus) {
		case "farm": szem4_ADAT_farm_save(); break;
		case "epito": szem4_ADAT_epito_save(); break;
		case "sys": szem4_ADAT_sys_save(); break;
	}
	return;
}

function szem4_ADAT_restart(tipus){
	switch (tipus) {
		case "farm": localStorage.setItem(AZON+"_farm",'3600.4.0.3600.1.false.false.100.10.500.90;;;;;;'); szem4_ADAT_farm_load(); break;
		case "epito": localStorage.setItem(AZON+"_epito",'__'); szem4_ADAT_epito_load(); break;
		case "sys": localStorage.setItem(AZON+"_sys",'Fatelep.Agyagbánya.Vasbánya.Fal.false;false.false.false;http://www youtube com/watch?v=k2a30--j37Q.true.true.true.true.true.true;'); 
	szem4_ADAT_sys_load(); break;
	}
}

function szem4_ADAT_StopAll(){
	var tabla=document.getElementById("adat_opts").rows;
	for (var i=1;i<tabla.length;i++) {
		tabla[i].cells[0].getElementsByTagName("input")[0].checked=false;
	}
	return;
}

function szem4_ADAT_LoadAll(){
	szem4_ADAT_farm_load();
	szem4_ADAT_epito_load();
	szem4_ADAT_sys_load();
}

function szem4_ADAT_sys_save(){try{
	var eredmeny="";
	/*VIJE*/
	var adat=document.getElementById("vije").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].getAttribute("type")=="checkbox") {
			if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		} else eredmeny+=adat[i].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+='.'+JSON.stringify(ALL_VIJE_SAVED);
	eredmeny+=";";
	
	/*Adatmentő*/
	var adat=document.getElementById("adatok").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";";
	
	/*Hangok*/
	var adat=document.getElementById("hang").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].getAttribute("type")=="checkbox") {
			if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		} else eredmeny+=adat[i].value.replace(/\./g," ").replace(/;/g,"  ");
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";";
	
	localStorage.setItem(AZON+"_sys",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[3].cells[2].textContent=d.toLocaleString();
	return;
}catch(e){debug("ADAT_sys_save",e);}}

function szem4_ADAT_farm_save(){try{
	var eredmeny="";
	/*Options*/
	var adat=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].type=="checkbox") {
			if (adat[i].checked) eredmeny+="true"; else eredmeny+="false";
		} else {eredmeny+=adat[i].value;}
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Farm_honnan*/
	eredmeny+=";";
	adat=document.getElementById("farm_honnan").rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";";
	
	var seged;
	for (var i=1;i<adat.length;i++) {
		seged=adat[i].cells[1].getElementsByTagName("input");
		for (var j=0;j<seged.length;j++) {
			if (seged[j].checked) eredmeny+="true"; else eredmeny+="false";
			if (j<seged.length-1) eredmeny+="-";
		}
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Farm_hova*/
	eredmeny+=";";
	adat=document.getElementById("farm_hova").rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (adat[i].cells[0].style.backgroundColor=="red") eredmeny+="R";
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[1].textContent;
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[2].textContent;
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		if (adat[i].cells[4].getElementsByTagName("input")[0].checked) eredmeny+="true"; else eredmeny+="false";
		if (i<adat.length-1) eredmeny+=".";
	}

	/* ALL Movement */
	eredmeny+=';' + JSON.stringify(ALL_UNIT_MOVEMENT);
	eredmeny+=';' + JSON.stringify(ALL_SPY_MOVEMENTS);
	
	/* Farm_hova nyers */
	eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[3].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}

	localStorage.setItem(AZON+"_farm",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[1].cells[2].textContent=d.toLocaleString();
	return;
}catch(e){debug("ADAT_farm_save",e);}}

function szem4_ADAT_epito_save(){try{
	var eredmeny="";
	/*Csoportok*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=2;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent+"-"+adat[i].cells[1].getElementsByTagName("input")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Falulista*/
	eredmeny+="_";
	adat=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+="_";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[1].getElementsByTagName("select")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	localStorage.setItem(AZON+"_epito",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[2].cells[2].textContent=d.toLocaleString();;
	return;
}catch(e){debug("ADAT_epito_save",e);}}

function szem4_ADAT_farm_load(){try{
	if(localStorage.getItem(AZON+"_farm")) var suti=localStorage.getItem(AZON+"_farm"); else return;
/*Beállítások: simán value=, a checkbox speciális eset*/
	var adat=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	var resz=suti.split(";")[0].split(".");
	for (var i=0;i<resz.length;i++)	{
		if (resz[i]=="true") adat[i].checked=true; else
			if (resz[i]=="false") adat[i].checked=false; else
				adat[i].value=resz[i];
	}
/*START: Minden adat törlése a honnan;hova táblázatokból!*/
	adat=document.getElementById("farm_honnan");
	for (var i=adat.rows.length-1;i>0;i--) adat.deleteRow(i);
	adat=document.getElementById("farm_hova");
	for (var i=adat.rows.length-1;i>0;i--) adat.deleteRow(i);
/*Honnan: kitölti a hozzáadást, 1 1ség bepipálásával (az első jó lesz), majd végigmegy a 2. oszlopon pipálgatni*/
	document.getElementById("farm_opts").rows[1].cells[0].getElementsByTagName("input")[0].value=suti.split(";")[1];
	document.getElementById("farm_opts").rows[2].cells[0].getElementsByTagName("input")[0].checked=true;
	add_farmolo();
	
/*Hova: Hozzáadás használata koordikkal, később bánya;fal állítás; nyers-et pedig a határszámra állítja.*/	
	document.getElementById("farm_opts").rows[1].cells[1].getElementsByTagName("input")[0].value=suti.split(";")[3];
	add_farmolando();
	
	setTimeout(function(){try{
		var suti=localStorage.getItem(AZON+"_farm");
		var resz=suti.split(";")[0].split(".");
		var adat=document.getElementById("farm_honnan").rows;
		resz=suti.split(";")[2].split(".");
		for (var i=0;i<resz.length;i++) {
			var hely=adat[i+1].cells[1].getElementsByTagName("input");
			for (var j=0;j<resz[i].split("-").length;j++) {
				if (resz[i].split("-")[j]=="true") hely[j].checked=true; else hely[j].checked=false;
			}
		}
		/*Betöltés: farmok részletei*/
		adat=document.getElementById("farm_hova").rows;
		resz=suti.split(";")[2].split(".");
		for (var i=0;i<resz.length;i++) if (resz[i].indexOf("R")>0) adat[i+1].cells[0].style.backgroundColor="red";
		
		resz=suti.split(";")[4].split(".");
		for (var i=0;i<resz.length;i++) adat[i+1].cells[1].textContent=resz[i];
		
		resz=suti.split(";")[5].split(".");
		for (var i=0;i<resz.length;i++) adat[i+1].cells[2].textContent=resz[i];
		
		resz=suti.split(";")[6].split(".");
		for (var i=0;i<resz.length;i++) resz[i]=="true"?adat[i+1].cells[4].getElementsByTagName("input")[0].checked=true:adat[i+1].cells[4].getElementsByTagName("input")[0].checked=false;

		resz=suti.split(";")[7];
		if (resz && resz.length > 5) ALL_UNIT_MOVEMENT = JSON.parse(resz); else ALL_UNIT_MOVEMENT = {};
		
		resz=suti.split(";")[8];
		if (resz && resz.length > 5) ALL_SPY_MOVEMENTS = JSON.parse(resz); else ALL_SPY_MOVEMENTS = {};
		
		resz=suti.split(";")[9];
		if (resz)  {
			resz = resz.split('.');
			for (var i=0;i<resz.length;i++) {
				if (ALL_VIJE_SAVED[adat[i+1].cells[0].textContent]) {
					adat[i+1].cells[3].textContent=resz[i];
				} else {
					adat[i+1].cells[3].textContent=0;
				}
			}
		}
		
		document.getElementById("farm_opts").rows[2].cells[0].getElementsByTagName("input")[0].checked=false;
		alert2("Farmolási adatok betöltése kész.");
	}catch(e){alert("ERROR_LOAD\n"+e);}},1000);
}catch(e){debug("ADAT_farm_load",e);}void(0);}

function szem4_ADAT_epito_load(){try{
	if(localStorage.getItem(AZON+"_epito")) var suti=localStorage.getItem(AZON+"_epito"); else return;
	/* START: Minden adat törlése a listából és falukból!*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=adat.rows.length-1;i>1;i--) {
		adat.deleteRow(i);
	}
	var adat=document.getElementById("epit").getElementsByTagName("table")[1];
	for (var i=adat.rows.length-1;i>0;i--) {
		adat.deleteRow(i);
	}
	adat=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	while (adat.length>1) adat.remove(1);
	
	/*új csoport gomb használata, utána módosítás - ezt egyesével*/
	adat=suti.split("_")[0].split(".");
	for (var i=0;i<adat.length;i++) {
		document.getElementById("epit_ujcsopnev").value=adat[i].split("-")[0];
		szem4_EPITO_ujCsop();
		document.getElementById("epit").getElementsByTagName("table")[0].rows[i+2].cells[1].getElementsByTagName("input")[0].value=adat[i].split("-")[1];
	}
	/*Új faluk hozzáadása gomb, majd select állítása*/
	adat=suti.split("_")[1].split(".");
	document.getElementById("epit_ujfalu_adat").getElementsByTagName("input")[0].value=adat;
	szem4_EPITO_ujFalu();
	
	adat=suti.split("_")[2].split(".");
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=0;i<adat.length;i++) {
		hely[i+1].cells[1].getElementsByTagName("select")[0].value=adat[i];
	}
	alert2("Építési adatok betöltése kész.");
	return;
}catch(e){debug("ADAT_epito_load",e);}}

function szem4_ADAT_sys_load(){ try{
	if(localStorage.getItem(AZON+"_sys")) var suti=localStorage.getItem(AZON+"_sys"); else return;
	/*VIJE*/
	var adat=document.getElementById("vije").getElementsByTagName("input");
	var resz=suti.split(";")[0].split(".");
	for (var i=0;i<resz.length-2;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
		 if (resz[i]=="false") adat[i].checked=false; else
		  adat[i].value=resz[i];
	}
	if (resz[resz.length-1].length < 12)
		ALL_VIJE_SAVED = {};
	else
		ALL_VIJE_SAVED = JSON.parse(resz[resz.length-1]);
	
	/*Adatmentő*/
	var adat=document.getElementById("adat_opts").getElementsByTagName("input");
	var resz=suti.split(";")[1].split(".");
	for (var i=0;i<resz.length;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
		 if (resz[i]=="false") adat[i].checked=false;
	}
	
	/*Hangok*/
	var adat=document.getElementById("hang").getElementsByTagName("input");
	var resz=suti.split(";")[2].split(".");
	adat[0].value=resz[0].replace(/\s\s/g,";").replace(/\s/g,".");
	for (var i=1;i<resz.length;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
		 if (resz[i]=="false") adat[i].checked=false;
	}

	alert2("Rendszereadatok betöltése kész.");
}catch(e){debug("ADAT_epito_sys",e);}}

function szem4_ADAT_del(tipus){try{
	if (!confirm("Biztos törli a(z) "+tipus+" összes adatát?")) return;
	if (localStorage.getItem(AZON+"_"+tipus)) {
		localStorage.removeItem(AZON+"_"+tipus);
		alert2(tipus+": Törlés sikeres");
	} else alert2(tipus+": Nincs lementett adat");
	return;
}catch(e){debug("ADAT_epito_load",e);}}

function szem4_ADAT_kiir(tipus){try{
	if (localStorage.getItem(AZON+"_"+tipus)) {
		alert2("<textarea onmouseover='this.select()' onclick='this.select()' cols='38' rows='30'>"+localStorage.getItem(AZON+"_"+tipus)+"</textarea>");
	} else alert2("Nincs lementett adat");
	return;
}catch(e){debug("szem4_ADAT_kiir",e);}}

function szem4_ADAT_betolt(tipus){try{
	var beadat=prompt("Adja meg a korábban SZEM4 ÁLTAL KIÍRT ADATOT, melyet be kíván tölteni.\n\n Ne próbálj kézileg beírni ide bármit is. Helytelen adat megadását SZEM4 nem tudja kezelni, az ebből adódó működési rendellenesség csak RESET-eléssel állítható helyre.");
	if (beadat==null || beadat=="") return;
	localStorage.setItem(AZON+"_"+tipus,beadat);
	if (tipus=="farm") szem4_ADAT_farm_load();
	if (tipus=="epito") szem4_ADAT_epito_load();
	if (tipus=="sys") szem4_ADAT_sys_load();
	alert2("Az adatok sikeresen betöltődtek.");
}catch(e){debug("szem4_ADAT_betolt",e);}}

function loadCloudSync() {
	if (CLOUD_AUTHS) {try{
		CLOUD_AUTHS = JSON.parse(CLOUD_AUTHS);
		if (!CLOUD_AUTHS.authDomain || !CLOUD_AUTHS.projectId || !CLOUD_AUTHS.storageBucket || !CLOUD_AUTHS.messagingSenderId || !CLOUD_AUTHS.appId || !CLOUD_AUTHS.email || !CLOUD_AUTHS.password || !CLOUD_AUTHS.collection || !CLOUD_AUTHS.myDocument)
			throw 'Must consist these fields: authDomain projectId storageBucket messagingSenderId appId email password';
	} catch(e) { naplo('Sync', 'Invalid Auth data ' + e); }
	} else return;
	const script = document.createElement("script");
	script.type = "module";
	script.innerHTML = `
		import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
		import { getFirestore, collection, updateDoc, getDoc, doc }  from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
		import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js"

		const app = initializeApp(CLOUD_AUTHS);
		const db = getFirestore(app);
		const auth = getAuth();

		signInWithEmailAndPassword(auth, CLOUD_AUTHS.email, CLOUD_AUTHS.password)
		.then(async (userCredential) => {
			const user = userCredential.user;

			window.readUpData = async () => {
				const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
				return myDoc.data();
			}
			window.updateData = async (newData) => {
				try {
					const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
					await updateDoc(myDoc.ref, newData);
					return 'OK';
				} catch(e) {
					return 'Error: '+e;
				}
			}
			window.naplo('Sync', 'Firebase felhő kapcsolat létrejött');
			if (confirm("Firebase adatszinkronizálás helyi adatokra?")) {
				window.loadCloudDataIntoLocal();
			}
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
		});`;
	document.head.appendChild(script);
}
function loadCloudDataIntoLocal() {
	if (!CLOUD_AUTHS) {
		alert("Nincs aktív felhő szinkronizáció");
		return;
	}
	readUpData().then((cloudData) => {
		localStorage.setItem(AZON+"_farm", cloudData.farm);
		localStorage.setItem(AZON+"_epito", cloudData.epit);
		localStorage.setItem(AZON+"_sys", cloudData.vije);
		szem4_ADAT_LoadAll();
	});
	document.getElementById("adat_opts").rows[4].cells[0].getElementsByTagName("input")[0].checked = true;
}
function saveLocalDataToCloud() {
	if (!CLOUD_AUTHS) {
		alert("Nincs aktív felhő szinkronizáció");
		return;
	}
	var jsonToSave = {
		farm: localStorage.getItem(AZON+"_farm"),
		epit: localStorage.getItem(AZON+"_epito"),
		vije: localStorage.getItem(AZON+"_sys")
	};
	updateData(jsonToSave).then(() => {
		var d=new Date(); document.getElementById("adat_opts").rows[4].cells[2].textContent=d.toLocaleString();
	});
}

function szem4_ADAT_motor(){try{if (!ADAT_PAUSE){
	if (ADAT_FIRST === 0)
		ADAT_FIRST=1;
	 else {
		var Z=document.getElementById("adat_opts").rows;
		if (Z[1].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_farm_save();
		if (Z[2].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_epito_save();
		if (Z[3].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_sys_save();
		ADAT_FIRST++;
		if (ADAT_FIRST > 5) {
			ADAT_FIRST = 1;
			if (Z[4].cells[0].getElementsByTagName("input")[0].checked) saveLocalDataToCloud();
		}
	}
}}catch(e){debug("ADAT_motor",e);}
try{
	worker.postMessage({'id': 'adatok', 'time': 60000});
}catch(e){debug('adatok', 'Worker engine error: ' + e);setTimeout(function(){szem4_ADAT_motor();}, 3000);}}

function szem4_ADAT_AddImageRow(tipus){
	return '\
	<img title="Jelenlegi adat betöltése" alt="Betölt" onclick="szem4_ADAT_'+tipus+'_load()" width="17px" src="'+pic("load.png")+'"> \
	<img title="Törlés" alt="Töröl" onclick="szem4_ADAT_del(\''+tipus+'\')" src="'+pic("del.png")+'" width="17px""> \
	<img title="Jelenlegi adat kiiratása" alt="Export" onclick="szem4_ADAT_kiir(\''+tipus+'\')" width="17px" src="'+pic("Export.png")+'"> \
	<img title="Saját adat betöltése" alt="Import" onclick="szem4_ADAT_betolt(\''+tipus+'\')" width="17px" src="'+pic("Import.png")+'"> \
	<img title="Mentés MOST" alt="Save" onclick="szem4_ADAT_saveNow(\''+tipus+'\')" width="17px" src="'+pic("saveNow.png")+'">\
	<img title="Reset: Helyreállítás" alt="Reset" onclick="szem4_ADAT_restart(\''+tipus+'\')" width="17px" src="'+pic("reset.png")+'">';
}

ujkieg("adatok","Adatmentő",'<tr><td>\
<p align="center"><b>Figyelem!</b> Az adatmentő legelső elindításakor betölti a lementett adatokat (ha van), nem törődve azzal, hogy jelenleg mi a munkafolyamat.<br>Új adatok használatához az adatmentő indítása előtt használd a törlést a lenti táblázatból.</p>\
<table class="vis" id="adat_opts" style="width:100%; margin-bottom: 50px;"><tr><th style="width:105px">Engedélyezés</th><th style="width:118px">Kiegészítő neve</th><th style="width:250px">Utolsó mentés ideje</th><th  style="width:93px">Adat kezelése</th></tr>\
<tr><td><input type="checkbox" checked></td><td>Farmoló</td><td></td><td>'+szem4_ADAT_AddImageRow("farm")+'</td></tr>\
<tr><td><input type="checkbox" checked></td><td>Építő</td><td></td><td>'+szem4_ADAT_AddImageRow("epito")+'</td></tr>\
<tr><td><input type="checkbox" checked></td><td>VIJE,Adatmentő,Hangok</td><td></td><td>'+szem4_ADAT_AddImageRow("sys")+'</td></tr>\
<tr><td><input type="checkbox" unchecked></td><td><img height="17px" src="'+pic('cloud.png')+'"> Cloud sync</td><td></td><td>\
			<img title="Cloud adat betöltése a jelenlegi rendszerbe" alt="Import" onclick="loadCloudDataIntoLocal()" width="17px" src="'+pic("Import.png")+'"> \
			<img title="Local adat lementése a Cloud rendszerbe" alt="Save" onclick="saveLocalDataToCloud()" width="17px" src="'+pic("saveNow.png")+'">\
</td></tr>\
</table><p align="center"></p></td></tr>');
var ADAT_PAUSE=false, ADAT_FIRST=0;
szem4_ADAT_motor();

$(document).ready(function(){
	nyit("naplo");
	vercheck();
	naplo("Indulás","SZEM 4.5 elindult.");
	naplo("Indulás","Farmolók szünetelő módban.");
	soundVolume(0.0);
	playSound("bot2"); /* Ha elmegy a net, tudjon csipogni */
	if (confirm("Engedélyezed az adatok mentését?\nKésőbb elindíthatja, ha visszapipálja a mentés engedélyezését - ekkor szükséges kézi adatbetöltés is előtte.")) {
		if (CLOUD_AUTHS) {
			naplo("Sync","Connecting to Firebase Cloud System...");
			loadCloudSync();
		} else {
			naplo("Sync","Firebase Cloud System is not setup. Create 'szem_firebase' localStorage item with credentials");
			naplo("Adat","Adatbetöltés helyi adatokból...");
			szem4_ADAT_LoadAll();
		}
	} else {
		szem4_ADAT_StopAll();
	}
	setTimeout(function(){soundVolume(1.0);},2000);
	
	$(function() {
		$("#alert2").draggable({handle: $('#alert2head')});
		$('#sugo').mouseover(function() {sugo(this,"Ez itt a súgó");});
		$('#fejresz').mouseover(function() {sugo(this,"");});
	});
	$("#farm_opts input").on('keydown keypress',function(){
		setTimeout('shorttest()',20);
	});
	document.addEventListener('click', addFreezeNotification);
	document.addEventListener('keypress', addFreezeNotification);
	addFreezeNotification();
});
/*

FARMVÉDŐ
Ha aktív, és falat lát, átvált csak-kl módba. Minimum sereget adunk meg falszintenként (ha nincs meg a kritérium, akkor 1xűen bejelöli h üres a falu; v kiegészíti a sereget ha tudja)
Kos: Falszintenként megadjuk pontosan a sereget mit küldjön. Megadjuk mely falukat használhatja. Csak a farm-hoz legközelebbi falut fogja használni! Percenként frissítgeti végig van-e má'?
Sikeres elküldés esetén zöldíti a hátteret ahogy mi is tennénk, +ugye csak azokat nézi ami nem zöld hátteres
(! akár már most!)VIJE: falszint változás észlelésekor kiszedi a zöld jelzést 

ADDME: Színezést is mentsen a Farmoló
ADDME: VIJE stat, h hány %-osan térnek vissza az egységek. Óránként resettelni!?
ADDME: New kieg.: Tőzsdefigyelő (Csak hang)
ADDME: New kieg.: FARMVÉDŐ (Farmolóba, opciókhoz)
ADDME: Ai: Automatikus, falunkénti megbízhatóság- és hatászám számolás. Csak perc alapú, és farmvédő alapú
ADDME: Tőzsdefigyelő
ILLESZTŐ: még 1 1séget a cuccbú' ne illesszen be ha az <20%-ig volna csak kihasználva
ADDME: Határszám emelése megbízhatóság/2 percnyi termelésig
ADDME: szüneteltethető a falu támadása/pipára mint a "J?" oszlop
ADDME: VIJE opciók: [ ] csak kém (csak kémes jelik nézése), [ ] low-mode (zöldeket ne nézze)
REMOVE: Min sereg/falu, helyette minimum <határszám>-nyi nyersanyag elvétele
REFACTOR: Kiegészítő választó rész: felkészülés több kieg.-re, dobozok legyenek
REFACTOR: farm_opts inputoknak adj ID-kat, esetleg form az miért nem jó?
ADDME: Sebesség ms-e leOKézáskor ne legyen érvényes, azt csinálja gyorsabban (konstans rnd(500ms)?)
FIXME: Utolsó visszatérő sereget nézzen, ne default <10p> pihit falu_helye.cells[2].innerHTML=d;
ADDME: "Sárgát NE támadd"
ADDME: Custom wallpaper
EXTRA: Pihenés sync: Ha Farmoló pihen, VIJE is (külön opció VIJE-nél: recommended ha zöld-törlése be van pipálva)
ADDME: Farmok rendezése táv szerint
ADDME: [Lebegő ablak] PAUSE ALL, I'M OUT
ADDME: [Lebegő ablak] Reset/ébresztő: Néha pihen a script, lehessen "felébreszteni" (timeout clear+újra motorindít)
FIXME: getServerTime (hiányzó fg)
ADDME: Teherbírás módosító
ADDME: FAKE limit, és ennek figyelembe vétele
Optional ADDME: határszám felülírása FAKE limitnél? Alap: NEM
?TRANSFORM: Gombbal állítódjon át a cucc (legyen RESET is), ezt olvassa ki, ekkor ellenőrizzen.
*/

void(0);