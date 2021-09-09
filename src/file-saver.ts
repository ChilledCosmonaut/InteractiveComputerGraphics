let JSON: string = ""

function loadJsonAsString() {
    let fr =new FileReader()
    fr.onload=function() {
        console.log(fr.result)
        JSON = fr.result.toString()
    }
    fr.readAsText(this.files[0]);
}
export {loadJsonAsString, JSON}