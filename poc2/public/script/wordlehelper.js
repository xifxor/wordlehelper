

  //create dictionary
  var dictionary = {
    dicpath :  null,
    words : [],
    load : function(newPath){

      this.dicpath = newPath;

      var strReturn = "";

      $.ajax({
        url: this.dicpath ,
        success: function(html) {
          strReturn = html;
        },
        async:false
      });

      this.words = strReturn.split('\n').map(function(w){
          return w.replace(/(\r\n|\n|\r)/gm, "");
        });

      console.log("Loaded dictionary: " + this.dicpath);
      console.log("Loaded words: " + this.words.length);


    }
  };


$(document).ready(function(){

    //global vars
    let selectedTile = null;
    let strDictionaryPath = 'dics/english_5_letter.txt';
    let lettersPerWord = 5;
    let wordRows = 6;



    //create tiles (
    // css grid appears to populate vertically.  If that's different per browser then this will break)
    for(var col=0; col<lettersPerWord; col++){
      for(var row=0; row<wordRows; row++){

          //newDiv = document.createElement("div");
        let id = "tile-" + row + "-" + col;
        let $div = $("<div>", {id: id, "class": "tile tile_empty"});
        //newDiv
        $('#container').append($div);
      }

    }

    //load default dictionary
    dictionary.load(strDictionaryPath);

    //change dictionary
    $('#languageselect').change(function(){

        //change this to a lookup against json
        switch( $(this).val() )
        {
          case 'english':
            strNewDictionaryPath = 'dics/english_5_letter.txt';
            break;
          case 'spanish':
            strNewDictionaryPath = 'dics/espanol_5_letters.txt';
            break;
          default:
            strNewDictionaryPath = 'dics/english_5_letter.txt';
        }

        //if dictionary has changed then load dictionary and reset page
        console.log("New dictionary " + strNewDictionaryPath)

        if (strNewDictionaryPath != dictionary.dicpath)
        {
          //load the new dictionray
          dictionary.load(strNewDictionaryPath);

          //reset tiles
          $('.tile').html("");
          $('.tile').removeClass().addClass('tile tile_empty');
          $('#status').html("Dictionary loaded");
          $('#wordslist').html("");

        }else{
          //no change to dictionary
        }

    });


    //click the reset link
    $('#resetLink').click(function(){
      $('.tile').html("");
      $('.tile').removeClass().addClass('tile tile_empty');
      $('#wordslist').html("");
      $('#problems').html("");
      $('#status').html("Word suggestions:");
      selectedTile = null;
    });


    //select tile (and change tile mode)
    $(".tile").click(function(){

        selectedTile = this;

        if ( $(selectedTile).hasClass("tile_absent") )
        {
          $(selectedTile).removeClass('tile_absent');
          $(selectedTile).addClass('tile_present');

        }else if( $(selectedTile).hasClass("tile_present") )
        {
          $(selectedTile).removeClass('tile_present');
          $(selectedTile).addClass('tile_correct');

        }else if( $(selectedTile).hasClass("tile_correct") )
        {
          $(selectedTile).removeClass('tile_correct');
          $(selectedTile).addClass('tile_absent');

        }
        $(".tile").removeClass('tile_selected');
        $(selectedTile).addClass("tile_selected")

        //update results
        startSeachCountdown();
    });



    //detect keystrokes
    $('html').keyup(function(e){

        //backspace was pushed (if a tile is highlighted then remove the content)
        if(e.keyCode == 8){
            console.log("Backspace pressed");

            //reset the selected tile
            if (selectedTile != null){

              $(selectedTile).html(" ");
              $(selectedTile).removeClass();
              $(selectedTile).addClass('tile tile_empty');

              //move to previous tile in row
              coords = $(selectedTile).attr('id').split("-").slice(1)

              if (coords[1] > 0){
                console.log("exiting coords " + coords);
                newId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) -1);
                console.log("selecting div " + newId);
                selectedTile = $(newId);
                $(selectedTile).addClass("tile_selected")

              }else{

              }


              startSeachCountdown(); //search dictionary

            }
        }


        //key push whlie a tile is selected
        if (selectedTile != null){


          //check if the characer is a letter
          var char = String.fromCharCode(e.keyCode);
          if (/[a-zA-Z]/.test(char))
          {

            //Update the selected tile with the character
            console.log("Updating selected div to  " + char);
            $(selectedTile).html(char);

            //update class to show as not-present by default
            if ($(selectedTile).hasClass("tile_empty") )
            {
              $(selectedTile).removeClass("tile_empty tile_selected");
              $(selectedTile).addClass('tile_absent');
            }

            //move to next tile in row
            coords = $(selectedTile).attr('id').split("-").slice(1)

            if (coords[1] < (lettersPerWord - 1)){
              console.log("exiting coords " + coords);
              newId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) +1);
              console.log("selecting div " + newId);
              selectedTile = $(newId)
              $(selectedTile).addClass("tile_selected")

            }else{
              //we just filled in the last box in the row so deselect the tile
              selectedTile = null;
            }

            //run update
            //delay(doSearch2,1500);
            //startSeachCountdown();
            console.log("running function on delay" );
            //delay(function(){
            startSeachCountdown();

          //  },500);
          }

        }

    });


    //this function should run the search just once, regardless of how many updates
    // in the last 1 second.  ** not figured this bit out yet.
    function startSeachCountdown(callback, wait) {
      let timeout;
      return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(function () { callback.apply(this, args); }, wait);
      };
    }

    // The listeners below will separately fire if clicking OR typing ends. 
    // This means if a user is simultaneously typing and clicking the doSearch() function will fire twice.

    window.addEventListener('keyup', startSeachCountdown( () => {
        // code you would like to run 1000ms after the keyup event has stopped firing
        // further keyup events reset the timer, as expected
        doSearch();
    }, 1500))

    window.addEventListener('click', startSeachCountdown( () => {
      // code you would like to run 1000ms after the keyup event has stopped firing
      // further keyup events reset the timer, as expected
      doSearch();
  }, 1500))


    function doSearch(){

      console.log("Running doSearch()");


      //copy current master dictionary
      console.log("Copying master dictionary")
      console.log("master ditionary words: " + dictionary.words.length)
      arrFilteredWords = dictionary.words.map((x) => x); //clone the current dictioinary


      //get not-present letters
      let arrNotPresentLetters = $('.tile').map(function(){
          if ( $(this).hasClass("tile_absent") )
          {
            return $(this).html().toLowerCase()
          }
        }).get();

      console.log("Not-present letters:" + arrNotPresentLetters.join(","));


      /*
      Exclude words with letters that are not present
      */
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
        console.log("Remaining words after filtering non-present letters:" + arrFilteredWords.length);
      }


      /*
      get columns/sets of enteries for "present" and for "correct"
      */
      arrPresentSets = [];
      arrCorrectSets = [];

      for(var col=0; col<lettersPerWord; col++){ //loop columns
        arrPresentSets[col] = [];
        arrCorrectSets[col] = [];
        for(var row=0; row<wordRows; row++){ //loop rows

          let id = "#tile-" + row + "-" + col;
          //console.log("Processing id " + id);
          //if the cell contains a letter then store it
          if ( ($(id).hasClass("tile_present")) && (/[a-zA-Z]/.test( $(id).html() )))
          {
            arrPresentSets[col].push( $(id).html() );
          }
          else if ( ($(id).hasClass("tile_correct")) && (/[a-zA-Z]/.test( $(id).html() )))
          {
            arrCorrectSets[col].push( $(id).html() );
          }

        }
      }

      //create flat arrays for both type
      arrPresentLetters = arrPresentSets.flat()
      arrCorrectLetters = arrCorrectSets.flat()

      /*
      Exclude words that dont have all of the Present Letters in them
      */
      console.log("arrPresentLetters: " + arrPresentLetters.join(',') );
      if (arrPresentLetters.length > 0)
      {

        console.log("Filtering for present letters")
        arrFilteredWords = arrFilteredWords.filter(function(word){
          return arrPresentLetters.every(function(letter){
              // r = word.toLowerCase().indexOf(letter.toLowerCase()) != -1;
              //console.log("checking letter " + letter + " against " + word + " result " + r);
              return word.toLowerCase().indexOf(letter.toLowerCase()) != -1;
              }
          );

        });

        console.log("Remaining words after filtering on present letters:" + arrFilteredWords.length);
      }



      /*
      Exclude words that have one of the Present letters in the stated position
      (present letters must be in a different position to the one guessed or they would be correct letters)
      basically make a regex in the format ^[^ABC]..[^DEF].$
      */

      //create regex
      arrPresentLettersRegex = arrPresentSets.map(function(x){
        if (x.length > 0 ){
          return "[^" + x.join('') + "]";
        }else{
          return ".";
        }
      });
      strPresentLettersRegex = "^" + arrPresentLettersRegex.join('') + "$"

      console.log("arrPresentSets: " + arrPresentSets.join('  ') );
      console.log("arrPresentLettersRegex: " + arrPresentLettersRegex );
      console.log("strPresentLettersRegex: " + strPresentLettersRegex );

      //filter words based on the regex
      if (strPresentLettersRegex != "^.....$"){

        console.log("Filtering for present letters using " + strPresentLettersRegex )
        var matcher = new RegExp( strPresentLettersRegex , "i");

        arrFilteredWords = arrFilteredWords.filter(function(word){
          //console.log("testing " + word + " against |" + strPresentLettersRegex + "|" );
          return matcher.test(word);
        });
        console.log("Remaining words after taking into account present letter position:" + arrFilteredWords.length);

      }


      /*
      Exclue words that do not fit the "Correct" letter pattern
      */

      //create regex using only the last "correct" letter in each column,
      // or a dot if there arent any for the column
      arrCorrectLettersRegex = arrCorrectSets.map(function(x){
        if (x.length > 0 ){
          return x.slice(-1)[0]; //return last element of array
        }else{
          return ".";
        }
      });

      strCorrectLettersRegex = '^' + arrCorrectLettersRegex.join('') + '$'

      console.log("arrCorrectLettersRegex: " + arrCorrectLettersRegex);
      console.log("strCorrectLettersRegex: " + strCorrectLettersRegex);

      //filter to only words that match the regex
      if (strCorrectLettersRegex != "^.....$"){

        console.log("Filtering for correct letters using " + strCorrectLettersRegex )
        var matcher = new RegExp( strCorrectLettersRegex , "i");

        arrFilteredWords = arrFilteredWords.filter(function(word){
          return matcher.test(word);
        });
        console.log("arrFilteredWords count after correct letters filtering:" + arrFilteredWords.length);

      }


      //check and alert for any problems
      //   not-present letters that are also marked as  present (arrNotPresentLetters contains any of arrPresentLetters)
      //   not-present letters that are also marked as correct  letters (arrNotPresentLetters contains any of arrCorrectLetters)
      //   differing correct letters in a single column (any arrCorrectSets  has length > 1)



      //Display results
      $("#status").html( "List of " + arrFilteredWords.length + " potential words:"  );
      $("#wordslist").html( arrFilteredWords.join("<br>") );

    }


});
