//initialise the page
    var GRID_WIDTH = 15,
        GRID_HEIGHT = 15,
        wordArray = ['APPLE','AJAX', 'ASBESTOS', 'TORSION', 'TWERK', 'PUNCH', 'WILLOW', 'PRACTICALJOKE', 'PREFAB', 'QATAR', 'PUSSY', 'ANIMATE', 'COLORADO', 'MEWS', 'ANTIPOPE', 'APRON', 'MISHIT', 'SANDWICHBOARD', 'EXTOL', 'TREMOLO', 'SAKE', 'AEROSOL', 'LIQUID', 'PEERLESS', 'OPEC', 'FOYER', 'TRACE'],
        EMPTYCHAR = '',
        FIT_ATTEMPTS = 2,
        coordList = [];


    function submitValue() {
        //let inputSize = $('input[name="size"]')[0].value; //抓html中的size的值
        //let inputs = list_data.push(wordArray)
        alert("Nothing??" + wordArray);
        let inputs = $('textarea[name="input"]')[0].value.split(','); //抓html的textarea中的字
        GRID_WIDTH = 15;
        GRID_HEIGHT = 15;
        wordArray = [];
        alert("Nothing" + wordArray);
        alert("WTF--" + inputs);
        for (let i = 0; i < inputs.length; i++) {
            wordArray.push({'word': inputs[i], 'clue': inputs[i]}) //將所有字都放進wordArray陣列中 --> 不確定
            //alert("Loop----" + i + "-----" + inputs[i]);
        }
        alert(wordArray);
        //seedBoard(); //呼叫函式
    }

    function shuffleArray(array) { //每一次按下submit鍵所跑的遊戲板都不一樣
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    function board(cols, rows) { //instantiator object for making game boards 製作遊戲板  這是主要跑的函式
        this.cols = cols; //直
        this.rows = rows; //橫
        var activeWordList = []; //keeps array of words actually placed in board
        var acrossCount = 0;
        var downCount = 0;

        var grid = new Array(cols); //create 2 dimensional array for letter grid
        var temp = new Array(cols);
        var verticalWord = [];
        var horizontalWord = [];
        for (var i = 0; i < rows; i++) {
            grid[i] = new Array(rows);
            temp[i] = new Array(rows);
        }

        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                grid[x][y] = {};
                grid[x][y].targetChar = EMPTYCHAR; //target character, hidden
                grid[x][y].indexDisplay = ''; //used to display index number of word start
                grid[x][y].value = '-'; //actual current letter shown on board

                temp[x][y] = {};
                temp[x][y].targetChar = EMPTYCHAR; //target character, hidden
                temp[x][y].indexDisplay = ''; //used to display index number of word start
                temp[x][y].value = '-'; //actual current letter shown on board
            }
        }

        function suggestCoords(word) { //search for potential cross placement locations 找可放置的位置
            var c = '';
            coordCount = [];
            coordCount = 0;
            for (i = 0; i < word.length; i++) { //cycle through each character of the word 循環遍歷單字的每個字母
                for (x = 0; x < GRID_HEIGHT; x++) {
                    for (y = 0; y < GRID_WIDTH; y++) {
                        c = word[i];
                        if (grid[x][y].targetChar == c) { //check for letter match in cell
                            if (x - i + 1 > 0 && x - i + word.length - 1 < GRID_HEIGHT) { //would fit vertically? //是否可以放直的
                                coordList[coordCount] = {};
                                coordList[coordCount].x = x - i;
                                coordList[coordCount].y = y;
                                coordList[coordCount].score = 0;
                                coordList[coordCount].vertical = true;
                                coordCount++;
                            }

                            if (y - i + 1 > 0 && y - i + word.length - 1 < GRID_WIDTH) { //would fit horizontally? //是否可以放橫的
                                coordList[coordCount] = {};
                                coordList[coordCount].x = x;
                                coordList[coordCount].y = y - i;
                                coordList[coordCount].score = 0;
                                coordList[coordCount].vertical = false;
                                coordCount++;
                            }
                        }
                    }
                }
            }
        }

        function checkFitScore(word, x, y, vertical) { //檢查交叉?!
            var fitScore = 1; //default is 1, 2+ has crosses, 0 is invalid due to collision   默認為 1，2+ 有交叉，0 因碰撞無效

            if (vertical) { //vertical checking  判斷有沒有直的交叉 (if vertical is true)
                for (i = 0; i < word.length; i++) {
                    if (i == 0 && x > 0) { //check for empty space preceeding first character of word if not on edge
                        if (grid[x - 1][y].targetChar != EMPTYCHAR) { //adjacent letter collision
                            fitScore = 0;
                            break;
                        }
                    } else if (i == word.length && x < GRID_HEIGHT) { //check for empty space after last character of word if not on edge
                        if (grid[x + i + 1][y].targetChar != EMPTYCHAR) { //adjacent letter collision
                            fitScore = 0;
                            break;
                        }
                    }
                    if (x + i < GRID_HEIGHT) {
                        if (grid[x + i][y].targetChar == word[i]) { //letter match - aka cross point
                            fitScore += 1;
                        } else if (grid[x + i][y].targetChar != EMPTYCHAR) { //letter doesn't match and it isn't empty so there is a collision
                            fitScore = 0;
                            break;
                        } else { //verify that there aren't letters on either side of placement if it isn't a crosspoint
                            if (y < GRID_WIDTH - 1) { //check right side if it isn't on the edge
                                if (grid[x + i][y + 1].targetChar != EMPTYCHAR) { //adjacent letter collision
                                    fitScore = 0;
                                    break;
                                }
                            }
                            if (y > 0) { //check left side if it isn't on the edge
                                if (grid[x + i][y - 1].targetChar != EMPTYCHAR) { //adjacent letter collision
                                    fitScore = 0;
                                    break;
                                }
                            }
                        }
                    }

                }

            } else { //horizontal checking  檢查有沒有橫的交叉
                for (i = 0; i < word.length; i++) {
                    if (i == 0 && y > 0) { //check for empty space preceeding first character of word if not on edge
                        if (grid[x][y - 1].targetChar != EMPTYCHAR) { //adjacent letter collision
                            fitScore = 0;
                            break;
                        }
                    } else if (i == word.length - 1 && y + i < GRID_WIDTH - 1) { //check for empty space after last character of word if not on edge
                        if (grid[x][y + i + 1].targetChar != EMPTYCHAR) { //adjacent letter collision
                            fitScore = 0;
                            break;
                        }
                    }
                    if (y + i < GRID_WIDTH) {
                        if (grid[x][y + i].targetChar == word[i]) { //letter match - aka cross point
                            fitScore += 1;
                        } else if (grid[x][y + i].targetChar != EMPTYCHAR) { //letter doesn't match and it isn't empty so there is a collision
                            fitScore = 0;
                            break;
                        } else { //verify that there aren't letters on either side of placement if it isn't a crosspoint
                            if (x < GRID_HEIGHT) { //check top side if it isn't on the edge
                                if (grid[x + 1][y + i].targetChar != EMPTYCHAR) { //adjacent letter collision
                                    fitScore = 0;
                                    break;
                                }
                            }
                            if (x > 0) { //check bottom side if it isn't on the edge
                                if (grid[x - 1][y + i].targetChar != EMPTYCHAR) { //adjacent letter collision
                                    fitScore = 0;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            return fitScore;
        }

        function placeWord(word, clue, x, y, vertical) { //places a new active word on the board

            var cc = 0;
            var wordPlaced = false;
            var rowStr = "";
            $('#tempTable').empty(); // $('#tempTable') 指從HTML抓id = tempTable

            var vv = String(verticalWord.length+1);
            var hh = String.fromCharCode(horizontalWord.length+65 );

            if (vertical) {
                if (word.length + x < GRID_HEIGHT) { //單字放置直的
                    verticalWord.push(word);
                    for (i = 0; i < word.length; i++) {
                        grid[x + i][y].targetChar = word[i];
                        temp[x + i][y].targetChar += ' ';
                    }
                    //temp[x][y].targetChar += '1';
                    temp[x][y].targetChar += vv;
                    wordPlaced = true;
                }
            } else {
                if (word.length + y < GRID_WIDTH) { //單字放置橫的
                    horizontalWord.push(word);
                    for (i = 0; i < word.length; i++) {
                        grid[x][y + i].targetChar = word[i];
                        temp[x][y + i].targetChar += " ";
                    }
                    temp[x][y].targetChar += hh; //這裡有題號
                    wordPlaced = true;
                }
            }

            if (wordPlaced) {
                var currentIndex = activeWordList.length;
                activeWordList[currentIndex] = {};
                activeWordList[currentIndex].word = word;
                activeWordList[currentIndex].clue = clue;
                activeWordList[currentIndex].x = x;
                activeWordList[currentIndex].y = y;
                activeWordList[currentIndex].vertical = vertical;

                if (activeWordList[currentIndex].vertical) {
                    downCount++;
                    activeWordList[currentIndex].number = downCount;
                } else {
                    acrossCount++;
                    activeWordList[currentIndex].number = acrossCount;
                }
            }

            for (var x = 0; x < cols; x++) { //把格子一行一行的印出來 output
                for (var y = 0; y < rows; y++) {
                    rowStr += "<td>" + (grid[x][y].targetChar)+ "</td>";
                }
                $('#tempTable').append("<tr>" + rowStr + "</tr>");
                rowStr = "";
            }
        }

        function isActiveWord(word) {
            if (activeWordList.length > 0) {
                for (var w = 0; w < activeWordList.length; w++) {
                    if (word == activeWordList[w].word) {
                        //console.log(word + ' in activeWordList');
                        return true;
                    }
                }
            }
            return false;
        }

        //for each word in the source array we test where it can fit on the board and then test those locations for validity against other already placed words
        //對於源數組中的每個單詞，我們測試它可以放在板上的位置，然後測試這些位置與其他已放置單詞的有效性
        this.generateBoard = function generateBoard(seed = 0) { //形成遊戲版函式

            var bestScoreIndex = 0;
            var top = 0;
            var fitScore = 0;
            var startTime;

            //manually place the longest word horizontally at 0,0, try others if the generated board is too weak
            //手動將最長的單字水平放置在 0,0，如果生成的板太弱，請嘗試其他
            placeWord(wordArray[seed].word, wordArray[seed].clue, 0, 0, false); //placeWord 函式是去判斷單字要放直的還是橫的

            //attempt to fill the rest of the board
            //試圖填補遊戲版上的其餘部分
            for (var iy = 0; iy < FIT_ATTEMPTS; iy++) { //usually 2 times is enough for max fill potential //FIT_ATTEMPTS = 2
                for (var ix = 1; ix < wordArray.length; ix++) {
                    if (!isActiveWord(wordArray[ix].word)) { //only add if not already in the active word list //只新增尚未新增的單字
                        topScore = 0;
                        bestScoreIndex = 0;

                        suggestCoords(wordArray[ix].word); //fills coordList and coordCount
                        coordList = shuffleArray(coordList); //adds some randomization //呼叫'每一次按下submit鍵所跑的遊戲板都不一樣'的函式

                        if (coordList[0]) {
                            for (c = 0; c < coordList.length; c++) { //get the best fit score from the list of possible valid coordinates
                                fitScore = checkFitScore(wordArray[ix].word, coordList[c].x, coordList[c].y, coordList[c].vertical); //呼叫'checkFitScore'檢查交叉的函式
                                if (fitScore > topScore) {
                                    topScore = fitScore;
                                    bestScoreIndex = c; //不確定這表示的意思
                                }
                            }
                        }

                        if (topScore > 1) { //only place a word if it has a fitscore of 2 or higher
                            //用placeWord函式放新的單字
                            placeWord(wordArray[ix].word, wordArray[ix].clue, coordList[bestScoreIndex].x, coordList[bestScoreIndex].y, coordList[bestScoreIndex].vertical);
                        }
                    }

                }
            }

            //regenerate board if less than half the words were placed
            //如果放置的單詞少於一半，則重新生成板
            if (activeWordList.length < wordArray.length / 2) {
                seed++;
                generateBoard(seed);
            }
        }
    }

    function seedBoard() {
        gameboard = new board(GRID_WIDTH, GRID_HEIGHT); //建構子
        //gameboard.displayGrid();
        gameboard.generateBoard();
        //gameboard.displayGrid();
    };

    $('input[name="size"]')[0].value = GRID_WIDTH;
    $('textarea[name="input"]')[0].value = wordArray.join(',');
    submitValue();

