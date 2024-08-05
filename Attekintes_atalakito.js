javascript: try{

X=document.getElementById("production_table"); 
for (i=0;i<X.rows.length;i++){
	X.rows[i].deleteCell(9);
	X.rows[i].deleteCell(8);
	X.rows[i].deleteCell(7);
	X.rows[i].deleteCell(5);
	X.rows[i].deleteCell(0);
}}catch(e){alert(e);} alert("OK"); void(0);