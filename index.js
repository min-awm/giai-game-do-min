let cellGameData;

function main() {
  cellGameData = getCellGame();
  placeSafe(cellGameData);
}
main();

function getCellGame() {
  const allElements = document.querySelectorAll('[id^="cell_"]');
  const cellElements = [];
  const regex = /^cell_\d+_\d+$/;

  allElements.forEach((element) => {
    if (regex.test(element.id)) {
      const cell = element.id.split("_");
      const row = cell[2];

      if (!cellElements[row]) {
        cellElements.push([]);
      }

      cellElements[row].push(getNumberMines(element.classList));
    }
  });

  return cellElements;
}

function getNumberMines(classList) {
  const regex = /^hd_type(\d+)$/;
  for (const item of classList) {
    const match = item.match(regex);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return -1;
}

function placeSafe() {
  console.log(cellGameData);
  const check = checkSafe(4, 4);
  console.log(check);
  cellGameData.forEach((cellCol, col) => {
    cellCol.forEach((cellRow, row) => {
      const mine = cellGameData[row][col];
      if (mine === -1) {
        // console.log(cellGameData[col][row]);
      }
    });
  });
}

function checkSafe(row, col) {
  let adjacentItemCheck = getAdjacent(row, col);
  adjacentItemCheck = adjacentItemCheck.filter((e) => e.mine > 0 && e.mine < 9);

  let status = false;
  adjacentItemCheck.forEach((e) => {
    const numberMine = e.mine;
    let checkArr = getAdjacent(e.row, e.col);
    let hasMine = checkArr.filter((e) => e.mine > 9 );
    let canSelected = checkArr.filter((e) => e.mine === -1);

    console.log(hasMine);
    if (hasMine.length >= numberMine) {
      status = true;
    } else {
      const remainMine = numberMine - hasMine.length;

      if (canSelected.length === remainMine) {
        canSelected.forEach((e) => {
          cellGameData[e.row][e.col] = 10;
        });
      }
    }
  });
  

  return status;
}

function getAdjacent(row, col) {
  /*
        N.W   N   N.E
            \   |   /
            \  |  /
        W----Cell----E
                / | \
            /   |  \
        S.W    S   S.E

        Cell-->Current Cell (row, col)
        N -->  North        (row-1, col)
        S -->  South        (row+1, col)
        E -->  East         (row, col+1)
        W -->  West            (row, col-1)
        N.E--> North-East   (row-1, col+1)
        N.W--> North-West   (row-1, col-1)
        S.E--> South-East   (row+1, col+1)
        S.W--> South-West   (row+1, col-1)
    */
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

  let adjacentList = [];
  for (d = 0; d < 8; d++) {
    const newRow = row + dx[d];
    const newCol = col + dy[d];

    try {
      const mine = cellGameData[newRow][newCol];

      adjacentList.push({
        row: newRow,
        col: newCol,
        mine,
      });
    } catch (error) {}
  }

  return adjacentList;
}

function simulateClick(element, mouseButton) {
  const event = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: false,
    view: window,
    detail: 0,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: mouseButton === "right" ? 2 : 0,
    relatedTarget: null,
  });

  document.querySelectorAll(element)[0].dispatchEvent(event);
}

// simulateClick("#cell_15_4", "right");
