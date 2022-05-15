import { CellPosition, CellState } from './simulation';
import { createIsola } from './isola';
import { createMenu } from './menu';
import { Signal } from './signal';

class IsolaUI {
  public readonly onCellClicked = new Signal<[position: CellPosition]>();

  private readonly bottomText: HTMLParagraphElement;
  private readonly topText: HTMLParagraphElement;
  private readonly bottom: HTMLDivElement;
  private readonly top: HTMLDivElement;
  private readonly grid: HTMLDivElement;

  private readonly cells: HTMLDivElement[][] = [];
  public readonly element: HTMLDivElement;
  private readonly _size: number;

  get size() {
    return this._size;
  }

  constructor(size: number) {
    this._size = size;

    this.element = document.createElement('div');
    this.element.classList.add('game');

    this.topText = document.createElement('p');
    this.topText.classList.add('game-text');

    this.bottomText = document.createElement('p');
    this.bottomText.classList.add('game-text');

    this.top = document.createElement('div');
    this.top.classList.add('game-top');

    this.bottom = document.createElement('div');
    this.bottom.classList.add('game-bottom');

    this.grid = document.createElement('div');
    this.grid.classList.add('grid');

    this.top.appendChild(this.topText);
    this.bottom.appendChild(this.bottomText);

    this.element.appendChild(this.top);
    this.element.appendChild(this.grid);
    this.element.appendChild(this.bottom);
  }

  public init() {
    for (let y = 0; y < this.size; y++) {
      const row = document.createElement('div');
      row.classList.add('row');

      this.cells.push([]);
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'clear');

        const position: CellPosition = [y, x];
        cell.addEventListener('click', () => {
          if (!cell.classList.contains('active')) return;
          this.onCellClicked.send(position);
        });

        this.cells[y].push(cell);
        row.appendChild(cell);
      }

      this.grid.appendChild(row);
    }
  }

  public deactivateAllCells() {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.classList.remove('active', 'highlighted');
      }
    }
  }

  public setCellState(position: CellPosition, state: CellState) {
    const cell = this.cells[position[0]][position[1]];
    cell.classList.remove('clear', 'player1', 'player2', 'destroyed');
    // prettier-ignore
    cell.classList.add(
        state == CellState.Clear ? 'clear'
      : state == CellState.Destroyed ? 'destroyed'
      : state == CellState.Player1 ? 'player1'
      : 'player2'
    );
  }

  public activateCell(position: CellPosition, highlight: boolean = false) {
    const cell = this.cells[position[0]][position[1]];
    cell.classList.add('active');
    if (highlight) cell.classList.add('highlighted');
  }

  public setTopText(text: string, color: string = 'white') {
    this.topText.textContent = text;
    this.topText.style.color = color;
  }

  public setBottomText(text: string, color: string = 'white') {
    this.bottomText.textContent = text;
    this.bottomText.style.color = color;
  }

  public showEndControls() {
    this.bottomText.remove();

    const menuButton = document.createElement('div');
    menuButton.textContent = 'Back To Menu';
    menuButton.classList.add('game-button');

    menuButton.addEventListener('click', () => {
      this.element.remove();
      const menu = createMenu();
      document.body.appendChild(menu);
    });

    this.bottom.appendChild(menuButton);
  }
}

export { IsolaUI };
