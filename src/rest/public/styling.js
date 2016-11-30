/**
 * Created by Benton on 24/11/2016.
 */
// top-bar-items move up and are underlined on hover
$("div.top-bar-item").hover(function() {
    console.log("hover");
    $(this).animate({padding: '0px 0px 5px 0px'},
        {duration: 200, queue: false});
    $(this).animate({bottom:'5px'},
        {duration: 200, queue: false});
    $(this).css("border-bottom", "2px #EEEEEE inset");

}, function() {
    $(this).animate({padding: '0px 0px 0px 0px'},
        {duration: 200, queue: false});
    $(this).animate({bottom:'0px'},
        {duration: 200, queue: false});
    $(this).css("border-bottom", "0px black solid");

});