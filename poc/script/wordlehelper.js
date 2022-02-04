



$(document).ready(function(){




    //global var
    let selected_tile = null;
    let dicionary_path = 'dics/english_5_letter.txt'

    //load dictionary
    let words = new Array();
    $.get(dicionary_path, function(data){
      words = data.split('\n');
      console.log("Loaded dictionary from " + dicionary_path);
      console.log("Words loaded: " + words.length);
    });



    //take action when notpresent characters are changed
    $("#input_notpresent").keyup(function(){
        console.log("not present characters were chnged. current content:" + $("#input_notpresent").val()   );
        //selected_tile = '#' + $(this).attr('id')

    });

    //update selected title
    $(".tile").click(function(){
        console.log("selected " +  $(this).attr('id')   );
        selected_tile = '#' + $(this).attr('id')

    });



    //detect keystrokes
    $('html').keyup(function(e){

        //backspace was pushed (if a tile is highlighted then remove the content)
        if(e.keyCode == 8){
            console.log("Backspace pressed");

            //reset the selected tile
            if (selected_tile != null){
              $(selected_tile).html(" ");
              $(selected_tile).removeClass();
              $(selected_tile).addClass('tile tile_empty');
              selected_tile = null; //clear tile selection
              resetUpdateCountdown(); //tart the update countdown from the top
            }
        }

        //if a tile is selected
        if (selected_tile != null){

          //check if the characer is a letter
          var inp = String.fromCharCode(e.keyCode);
          if (/[a-zA-Z]/.test(inp))
          {

            //Update the selected tile with the character
            console.log("updating div " + selected_tile  + " to  " + inp);
            $(selected_tile).html(inp);

            //set class according to tile type
            $(selected_tile).removeClass();

            if (selected_tile.startsWith("#correct_")) {
              $(selected_tile).addClass('tile tile_correct');
            }else{
              $(selected_tile).addClass('tile tile_present');
            }
          }

          //clear tile selection
          selected_tile = null;
        }

    });

    function resetUpdateCountdown(){

    }

    function updateWords(){
        $("#status").html("Updating...")



    }


});
