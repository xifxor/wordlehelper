

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
    let strDictionaryPath = 'dics/english_5_letter.txt';
    let lettersPerWord = 5;
    let wordRows = 6;
    let defaultWordListMessage = "<h2>Word list...</h2>";

    
    //set default wordlist message
    $('#wordlist').html( defaultWordListMessage );

    //create tiles
    // css grid appears to populate vertically.  
    //If that's different per browser then this will break)
    for(var col=0; col<lettersPerWord; col++){
      for(var row=0; row<wordRows; row++){

        $("<input>", {"id": "tile-" + row + "-" + col, 
                      "class": "tile tile_empty", 
                      "maxlength" : 1
                    }).appendTo('#grid');

      }

    }

    function resetAll(){
      $('#wordlist').html( defaultWordListMessage );
      $('.tile').val("")
                .removeClass()
                .addClass('tile tile_empty');
      $('#problems').html("");
      $('#tile-0-0').focus();
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

          //reset board
          resetAll();

        }

    });


    //click the reset link
    $('#resetLink').click(function(){ resetAll(); });


    //select tile (and change tile mode)
    $(".tile").click(function(){

        if ( $(this).hasClass("tile_absent") )
        {
          $(this).removeClass('tile_absent').addClass('tile_present');

        }else if( $(this).hasClass("tile_present") )
        {
          $(this).removeClass('tile_present').addClass('tile_correct');

        }else if( $(this).hasClass("tile_correct") )
        {
          $(this).removeClass('tile_correct').addClass('tile_absent');

        }

    });

    //toggle instructions
    $('#instructionstitle').click(function(){
      $("#instructions").toggle("slow");
    });


    //keystrokes on tiles
    $('.tile').on('keydown input', function(e){

      //get the grid coordinates for this tile
      coords = $(this).attr('id').split("-").slice(1);

      //backspace was pressed
      if(e.keyCode == 8){
        console.log("Backspace was pressed");


        //get the current tile coords
        coords = $(this).attr('id').split("-").slice(1);
        console.log("cords of this tile : " + coords.join(","));
        console.log("tile value is : " + $(this).val() );
        //calculate the previous tile
        if ( coords[1] > 0 ) //backspace on all but the first column in row
        { 
          //previous tile in this row
          previousTileId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) -1); 
        }
        else //backspace on first column in row
        {
          //if this isnt the first row move up a row and select the last tile
          if (coords[0] > 0 ){ 
            previousTileId = "#tile-" + (parseInt(coords[0]) - 1) + "-" + (lettersPerWord - 1) ;
          }else{ //just stay on the first row first column
            previousTileId = "#tile-0-0";
          }

        }
  
        //if the currently focused tile is blank then move back one and clear that
        if ( $(this).val() == '' ) 
        { 
          console.log("Backspace pressed on empty tile");
          //reset class of this tile
          $(this).removeClass().addClass("tile tile_empty");

          //set focus to previous input and clear it
          console.log("setting focus to " + previousTileId);
          $(previousTileId).val('');
          $(previousTileId).focus();
          $(previousTileId).removeClass().addClass("tile tile_empty");

            
        }else{
          console.log("Backspace pressed on tile with contents");

          //clear the currently focused tile
          $(this).val('');
          $(this).removeClass().addClass("tile tile_empty");

        }

      }
      //space bar pressed
      else if(e.keyCode == 32){
        console.log("Spacebar pressed");
        $(this).click();

      } 

      //left arrow
      else if(e.keyCode == 37){
        console.log("Left Arrow pressed");

        //calculate the previous tile
        if ( coords[1] > 0 ) //backspace on all but the first column in row
        { 
          //previous tile in this row
          previousTileId = "#tile-" + coords[0] + "-" + (parseInt(coords[1]) -1); 
        }
        else //backspace on first column in row
        {
          //if this isnt the first row move up a row and select the last tile
          if (coords[0] > 0 ){ 
            previousTileId = "#tile-" + (parseInt(coords[0]) - 1) + "-" + (lettersPerWord - 1) ;
          }else{ //just stay on the first row first column
            previousTileId = "#tile-0-0";
          }

        }

        $(previousTileId).focus();

      }

      //up arrow
      else if(e.keyCode == 38){
        console.log("Up Arrow pressed");

        //if this isnt the first row ove up a row
        if (coords[0] > 0){ 
          newId = "#tile-" + (parseInt(coords[0]) - 1) + "-" + coords[1];
        }
        
        $(newId).focus();

      }

      //right arrow
      else if(e.keyCode == 39){
        console.log("Right Arrow pressed");

        //calculate the next tile
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

        $(newId).focus();

      }

      //down arrow
      else if(e.keyCode == 40){
        console.log("Down Arrow pressed");

        //if this isnt the last row move down a row
        if (coords[0] < (wordRows-1)){ 
          newId = "#tile-" + (parseInt(coords[0]) + 1) + "-" + coords[1];
        }
        
        $(newId).focus();
      }

      //alpha character pressed
      else if (/[a-zA-Z]/.test( $(this).val() ))
      {
        console.log("alpha key pressed");
        $(this).addClass('tile_absent');

        //calculate the next tile
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

    // do search when a key is pressed on a tile    
    $('.tile').on('keyup', startSeachCountdown( () => {
        doSearch();
    }, 1000))

    //search when a tile is clicked
    $('.tile').on('click', startSeachCountdown( () => {
      doSearch();
    }, 1000))


    function doSearch(){

      //dont search if nothing has been entered 
      let nonEmptyCount = $('.tile').filter(function(){
        return $(this).val();
      }).length;
      
      if (nonEmptyCount <= 0){
        $("#wordlist").html( defaultWordListMessage );
        $("#problems").html( "" );

        return;
      }

      console.log("========================================================================== Running doSearch() ==========================================================================");

    

      //copy current master dictionary
      console.log("Copying master dictionary")
      console.log("master ditionary words: " + dictionary.words.length)
      let arrFilteredWords = dictionary.words.map((x) => x); //clone the current dictioinary


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
      let arrPresentSets = [];
      let arrCorrectSets = [];

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
      let arrPresentLetters = arrPresentSets.flat().map((x) => x.toLowerCase());
      let arrCorrectLetters = arrCorrectSets.flat().map((x) => x.toLowerCase());
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
      let arrPresentLettersRegex = arrPresentSets.map(function(x){
        if (x.length > 0 ){
          return "[^" + x.join('') + "]";
        }else{
          return ".";
        }
      });
      let strPresentLettersRegex = "^" + arrPresentLettersRegex.join('') + "$"

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
      let arrCorrectLettersRegex = arrCorrectSets.map(function(x){
        if (x.length > 0 ){
          return x.slice(-1)[0]; //return last element of array
        }else{
          return ".";
        }
      });

      let strCorrectLettersRegex = '^' + arrCorrectLettersRegex.join('') + '$'

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
      let errorText = "";
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
      //$("#status").html( "Found " + arrFilteredWords.length + " words:"  );
      $("#wordlist").html( "<h2>Found " + arrFilteredWords.length + " words...</h2>" + arrFilteredWords.join("<br>") );
      $("#problems").html( errorText );
    }


});
