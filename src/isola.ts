import { IsolaSimulation, GameState, Player } from './simulation';
import { IsolaUI } from './ui';

interface Isola {
  simulation: IsolaSimulation;
  ui: IsolaUI;
}

function createIsola(gridSize: number, players: string[]): Isola {
  const simulation = new IsolaSimulation(gridSize);
  const ui = new IsolaUI(gridSize);

  simulation.onCellStateChange.listen((cell, state) => ui.setCellState(cell, state));

  simulation.onGameStateChange.listen((state, player) => {
    if (state == GameState.Move) ui.setTopText('MOVE', 'black');
    else if (state == GameState.Destroy) ui.setTopText('DESTROY', 'black');
    else ui.setTopText(`${players[player]} WINS!`, player == Player.Player1 ? 'blue' : 'red');

    ui.deactivateAllCells();
    for (const cell of simulation.playableCells) ui.activateCell(cell, state == GameState.Move);

    if (state == GameState.Win) ui.showEndControls();
    else ui.setBottomText(`${players[player]}'S TURN`, player == Player.Player1 ? 'blue' : 'red');
  });

  ui.onCellClicked.listen(cell => simulation.makePlay(cell, true));

  ui.init();
  simulation.init();

  return { simulation, ui };
}

export { createIsola };
