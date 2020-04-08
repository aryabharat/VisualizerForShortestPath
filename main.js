let grid;
let start = [0, 0];
let end = [];
let isMousePressed = false;
let moveStartEnd = {
    value: "",
    status: false
}
function createGrid() {
    let matrix = [];
    let rowLimit = parseInt(document.getElementById("gridRow").value);
    let colLimit = parseInt(document.getElementById("gridCol").value);
    grid = new PF.Grid(rowLimit, colLimit);
    end = [rowLimit - 1, colLimit - 1];
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
                }
                else {
                    if (e.target.className == 'start' || e.target.className == 'end') {
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
                // console.log(e.target);
                if (e.target.className === 'wall' && moveStartEnd.status == false) {
                    e.target.className = 'unvisited'
                }
                else {
                    if (e.target.className == 'start' || e.target.className == 'end' ||  moveStartEnd.status == true) {
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
        cell.addEventListener('mouseleave',(e)=>{
            if (e.target.tagName === 'TD' && isMousePressed == true && moveStartEnd.status == true){            
                    e.target.className = 'unvisited';

            }
        })

        cell.addEventListener('mouseup', (e) => {
            if (moveStartEnd.status == true)
              {
                  e.target.className = moveStartEnd.value;
                  if(moveStartEnd.value == 'start')
                  start = (e.target.id).split('-');
                  else
                  end = (e.target.id).split('-');
                  moveStartEnd.status = false;
                  moveStartEnd.value = "";
              }
                    isMousePressed = false;
        })
    })
}

function findPath() {
    var finder = new PF.AStarFinder();
    // console.log(start[0], start[1], end[0], end[1]);
    var path = finder.findPath(start[0], start[1], end[0], end[1], grid);
    path.forEach(i => {
        document.getElementById(i[0] + '-' + i[1]).className = 'visited'
    });
}

