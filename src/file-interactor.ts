let OBJ: string = "";

/*// create a link DOM fragment
var $link = $("<a />");
// encode any special characters in the JSON
var text = encodeURIComponent( myJSON );

// <a download="filename.txt" href='data:application/octet-stream,...'></a>
$link
    .attr( "download", "filename.txt" )
    .attr( "href", "data:application/octet-stream," + text )
    .appendTo( "body" )
    .get(0)
    .click()*/

function loadObjAsString() {
    let fr = new FileReader();
    fr.onload = function(){
        console.log(fr.result);
        OBJ = fr.result.toString();
    }

    fr.readAsText(this.files[0]);
}

export {loadObjAsString, OBJ}