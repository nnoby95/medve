javascript:
	var d=document;	
	if(window.frames.length>0) d=window.main.document;
	url=d.URL;
	if(url.indexOf('screen=place')==-1) {
		alert('Gyül. helyen próbáld...');
		exit(0);
	}	
if(d.forms[0].name=='units')
	{
	d.forms[0].x.value=339;
	d.forms[0].y.value=375;
	selectAllUnits(true);
	d.forms[0].support.click();
	} else {
	d.forms[0].submit.click();
	}
	void(0);