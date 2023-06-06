let grid;
let start = [0, 0];
let end = [];
let fire = [];
let isMousePressed = false;
let rowLimit;
let colLimit;
let moveStartEnd = {
  value: '',
  status: false,
};
const FIRE_UI_CLASS = 'fire';
const FIRE_UI_CLASS_TEMP = 'fire_temp';

function createGrid() {
  let matrix = [];
  reset();
  rowLimit = parseInt(document.getElementById('gridRow').value);
  colLimit = parseInt(document.getElementById('gridCol').value);
  grid = new PF.Grid(rowLimit, colLimit);
  end = [rowLimit - 1, colLimit - 1];
  start = [0, 0];
  fire = [Math.floor(rowLimit / 2), Math.floor(colLimit / 2)];

  let tableHTML = '';
  for (let r = 0; r < rowLimit; r++) {
    let currentHTMLRow = `<tr id="row ${r}">`;
    let temp = [];
    for (let c = 0; c < colLimit; c++) {
      temp[c] = 0;
      let newNodeId = `${r}-${c}`,
        newNodeClass,
        newNode;
      newNodeClass = 'unvisited';
      if (r == 0 && c == 0) newNodeClass = 'start';
      if (r == rowLimit - 1 && c == colLimit - 1) newNodeClass = 'end';
      if (r == fire[0] && c == fire[1]) newNodeClass = 'fire';
      currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}"></td>`;
    }
    tableHTML += `${currentHTMLRow}</tr>`;
    matrix.push(temp);
  }
  let board = document.getElementById('board');
  board.innerHTML = tableHTML;
  addEvents();
}
function addEvents() {
  let table = document.querySelectorAll('#board td');
  table.forEach((cell) => {
    cell.addEventListener('mousedown', (e) => {
      isMousePressed = true;
      if (e.target.tagName === 'TD') {
        if (e.target.className === 'wall') {
          e.target.className = 'unvisited';
          let temp = e.target.id.split('-');
          grid.setWalkableAt(temp[0], temp[1], true);
        } else {
          if (
            e.target.className == 'start' ||
            e.target.className == 'end' ||
            e.target.className == 'fire'
          ) {
            moveStartEnd.status = true;
            moveStartEnd.value = e.target.className;
            e.target.className = 'unvisited';
          } else {
            e.target.className = 'wall';
            let temp = e.target.id.split('-');
            grid.setWalkableAt(temp[0], temp[1], false);
          }
        }
      }
    });
    cell.addEventListener('mouseenter', (e) => {
      if (e.target.tagName === 'TD' && isMousePressed == true) {
        if (e.target.className === 'wall' && moveStartEnd.status == false) {
          e.target.className = 'unvisited';
          let temp = e.target.id.split('-');
          grid.setWalkableAt(temp[0], temp[1], true);
        } else {
          if (e.target.className != 'wall' && moveStartEnd.status == true) {
            e.target.className = moveStartEnd.value || e.target.className;
          } else {
            e.target.className = 'wall';
            let temp = e.target.id.split('-');
            grid.setWalkableAt(temp[0], temp[1], false);
          }
        }
      }
    });
    cell.addEventListener('mouseleave', (e) => {
      if (
        e.target.tagName === 'TD' &&
        e.target.className != 'wall' &&
        isMousePressed == true &&
        moveStartEnd.status == true
      ) {
        e.target.className = 'unvisited';
      }
    });

    cell.addEventListener('mouseup', (e) => {
      if (moveStartEnd.status == true) {
        e.target.className = moveStartEnd.value;
        if (moveStartEnd.value == 'start') start = e.target.id.split('-');
        else if (moveStartEnd.value == 'end') end = e.target.id.split('-');
        else fire = e.target.id.split('-').map(Number);
        moveStartEnd.status = false;
        moveStartEnd.value = '';
      }
      isMousePressed = false;
    });
  });
}
let tt = 0;

function findPath() {
  const path = getPossiblePath(grid.clone());

  if (path.length === 0) {
    console.log('no possible path');
    showNoPathMessage();
    showFireElement();
    return;
  }

  let personSpeed = parseInt(document.getElementById('personSpeed').value);
  let fireRate = parseFloat(document.getElementById('fireRate').value);
  let time = Math.ceil(path.length / personSpeed); // * expected time with out fire //  time = distance/speed

  // * now check how much time it will take to spread fire.
  // * fireRate =  fireRate(sqFt/sec),  fireDistance = fireSpeed * time
  let fireDistance = Math.ceil(time * fireRate); // ?
  markFireIterative(fireDistance, fire[0], fire[1]);
  let retry = false;
  let collision = false;

  // tt++;
  for (let i = 0; i < path.length; i++) {
    const x = path[i][0];
    const y = path[i][1];
    const check =
      document.getElementById(x + '-' + y).className === FIRE_UI_CLASS_TEMP;
    if (check) {
      console.log({ in: 'a' });
      retry = true;
      collision = true;
      break;
    }
  }
  // console.log({ collision, tt });

  if (retry) {
    findPath();
  } else {
    showFireElement();
    markPath(path);
  }
}

function showNoPathMessage() {
  document.getElementById('no-path').style.display = 'block';
}

function reset() {
  document.getElementById('no-path').style.display = 'none';
}

function showFireElement() {
  document
    .querySelectorAll(`.${FIRE_UI_CLASS_TEMP}`)
    .forEach((e) => e.classList.replace(FIRE_UI_CLASS_TEMP, FIRE_UI_CLASS));
}

function getPossiblePath(_grid) {
  const finder = new PF.AStarFinder();
  return finder.findPath(start[0], start[1], end[0], end[1], _grid);
}

function markPath(path) {
  path.forEach((i) => {
    document.getElementById(i[0] + '-' + i[1]).className = 'visited';
  });
}

function markFireIterative(distance, x, y, totalBlocks) {
  let startX = x - distance;
  let startY = y - distance;

  let endX = x + distance;
  let endY = y + distance;

  for (let i = startX; i <= endX; i++) {
    for (let j = startY; j <= endY; j++) {
      try {
        if (
          i < rowLimit &&
          i > -1 &&
          j < colLimit &&
          j > -1 &&
          document.getElementById(`${i}-${j}`).className !== FIRE_UI_CLASS
        ) {
          document.getElementById(`${i}-${j}`).className = FIRE_UI_CLASS_TEMP;
          grid.setWalkableAt(i, j, false);
        }
      } catch (err) {
        console.log({ i, j });
        throw err;
      }
    }
  }
}

function markFireRecursive(startX, startY, fireDistance) {
  if (fireDistance <= 0) return;
  //   console.log({ fireDistance });
  let fireR = startX;
  let fireC = startY;
  //   console.log({ x: rowLimit, y: colLimit });
  // console.log({
  //   newXX: fireR + 1,
  //   newYY: fireC,
  //   val: document.getElementById(`${fireR + 1}-${fireC}`).className,
  // });

  // * X - 1 Y
  //   console.log({ newX: fireR - 1, newY: fireC });
  if (
    fireR - 1 < rowLimit &&
    fireR - 1 >= 0 &&
    fireC < colLimit &&
    document.getElementById(`${fireR - 1}-${fireC}`).className !== FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR - 1}-${fireC}`).className = FIRE_UI_CLASS;
    markFire(fireR - 1, fireC, fireDistance - 1);
  }

  //* X + 1 Y
  // console.log({ newX: fireR + 1, newY: fireC });
  if (
    fireR + 1 < rowLimit &&
    fireC < colLimit &&
    document.getElementById(`${fireR + 1}-${fireC}`).className !== FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR + 1}-${fireC}`).className = FIRE_UI_CLASS;
    markFire(fireR + 1, fireC, fireDistance - 1);
  }
  //
  // * X Y + 1
  //   console.log({ newX: fireR, newY: fireC + 1 });
  if (
    fireR < rowLimit &&
    fireC + 1 < colLimit &&
    document.getElementById(`${fireR}-${fireC + 1}`).className !== FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR}-${fireC + 1}`).className = FIRE_UI_CLASS;
    markFire(fireR, fireC + 1, fireDistance - 1);
  }
  //
  // * X  Y - 1
  console.log({ newXaa: fireR, newYaa: fireC - 1 });
  if (
    fireR < rowLimit &&
    fireC - 1 < colLimit &&
    fireC - 1 >= 0 &&
    document.getElementById(`${fireR}-${fireC - 1}`).className !== FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR}-${fireC - 1}`).className = FIRE_UI_CLASS;
    markFire(fireR, fireC - 1, fireDistance - 1);
  }
  //
  //* X + 1, Y + 1
  console.log({ newX: fireR + 1, newY: fireC + 1 });
  if (
    fireR + 1 < rowLimit &&
    fireC + 1 < colLimit &&
    document.getElementById(`${fireR + 1}-${fireC + 1}`).className !==
      FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR + 1}-${fireC + 1}`).className =
      FIRE_UI_CLASS;
    markFire(fireR + 1, fireC + 1, fireDistance - 1);
  }
  //* X - 1, Y -1
  // console.log({ newX: fireR - 1, newY: fireC - 1 });
  if (
    fireR - 1 < rowLimit &&
    fireR - 1 >= 0 &&
    fireC - 1 >= 0 &&
    fireC - 1 < colLimit &&
    document.getElementById(`${fireR - 1}-${fireC - 1}`).className !==
      FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR - 1}-${fireC - 1}`).className =
      FIRE_UI_CLASS;
    markFire(fireR - 1, fireC - 1, fireDistance - 1);
  }
  //
  //* X - 1, Y + 1
  if (
    fireR - 1 < rowLimit &&
    fireR - 1 >= 0 &&
    fireC + 1 < colLimit &&
    document.getElementById(`${fireR - 1}-${fireC + 1}`).className !==
      FIRE_UI_CLASS
  ) {
    // console.log({ newX: fireR - 1, newY: fireC + 1 });
    document.getElementById(`${fireR - 1}-${fireC + 1}`).className =
      FIRE_UI_CLASS;
    markFire(fireR - 1, fireC + 1, fireDistance - 1);
  }
  //
  // * X + 1, Y - 1
  //   console.log({ newX: fireR + 1, newY: fireC - 1 });
  if (
    fireR + 1 < rowLimit &&
    fireC - 1 < colLimit &&
    fireC - 1 >= 0 &&
    document.getElementById(`${fireR + 1}-${fireC - 1}`).className !==
      FIRE_UI_CLASS
  ) {
    document.getElementById(`${fireR + 1}-${fireC - 1}`).className =
      FIRE_UI_CLASS;
    markFire(fireR + 1, fireC - 1, fireDistance - 1);
  }
  //

  //   return;
}
//
