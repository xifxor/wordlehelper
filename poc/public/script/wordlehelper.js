



$(document).ready(function(){

    //global vars
    let strSelectedTileID = null;
    let strDictionaryPath = 'dics/english_5_letter.txt';

    //load dictionary
    let arrDictionaryWords = new Array();
    $.get(strDictionaryPath, function(data){
      arrDictionaryWords = data.split('\n').map(function(w){
          return w.replace(/(\r\n|\n|\r)/gm, "");
        });
      console.log("Loaded dictionary from " + strDictionaryPath);
      console.log("Words loaded: " + arrDictionaryWords.length);
    });

    //key up on the "letters that are not present" box
    $("#input_notpresent").keyup(delay(function(){
        console.log("not present characters were chnged. current content:" + $("#input_notpresent").val()   );

        updateWords(); //run update

      },500 ));

    //update selected title
    $(".tile").click(function(){
        console.log("selected " +  $(this).attr('id')   );
        strSelectedTileID = '#' + $(this).attr('id')

    });



    //detect keystrokes
    $('html').keyup(function(e){

        //backspace was pushed (if a tile is highlighted then remove the content)
        if(e.keyCode == 8){
            console.log("Backspace pressed");

            //reset the selected tile
            if (strSelectedTileID != null){
              $(strSelectedTileID).html(" ");
              $(strSelectedTileID).removeClass();
              $(strSelectedTileID).addClass('tile tile_empty');
              strSelectedTileID = null; //clear tile selection

              updateWords(); //run update
            }
        }

        //key push whlie a tile is selected
        if (strSelectedTileID != null){

          //check if the characer is a letter
          var inp = String.fromCharCode(e.keyCode);
          if (/[a-zA-Z]/.test(inp))
          {

            //Update the selected tile with the character
            console.log("updating div " + strSelectedTileID  + " to  " + inp);
            $(strSelectedTileID).html(inp);

            //set class according to tile type
            $(strSelectedTileID).removeClass();

            if (strSelectedTileID.startsWith("#correct_")) {
              $(strSelectedTileID).addClass('tile tile_correct');
            }else{
              $(strSelectedTileID).addClass('tile tile_present');
            }

            strSelectedTileID = null; //clear tile selection
            updateWords(); //run update
          }


          strSelectedTileID = null;//clear tile selection
        }

    });

    //delay a function
    function delay(fn, ms) {
      let timer = 0
      return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
      }
    }

    //get word suggestions
    function updateWords(){
        console.log("Running updateWords()");
        $("#status").html( "Updating..." );

        //get present letters
        let arrPresentLetters = $('.tile_present').map(function(){ return $(this).html().toLowerCase() }).get();
        console.log("Present letters:" + arrPresentLetters.join(","));

        //get correct letters
        let arrCorrectLetters = new Array();
        arrCorrectLetters.push( $("#correct_1").html() );
        arrCorrectLetters.push( $("#correct_2").html() );
        arrCorrectLetters.push( $("#correct_3").html() );
        arrCorrectLetters.push( $("#correct_4").html() );
        arrCorrectLetters.push( $("#correct_5").html() );
        console.log("Corect letters:" + arrCorrectLetters.join(","));

        //create a regex to represent the correct letters
        arrCorrectLettersRegex = arrCorrectLetters.map(function(c){
          if (/[a-zA-Z]/.test(c)){ return c; }
          else{ return '.'; }
        });

        strCorrectLettersRegex = '^' + arrCorrectLettersRegex.join('') + '$'
        console.log("Correct Letters Regex:" + strCorrectLettersRegex);

        //get not-present letters
        let arrNotPresentLetters = $("#input_notpresent").val().split("");
        console.log("Not-present letters:" + arrNotPresentLetters.join(","));


        //search word dictionary
        arrFilteredWords = arrDictionaryWords.map((x) => x); //clone the dictioinary
        console.log("arrFilteredWords count:" + arrFilteredWords.length);


        //exclude words that dont contain all of arrPresentLetters
        if (arrPresentLetters.length > 0)
        {
          console.log("Filtering for present letters")
          arrFilteredWords = arrFilteredWords.filter(function(word){
            //console.log("testing " + word)
            return arrPresentLetters.every(function(letter){

                return word.toLowerCase().indexOf(letter) != -1;
                }
            );

          });

          console.log("arrFilteredWords count after present filtering:" + arrFilteredWords.length);
        }

        //exclude words that  contain any of the non-present letters
        if (arrNotPresentLetters.length > 0)
        {
          console.log("Filtering for non-present letters")
          arrFilteredWords = arrFilteredWords.filter(function(word){
            //console.log("testing " + word)
            return !arrNotPresentLetters.some(function(letter){

                return word.toLowerCase().indexOf(letter) != -1;
                }
            );

          });
          console.log("arrFilteredWords count after non-present filtering:" + arrFilteredWords.length);
        }

        //exclude words that dont match the strCorrectLettersRegex pattern
        if (strCorrectLettersRegex != "^.....$")
        {
          console.log("Filtering for correct letters using |" + strCorrectLettersRegex + "|")
          var matcher = new RegExp( strCorrectLettersRegex , "i");

          arrFilteredWords = arrFilteredWords.filter(function(word){
            return matcher.test(word);
          });
          console.log("arrFilteredWords count after correct letters filtering:" + arrFilteredWords.length);
        }

        //display results

        $("#wordslist").html( arrFilteredWords.join("<br>") );

        $("#status").html( "List of " + arrFilteredWords.length + " potential words:"  );
    }


});
