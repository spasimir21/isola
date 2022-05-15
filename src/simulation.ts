import { Signal } from './signal';

type CellPosition = [number, number];

enum CellState {
  Clear,
  Player1,
  Player2,
  Destroyed
}

enum GameState {
  Move,
  Destroy,
  Win
}

enum Player {
  Player1,
  Player2
}

class IsolaSimulation {
  public readonly onCellStateChange = new Signal<[position: CellPosition, state: CellState]>();
  public readonly onGameStateChange = new Signal<[state: GameState, player: Player]>();

  private readonly cells: CellState[][] = [];
  public readonly size: number;

  // prettier-ignore
  public readonly playerPositions: [CellPosition, CellPosition] = [[-1, -1], [-1, -1]];
  private _playableCells: CellPosition[] = [];
  private _currentPlayer: Player;
  private _state: GameState;

  get state() {
    return this._state;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  get playableCells() {
    return this._playableCells;
  }

  constructor(size: number) {
    if (!Number.isInteger(size) || size < 3 || size > 51 || size % 2 == 0)
      throw new Error("Isola's grid size must be a whole number, odd and between 3 and 51!");

    for (let i = 0; i < size; i++) this.cells.push(new Array(size).fill(0));
    this.size = size;
  }

  public init() {
    const p1Position: CellPosition = [Math.floor(this.size * Math.random()), Math.floor(this.size * Math.random())];

    let p2Position: CellPosition = [-1, -1];
    do {
      p2Position = [Math.floor(this.size * Math.random()), Math.floor(this.size * Math.random())];
    } while (p2Position[0] == p1Position[0] || p2Position[1] == p1Position[1]);

    this.movePlayer(Player.Player1, p1Position);
    this.movePlayer(Player.Player2, p2Position);
    this.setGameState(GameState.Move, Player.Player1);

    this.updatePlayableCells();
  }

  // 1 - currentPlayer flips the current player
  public makePlay(cell: CellPosition, unsafe: boolean = false): boolean {
    if (!unsafe && !this.isLegalPlay(cell)) return false;
    if (this.state == GameState.Win) return false;

    // Update cells
    if (this.state == GameState.Move) this.movePlayer(this.currentPlayer, cell);
    else this.setCellState(cell, CellState.Destroyed);

    // Check win
    const winner = this.checkWin();
    if (winner != null) {
      this.setGameState(GameState.Win, winner);
      return true;
    }

    // Update game state
    if (this.state == GameState.Move) this.setGameState(GameState.Destroy, this.currentPlayer);
    else this.setGameState(GameState.Move, 1 - this.currentPlayer);

    return true;
  }

  private isLegalPlay(cell: CellPosition): boolean {
    for (const position of this.playableCells) {
      if (position[0] == cell[0] && position[1] == cell[1]) return true;
    }

    return false;
  }

  // 1 - currentPlayer flips the current player
  private checkWin(): Player | null {
    if (this.getDestinationCells(1 - this.currentPlayer).length == 0) return this.currentPlayer;
    if (this.getDestinationCells(this.currentPlayer).length == 0) return 1 - this.currentPlayer;
    return null;
  }

  private updatePlayableCells() {
    // prettier-ignore
    this._playableCells = this.state == GameState.Move ? this.getDestinationCells(this.currentPlayer)
      : this.state == GameState.Destroy ? this.getDestroyableCells()
      : [];
  }

  private getDestinationCells(player: Player): CellPosition[] {
    const [y, x]: CellPosition = this.playerPositions[player];
    const cells: CellPosition[] = [];

    if (y > 0) {
      if (x > 0 && this.cells[y - 1][x - 1] == CellState.Clear) cells.push([y - 1, x - 1]);
      if (this.cells[y - 1][x] == CellState.Clear) cells.push([y - 1, x]);
      if (x < this.size - 1 && this.cells[y - 1][x + 1] == CellState.Clear) cells.push([y - 1, x + 1]);
    }

    if (x > 0 && this.cells[y][x - 1] == CellState.Clear) cells.push([y, x - 1]);
    if (x < this.size - 1 && this.cells[y][x + 1] == CellState.Clear) cells.push([y, x + 1]);

    if (y < this.size - 1) {
      if (x > 0 && this.cells[y + 1][x - 1] == CellState.Clear) cells.push([y + 1, x - 1]);
      if (this.cells[y + 1][x] == CellState.Clear) cells.push([y + 1, x]);
      if (x < this.size - 1 && this.cells[y + 1][x + 1] == CellState.Clear) cells.push([y + 1, x + 1]);
    }

    return cells;
  }

  private getDestroyableCells(): CellPosition[] {
    const cells: CellPosition[] = [];

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.cells[y][x] == CellState.Clear) cells.push([y, x]);
      }
    }

    return cells;
  }

  private movePlayer(player: Player, destination: CellPosition) {
    if (this.playerPositions[player][0] != -1 && this.playerPositions[player][1] != -1)
      this.setCellState(this.playerPositions[player], CellState.Clear);

    this.setCellState(destination, player + 1); // + 1 to convert from Player to CellState enum
    this.playerPositions[player] = destination;
  }

  private setCellState(position: CellPosition, state: CellState) {
    this.cells[position[0]][position[1]] = state;
    this.onCellStateChange.send(position, state);
  }

  private setGameState(state: GameState, player: Player) {
    this._state = state;
    this._currentPlayer = player;
    this.updatePlayableCells();
    this.onGameStateChange.send(state, player);
  }
}

export { IsolaSimulation, CellPosition, CellState, GameState, Player };
