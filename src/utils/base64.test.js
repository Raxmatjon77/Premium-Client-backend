module.exports = function (value){
    value =value.toString().split("base64,")[1];
    var base64regex =
      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    // base64regex.test("SomeStringObviouslyNotBase64Encoded..."); // FALSE
    return base64regex.test(value);
}


