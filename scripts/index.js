(function (){
    function GetRandomNumber(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
    function IsBomb(n){
        return n===-1;
    }
    function Reveal(box){
        if(box.classList.contains("revealed")) return;
        if(!box.classList.contains("bomb")) {// ‼️WIN Condn
            ++revealed; 
            if(row*col - mines === revealed){
                GameWon();
            }
        }
        box.classList.add("revealed");
        box.style.boxShadow = "none";   
        box.style.backgroundColor = "rgba(165, 165, 165, 1)";
        box.style.fontSize = "100%";
        box.style.outline = "0.5px solid rgba(124, 124, 124, 1)";
    }
    function RevealAllBomb(){
        document.querySelectorAll('.bomb').forEach(Reveal);
    }
    function InitializeGameArray(){
        return Array(row).fill().map(()=>Array(col).fill(0));   
    };
    function PlaceBombs(safeI, safeJ){
        let placed = 0;
        while(placed < mines){
            let I = GetRandomNumber(0, row);
            let J = GetRandomNumber(0, col);
            if((I === safeI && J === safeJ) || arr[I][J] == -1) 
                continue;
            if(Math.abs(I - safeI) <= 1 && Math.abs(J - safeJ) <= 1) continue;
            placed++;
            arr[I][J] = -1;
        }
        for(let i=0;i<row;i++)
            for(let j=0;j<col;j++)
                if(arr[i][j] !== -1)
                    for(let x=i-1;x<=i+1;x++)
                        for(let y=j-1;y<=j+1;y++)
                            if(x>=0 && x<row && y>=0 && y<col && arr[x][y] === -1)
                                arr[i][j]++;

    }
    function BFSReveal(startI, startJ){
        const queue = [[startI, startJ]];
        const visited = Array(row).fill().map(() => Array(col).fill(false));

        while(queue.length){
            const [i, j] = queue.shift();
            if(visited[i][j]) continue;
            visited[i][j] = true;

            const box = document.querySelector(`#b${i}_${j}`);
            if(box.classList.contains("flagged")) continue;
            Reveal(box);

            if(arr[i][j] !== 0) continue;

            for(let x=i-1;x<=i+1;x++)
                for(let y=j-1;y<=j+1;y++)
                    if(x>=0 && x<row && y>=0 && y<col && !visited[x][y])
                        queue.push([x,y]);
        }
    }
    function GameWon(){
        document.querySelector('.stats-restart').innerHTML = "🥳";
        StopTimer();
        DisplayStats();
        document.querySelector('.stats-score').innerHTML = "Time: "+score;
        gameWon = true;
    }
    function GameOver(){
        RevealAllBomb(); StopTimer();
        DisplayStats();
        document.querySelector('.stats-score').innerHTML = "Game Lost!";
        document.querySelector('.stats-restart').innerHTML = "😵";
        gameOver = true;
    }
    function InitialState(){
        if(flagEnabled)
            ToggleFlag();
        gameOver = gameWon = flagEnabled = false;
        firstT = true;
        revealed = score = time = 0
        timerID = null;
        row = 9, col = 9, mines = mC = 10;
        arr = InitializeGameArray();

        UpdateCounter();
        statsScreen.style.zIndex = "-1";
        document.querySelector('.timer').innerHTML = String(time).padStart(3, '0');
    }

    /*🕯️🍂📜 - - ‼️‼️ - - ‼️‼️ - - ‼️‼️ - - 📜🍂🕯️*/
    const grid = document.querySelector('.grid');
    const flag = document.querySelector('.flag');
    const mineCounter = document.querySelector('.mineCounter');
    const statsScreen = document.querySelector('.stats-screen');

    let gameOver, gameWon, firstT, flagEnabled;
    let revealed, score, time;
    let timerID;

    let row, col, mines, arr;
    InitialState();

    grid.style.gridTemplateColumns = `repeat(${col}, 1fr)`;
    flag.addEventListener('mouseup', ToggleFlag);
    
    CreateGame(grid);

    /*🕯️🍂📜 - - ‼️‼️ - - ‼️‼️ - - ‼️‼️ - - 📜🍂🕯️*/

    function CreateGame(grid){
        grid.innerHTML = "";
        for(let i=0; i<row; i++)
            for(let j=0; j<col; j++){
                const box = document.createElement('div');
                box.className = 'box';
                box.id = `b${i}_${j}`;

                if(IsBomb(arr[i][j])){
                    box.classList.add("bomb");
                    box.innerHTML = "💣";
                }
                else if(arr[i][j] != 0)
                    box.innerHTML = arr[i][j];
                switch(arr[i][j]){
                    case 1: box.style.color = "#0000FF"; break;
                    case 2: box.style.color = "#008000"; break;
                    case 3: box.style.color = "#FF0000"; break;
                    case 4: box.style.color = "#000080"; break;
                    case 5: box.style.color = "#800000"; break;
                    case 6: box.style.color = "#008080"; break;
                    case 7: box.style.color = "#000000"; break;
                    case 8: box.style.color = "#808080"; break;
                }
                box.addEventListener("mouseup", () => {
                    if(gameOver || gameWon) return;
                    if(flagEnabled) {
                        HandleFlag(box); return;
                    }
                    if(box.classList.contains("flagged")) return;
                    if(firstT){
                        firstT = false;
                        PlaceBombs(i, j);
                        CreateGame(grid); 
                        BFSReveal(i, j);
                        StartTimer();
                        timerID = setInterval(StartTimer, 1000);
                        return;
                    }
                    if(IsBomb(arr[i][j])){
                        Reveal(box);
                        GameOver();
                    }
                    else if(arr[i][j]===0)
                        BFSReveal(i, j);
                    else{
                        Reveal(box);
                    }
                });
                grid.appendChild(box);
            }
    }


    /* TIMER */
    function StartTimer(){
        if(time>999)
            StopTimer();
        document.querySelector('.timer').innerHTML = String(time).padStart(3, '0');
        score = time;
        time++;
    }
    function StopTimer(){
        clearInterval(timerID);
    }


    
    function ToggleFlag(){
        if(gameOver || gameWon || firstT) return;
        flagEnabled = !flagEnabled;
        if(!flagEnabled)
            flag.style.backgroundColor = "rgb(186, 186, 186)";
        else
            flag.style.backgroundColor = "red";
    }
    function HandleFlag(box){
        if(gameOver || gameWon || firstT) return;
        if(box.classList.contains("revealed")) return ;
        if(box.classList.contains("flagged")){
            box.classList.remove("flagged");
            box.style.backgroundColor = "rgb(186, 186, 186)"
            mC++; UpdateCounter();
        } else {
            box.classList.add("flagged");
            box.style.backgroundColor = "red";
            mC--; UpdateCounter();
        }
    }

    
    function UpdateCounter(){
        mineCounter.innerHTML = String(mC).padStart(3, '0');
    } UpdateCounter();

    document.querySelector('.restart').addEventListener("mouseup", () =>{
        Restart();
    });
    document.querySelector('.stats-restart').addEventListener("mouseup", () =>{
        Restart();
    });

    function DisplayStats(){
        statsScreen.style.zIndex = "1";
    }
    function Restart(){
        clearInterval(timerID);
        InitialState();
        CreateGame(grid);
    }
})();