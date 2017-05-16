window.onload = function inicio(){
  Get();
  //Intervalo de tiempo ej. 60mil es 1 minuto
  var tiempo = 3600000;
  setInterval(function() { Get(); }, tiempo);
}

//  Funcion Labels, datosCSV y JSONToCSVConvertor estan
//  basadas en el trabajo de este desarrollador:
//  https://gist.github.com/adg29/d115cc72e6155d00ec6befd231657cb8

function labels(JSONData,row,prefijo){

  //This loop will extract the label from 1st index of on array
  for (var index in JSONData) {

    var data = JSONData[index];
    if(typeof data === 'object' && index=="home_lc"){
        row =labels(data,row,"home_lc/")+",";
    }else{
      console.log(index.concat(prefijo));
        row += prefijo.concat(index) + ',';
    }

  }

  row = row.slice(0, -1);
  return row;
}
function datosCSV (JSONData,newline,row){
  for (var i = 0; i < JSONData.length; i++) {
      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in JSONData[i]) {
        var data = JSONData[i][index];
        if(typeof data === 'object' && index=="home_lc"){
          data=[data];
          var arrData2 = typeof data != 'object' ? JSON.parse(data) : data;
          row = datosCSV(arrData2,false,row);
        }else{
          row += JSONData[i][index] + ',';
          if(i==0 && row.search("undefined")==0){
            row = row.replace("undefined", "");
          }
        }
      }

      row.slice(0, row.length - 1);
      //add a line break after each row
      if (newline) {
        row = row + '\r\n';
      }
  }
  return row;
}
function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    //http://jsfiddle.net/hybrid13i/JXrwM/
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        var aux_row="";
        row=labels(arrData[0],aux_row,"")+ + '\r\n';
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    var datos=datosCSV(arrData,true);
    CSV +=datos;
    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //Generate a file name
    var fileName = "Reporte_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    var lines = CSV.split("\n"), output = [], j;
    for (j = 0; j < lines.length; j++)
        output.push("<tr><td>"
                    + lines[j].slice(0,-1).split(",").join("</td><td>")
                    + "</td></tr>");
    output = "<table>" + output.join("") + "</table>";

    return output;
}

function Get(){
    var Httpreq = new XMLHttpRequest(); // a new request
    access_token="50a750a2cf1adea1ff812cc7faa1caf986d2d38dd0d36c5a16951ec54d41c592";
    url_get='https://gis-api.aiesec.org/v2/people?access_token='+access_token+'&only=data&page=1&per_page=100';
    Httpreq.open("GET",url_get,false);
    Httpreq.send(null);

   var someJsonString = Httpreq.responseText;
   var jsonObject = JSON.parse(someJsonString);

   //Imprimir JSON en la pagina
   //document.getElementById("json").innerHTML = JSON.stringify(jsonObject.data, undefined, 2);
   var fecha = new Date();
   var dias=fecha.getDate();
   var fecha_string = fecha.toString();
   var titulo ="EPs_"
   var nombre_reporte = titulo.concat(fecha_string);

   tabla=JSONToCSVConvertor(jsonObject.data, nombre_reporte, true);

   var mensaje1="Ultima Decarga " + fecha_string;
   document.getElementById("des").innerHTML = mensaje1;
   var nuevafecha = new Date();
   nuevafecha.setDate(dias+(1/24));
   var mensaje="Proxima Decarga " + nuevafecha.toString();
   document.getElementById("proxima").innerHTML = mensaje;

   document.getElementById("json").innerHTML =tabla;

}
