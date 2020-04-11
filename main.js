let grid;
let start = [0, 0];
let end = [];
let fire = [];
let isMousePressed = false;
let rowLimit;
let colLimit;
let moveStartEnd = {
    value: "",
    status: false
}
function createGrid() {
    let matrix = [];
    rowLimit = parseInt(document.getElementById("gridRow").value);
    colLimit = parseInt(document.getElementById("gridCol").value);
    grid = new PF.Grid(rowLimit, colLimit);
    end = [rowLimit - 1, colLimit - 1];
    start = [0,0]
    let tableHTML = "";
    for (let r = 0; r < rowLimit; r++) {
        let currentHTMLRow = `<tr id="row ${r}">`;
        let temp = [];
        for (let c = 0; c < colLimit; c++) {
            temp[c] = 0;
            let newNodeId = `${r}-${c}`, newNodeClass, newNode;
            newNodeClass = "unvisited";
            if (r == 0 && c == 0)
                newNodeClass = "start";
            if (r == rowLimit - 1 && c == colLimit - 1)
                newNodeClass = "end";
            if (r == Math.floor(rowLimit / 2) && c == Math.floor(colLimit / 2))
                newNodeClass = "fire";
            currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}"></td>`;
        }
        tableHTML += `${currentHTMLRow}</tr>`;
        matrix.push(temp);
    }
    let board = document.getElementById("board");
    board.innerHTML = tableHTML;
    addEvents();
}
function addEvents() {
    let table = document.querySelectorAll('#board td')
    table.forEach((cell) => {
        cell.addEventListener('mousedown', (e) => {
            isMousePressed = true;
            if (e.target.tagName === 'TD') {
                if (e.target.className === 'wall') {
                    e.target.className = 'unvisited'
                    let temp = (e.target.id).split('-');
                    grid.setWalkableAt(temp[0], temp[1], true);
                }
                else {
                    if (e.target.className == 'start' || e.target.className == 'end' || e.target.className == 'fire') {
                        moveStartEnd.status = true;
                        moveStartEnd.value = e.target.className;
                        e.target.className = 'unvisited'
                    }
                    else {
                        e.target.className = 'wall';
                        let temp = (e.target.id).split('-');
                        grid.setWalkableAt(temp[0], temp[1], false);
                    }
                }
            }
        })
        cell.addEventListener('mouseenter', (e) => {
            if (e.target.tagName === 'TD' && isMousePressed == true) {
                if (e.target.className === 'wall' && moveStartEnd.status == false) {
                    e.target.className = 'unvisited'
                    let temp = (e.target.id).split('-');
                    grid.setWalkableAt(temp[0], temp[1], true);
                }
                else {
                    if (e.target.className != 'wall' && moveStartEnd.status == true) {
                        e.target.className = (moveStartEnd.value || e.target.className);
                    }
                    else {
                        e.target.className = 'wall';
                        let temp = (e.target.id).split('-');
                        grid.setWalkableAt(temp[0], temp[1], false);
                    }
                }
            }
        })
        cell.addEventListener('mouseleave', (e) => {
            if (e.target.tagName === 'TD' && e.target.className != 'wall' && isMousePressed == true && moveStartEnd.status == true) {
                e.target.className = 'unvisited';
            }
        })

        cell.addEventListener('mouseup', (e) => {
            if (moveStartEnd.status == true) {
                e.target.className = moveStartEnd.value;
                if (moveStartEnd.value == 'start')
                    start = (e.target.id).split('-');
                else if (moveStartEnd.value == 'end')
                    end = (e.target.id).split('-');
                else
                    fire = (e.target.id).split('-').map(Number);
                moveStartEnd.status = false;
                moveStartEnd.value = "";
            }
            isMousePressed = false;
        })
    })
}

function findPath() {
    var finder = new PF.AStarFinder();
    var path = finder.findPath(start[0], start[1], end[0], end[1], grid);
    // console.log(path.length)
    let personSpeed = parseInt(document.getElementById("personSpeed").value);
    let fireRate = parseInt(document.getElementById("fireRate").value);
    let time = Math.ceil(path.length / personSpeed)
    let blocks = Math.ceil(time / fireRate);
    // console.log(blocks);
    fire[0] -= blocks;
    fire[1] -= blocks;
    for (let i = 0; i < (blocks * 2); i++) {
        for (let j = 0; j < (blocks * 2); j++) {
            console.log( (fire[0]+i) + '-' + (fire[1]+j))
            if((fire[0]+i) < rowLimit && (fire[1]+j) < colLimit && (fire[0]+i) >= 0 && (fire[1]+j) >= 0){
                console.log( (fire[0]+i) + '-' + (fire[1]+j))
                document.getElementById( (fire[0]+i) + '-' + (fire[1]+j)).className = 'fire';
            }
        }
    }
    // for(let i=0;i<blocks;i++)
    // {
    //     let temp  = [5,5];
    //     document.getElementById( (temp[0]+i) + '-' + (temp[1]+i)).className = 'fire';
    //     document.getElementById( (temp[0]+i) + '-' + (temp[1])).className = 'fire';
    //     document.getElementById( (temp[0]+i) + '-' + (temp[1]-i)).className = 'fire';
    //     document.getElementById( (temp[0]) + '-' + (temp[1]+i)).className = 'fire';
    //     document.getElementById( (temp[0]-i) + '-' + (temp[1]+i)).className = 'fire';
    //     document.getElementById( (temp[0]-i) + '-' + (temp[1]+i)).className = 'fire';
    //     document.getElementById( (temp[0]) + '-' + (temp[1]-i)).className = 'fire';
    //     document.getElementById( (temp[0]-i) + '-' + (temp[1]+i)).className = 'fire'
    // }
    path.forEach(i => {
        document.getElementById(i[0] + '-' + i[1]).className = 'visited'
    });
}

