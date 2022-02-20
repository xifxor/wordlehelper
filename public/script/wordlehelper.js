

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

        let id = "tile-" + row + "-" + col;
        let $input= $("<input>", {id: id, "class": "tile tile_empty", maxlength : 1});
        //newDiv
        $('#gridcontainer').append($input);
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
          $('.tile').val("");
          $('.tile').removeClass().addClass('tile tile_empty');
          $('#status').html("Dictionary loaded");
          $('#wordcontainer').html("");

        }else{
          //no change to dictionary
        }

    });


    //click the reset link
    $('#resetLink').click(function(){
      $('.tile').val("");
      $('.tile').removeClass().addClass('tile tile_empty');
      $('#wordcontainer').html("");
      $('#problems').html("");
      $('#status').html("Word suggestions:");
      selectedTile = null;
    });


    //select tile (and change tile mode)
    $(".tile").click(function(){


        if ( $(this).hasClass("tile_absent") )
        {
          $(this).removeClass('tile_absent');
          $(this).addClass('tile_present');

        }else if( $(this).hasClass("tile_present") )
        {
          $(this).removeClass('tile_present');
          $(this).addClass('tile_correct');

        }else if( $(this).hasClass("tile_correct") )
        {
          $(this).removeClass('tile_correct');
          $(this).addClass('tile_absent');

        }

        //$(".tile").removeClass('tile_selected');
        //$(selectedTile).addClass("tile_selected")

        //update results
        //startSeachCountdown();
        //console.log("Running startSeachCountdown");
        //startSeachCountdown( () => {doSearch();}, 1500)
    });



    //keystrokes on tiles
    $('.tile').on('keyup input', function(e){


      //backspace was pressed
      if(e.keyCode == 8){
        console.log("Backspace was pressed");

        if ( $(this).val() == '' ) //if this cell is blank then clear the prvevious one
        {
          console.log("Backspace value is empty");

          //identify previous tile
          coords = $(this).attr('id').split("-").slice(1);

          if ( coords[1] > 0 ) //backspace on all but thefirst column in row
          { 
            newId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) -1); //previous tile in this row
          }
          else //backspace on first column in row
          {
            if (coords[0] > 0 ){ //if this isnt the first row move up a row and select the last tile
              newId = "#tile-" + (parseInt(coords[0]) - 1) + "-" + (lettersPerWord - 1) ;
            }else{ //just stay on the first row first column
              newId = "#tile-0-0";
            }
  
          }
          
          //clear class
          $(this).removeClass();
          $(this).addClass("tile tile_empty");

          //set new focus
          console.log("setting focus to " + newId);
          $(newId).focus();

       }

      }
      else if (/[a-zA-Z]/.test( $(this).val() ))
      {

        console.log("Alpha character was pressed");

        $(this).addClass('tile_absent');

        //Identiy the next tile
        coords = $(this).attr('id').split("-").slice(1);

        if ( coords[1] < (lettersPerWord - 1) ) //key press on all but last column in row
        { 
          newId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) +1); //next tile in this row
        }
        else //key press on last column in row
        {
          if (coords[0] < (wordRows-1)){ //if this isnt the last row move down a row
           newId = "#tile-" + (parseInt(coords[0]) + 1) + "-0";
          }else{ //else just stay on the last row
            newId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) );
          }

        }

        //focus the next tile
       
        console.log("setting focus to " + newId);
        $(newId).focus();

      }

       //search dictionary
      //startSeachCountdown();
      //console.log("Running startSeachCountdown");
     // startSeachCountdown( () => {doSearch();}, 1500)

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

      console.log("========================================================================== Running doSearch() ==========================================================================");


      //copy current master dictionary
      console.log("Copying master dictionary")
      console.log("master ditionary words: " + dictionary.words.length)
      arrFilteredWords = dictionary.words.map((x) => x); //clone the current dictioinary


      //get not-present letters
      let arrNotPresentLetters = $('.tile').map(function(){
          if ( $(this).hasClass("tile_absent") )
          {
            return $(this).val().toLowerCase()
          }
        }).get();

      console.log("Not-present letters:" + arrNotPresentLetters.join(","));





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
          if ( ($(id).hasClass("tile_present")) && (/[a-zA-Z]/.test( $(id).val() )))
          {
            arrPresentSets[col].push( $(id).val() );
          }
          else if ( ($(id).hasClass("tile_correct")) && (/[a-zA-Z]/.test( $(id).val() )))
          {
            arrCorrectSets[col].push( $(id).val() );
            console.log("Correct letter found in column: " + col  + " row: " + row + ` letter: ${$(id).val()}`);
          }

        }
      }

      //create flat arrays for both type
      console.log("arrCorrectSets: " + arrCorrectSets);
      arrPresentLetters = arrPresentSets.flat()
      arrCorrectLetters = arrCorrectSets.flat()
      console.log("arrCorrectLetters" + arrCorrectLetters);

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

      /*
      Exclude words with letters that are not present
      */
      if (arrNotPresentLetters.length > 0)
      {
      console.log("Removing present and correct letters from non-present letters")
        //remove present letters from the not-present letters
        arrPresentLettersSet = new Set(arrPresentLetters);
        arrCorrectLettersSet = new Set(arrCorrectLetters);
        arrPresentAndCorrectLettersSet = new Set([...arrPresentLettersSet, ...arrCorrectLettersSet]);
        arrNotPresentLetters = arrNotPresentLetters.filter( (x) => {
          return !arrPresentAndCorrectLettersSet.has(x);
        });
      console.log('not-present letters after removing present and correct letters: ' + arrNotPresentLetters.join(","));


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


      //function to check if all elements of an array are equal to the first
      function checkArrayEqualElements(_array)
        {
          if(typeof _array !== 'undefined')    
          {
            var firstElement = _array[0];
            return _array.every(function(element)
          {
            return element === firstElement;
          });
          }
            return "Array is Undefined" ;
        } 

      //check and alert for any problems
      //   not-present letters that are also marked as  present (arrNotPresentLetters contains any of arrPresentLetters)
      //   not-present letters that are also marked as correct  letters (arrNotPresentLetters contains any of arrCorrectLetters)
      //   differing correct letters in a single column (any arrCorrectSets  has length > 1)
      errorText = "";
      for(var col=0; col<lettersPerWord; col++){
        if (arrCorrectSets[col].length > 1){
          if (checkArrayEqualElements(arrCorrectSets[col]) == false){
          //errorColumn is only used to display the column number in the error message for a human. They normally like to see 1,2,3,4,5,6,7,8,9,10 when counting.
          errorColumn = col + 1;
          letterUsedAsCorrect = arrCorrectSets[col].slice(-1).toString().toUpperCase();
          //The console log can be removed and was only used to format the error message for a human.
          console.log("Problem: Different letters marked correct in column " + errorColumn + ". Using \"" + letterUsedAsCorrect + "\""); 
          //This is the error message that is displayed to the user.
          errorText += "Problem: Different letters marked correct in column " + errorColumn + ". Using \"" + letterUsedAsCorrect + "\" as it is lower." + "<br>";
          }
        }
      }



      

      //Display results
      $("#status").html( "List of " + arrFilteredWords.length + " potential words:"  );
      $("#wordcontainer").html( arrFilteredWords.join("<br>") );
      $("#problems").html( errorText );
    }


});
