// Solve
class SolveMines {
  CELL_NOT_OPEN = -2;
  CELL_MINE = -1;
  CELL_SAFE = 9;
  PROBABILITY_UNKNOWN = -1;
  PROBABILITY_SAFE = -2;
  PROBABILITY_MINE = -3;
  board;
  probability;

  constructor() {}

  getProbability(board) {
    this.board = board; // -2: not open ,-1: mine, 9: safe
    this.probability = Array(this.board?.length)
      .fill()
      .map(() => Array(this.board[0]?.length).fill(this.PROBABILITY_UNKNOWN)); // -1: unknown, -2: safe, -3: mine

    this.board.forEach((y, dy) => {
      y.forEach((x, dx) => {
        if (x >= 1 && x <= 8) {
          this.calcProbability(dx, dy, x);
        }
      });
    });

    return this.probability;
  }

  print() {
    let printData = this.probability.map((y) =>
      y.map((cell) => {
        switch (cell) {
          case this.PROBABILITY_UNKNOWN:
            return "Unk";
          case this.PROBABILITY_SAFE:
            return "Safe";
          case this.PROBABILITY_MINE:
            return "Mine";
          default:
            return cell;
        }
      })
    );

    this.board.forEach((y, dy) => {
      y.forEach((x, dx) => {
        if (x >= 1 && x <= 8) {
          printData[dy][dx] = x;
        } else if (x === 0) {
          printData[dy][dx] = "";
        } else if (x === -1) {
          printData[dy][dx] = "Mine";
        }
      });
    });

    console.table(printData);
  }

  getAdjacentCells(x, y) {
    const direction = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    const adjacentCells = [];
    direction.forEach((e) => {
      const adjacentCellX = e[0] + x;
      const adjacentCellY = e[1] + y;
      if (
        adjacentCellX >= 0 &&
        adjacentCellX <= this.board[0]?.length - 1 &&
        adjacentCellY >= 0 &&
        adjacentCellY <= this.board?.length - 1
      ) {
        adjacentCells.push([
          adjacentCellX,
          adjacentCellY,
          this.board[adjacentCellY][adjacentCellX],
        ]);
      }
    });

    return adjacentCells;
  }

  // Kiểm tra tỉ lệ có bom của các ô
  calcProbability(x, y, numberMine) {
    const adjacentCells = this.getAdjacentCells(x, y);
    let totalMines = 0;
    const safeArr = [];
    const notOpenCells = [];

    adjacentCells.forEach((e) => {
      switch (e[2]) {
        case this.CELL_MINE:
          totalMines++;
          break;
        case this.CELL_SAFE:
          safeArr.push([e[0], e[1]]);
          break;
        case this.CELL_NOT_OPEN:
          notOpenCells.push([e[0], e[1]]);
          break;
        default:
          break;
      }
    });

    if (numberMine === totalMines) {
      adjacentCells.forEach((e) => {
        if (e[2] === this.CELL_NOT_OPEN) {
          this.board[e[1]][e[0]] = this.CELL_SAFE;
          this.probability[e[1]][e[0]] = this.PROBABILITY_SAFE;
        }
      });
    } else if (numberMine > totalMines) {
      const remainingMines = numberMine - totalMines;
      let probabilityMine = (remainingMines / notOpenCells.length) * 100;

      if (notOpenCells.length === remainingMines) {
        probabilityMine = this.PROBABILITY_MINE;
      }

      notOpenCells.forEach((e) => {
        if (this.probability[e[1]][e[0]] >= this.PROBABILITY_UNKNOWN) {
          if (probabilityMine === this.PROBABILITY_MINE) {
            this.board[e[1]][e[0]] = this.CELL_MINE;
            this.probability[e[1]][e[0]] = this.PROBABILITY_MINE;
          } else {
            this.probability[e[1]][e[0]] += probabilityMine;
          }
        }
      });
    }
  }
}

// Run auto click in https://minesweeper.online/
function getBoard() {
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

      cellElements[row].push(getCell(element.classList));
    }
  });

  return cellElements;
}

function getCell(classList) {
  // -2: not open ,-1: mine, 9: safe

  const regex = /^hd_type(\d+)$/;
  for (const item of classList) {
    const match = item.match(regex);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  if (classList.contains("hd_flag")) {
    return -1;
  }

  return -2;
}

function simulateClick(element, mouseButton) {
  const options = {
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
  };

  const eventMouseDown = new MouseEvent("mousedown", options);
  const eventMouseUP = new MouseEvent("mouseup", options);

  document.querySelectorAll(element)[0].dispatchEvent(eventMouseDown);
  document.querySelectorAll(element)[0].dispatchEvent(eventMouseUP);
}

function solveGame() {
  const PROBABILITY_UNKNOWN = -1;
  const PROBABILITY_SAFE = -2;
  const PROBABILITY_MINE = -3;

  const board = getBoard();
  const solveMines = new SolveMines();
  const probability = solveMines.getProbability(board);

  const probabilityCells = [];

  probability.forEach((y, dy) => {
    y.forEach((x, dx) => {
      if (x === PROBABILITY_SAFE) {
        simulateClick(`#cell_${dx}_${dy}`);
        console.log(`Safe: (${dx}, ${dy})`);
        return;
      }

      if (x === PROBABILITY_MINE) {
        simulateClick(`#cell_${dx}_${dy}`, "right");
        console.log(`Flag: (${dx}, ${dy})`);
        return;
      }

      if (x > -1) {
        probabilityCells.push({
          x: dx,
          y: dy,
          value: x,
        });
        return;
      }
    });
  });

  const minProbability = Math.min(...probabilityCells.map((d) => d.value));
  const minCellList = probabilityCells.filter(
    (d) => d.value === minProbability
  );
  const randomMinCell =
    minCellList[Math.floor(Math.random() * minCellList.length)];

  if (randomMinCell) {
    simulateClick(`#cell_${randomMinCell.x}_${randomMinCell.y}`);
  }

  solveMines.print();
}

function start() {
  simulateClick(`#cell_0_0`);

  const solveGameIntervalId = setInterval(() => {
    solveGame();

    const topAreaFaceDom = document.getElementById("top_area_face");
    if (topAreaFaceDom.classList.contains("hd_top-area-face-win")) {
      clearInterval(solveGameIntervalId);
      console.log("Đã thắng");
    }

    const board = getBoard();
    board.forEach((y) => {
      y.forEach((x) => {
        if (x >= 10) {
          clearInterval(solveGameIntervalId);
          console.log("Chọn trúng mìn");
        }
      });
    });

    
  }, 800);
}

start();
