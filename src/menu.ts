import { createIsola } from './isola';

function createBoardSizeInput(): [HTMLDivElement, () => [number, boolean]] {
  const container = document.createElement('div');
  container.classList.add('board-size-input');

  const label = document.createElement('p');
  label.textContent = 'BOARD SIZE:';

  const input = document.createElement('input');
  input.value = '7';

  const preview = document.createElement('p');
  preview.textContent = 'X 7';

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(preview);

  const getSize: () => [number, boolean] = () => {
    const size = parseInt(input.value);
    return [size, !isNaN(size) && Number.isInteger(size) && size >= 3 && size <= 51 && size % 2 != 0];
  };

  input.addEventListener('input', () => {
    input.value = input.value.slice(0, 2);

    const [size, valid] = getSize();
    preview.textContent = `X ${isNaN(size) ? '?' : size}`;
    label.style.color = valid ? 'black' : 'red';
    preview.style.color = valid ? 'black' : 'red';
  });

  return [container, getSize];
}

function createPlayerNameInput(player: number, color: string): [HTMLDivElement, () => [string, boolean]] {
  const container = document.createElement('div');
  container.classList.add('player-name-input');

  const label = document.createElement('p');
  label.textContent = `PLAYER ${player}'S NAME:`;
  label.style.color = color;

  const input = document.createElement('input');
  input.value = `PLAYER ${player}`;

  container.appendChild(label);
  container.appendChild(input);

  const getName: () => [string, boolean] = () => [input.value, input.value.trim().length > 0];

  input.addEventListener('input', () => {
    const [_, valid] = getName();
    label.style.color = valid ? color : 'red';
  });

  return [container, getName];
}

function createPlayerNameInputs(count: number, colors: string[]): [HTMLDivElement, () => [string[], boolean]] {
  const container = document.createElement('div');
  container.classList.add('player-name-inputs');

  const nameGetters = [];
  for (let i = 0; i < count; i++) {
    const [input, getName] = createPlayerNameInput(i + 1, colors[i]);
    container.appendChild(input);
    nameGetters.push(getName);
  }

  return [
    container,
    () => {
      const results = nameGetters.map(getName => getName());
      return [results.map(result => result[0]), !results.some(result => !result[1])];
    }
  ];
}

function createMenu(): HTMLDivElement {
  const menu = document.createElement('div');
  menu.classList.add('menu');

  const title = document.createElement('h1');
  title.textContent = 'ISOLA';

  const [boardSizeInput, getBoardSize] = createBoardSizeInput();
  const [playerNameInputs, getNames] = createPlayerNameInputs(2, ['blue', 'darkred']);

  const playButton = document.createElement('p');
  playButton.classList.add('play-button');
  playButton.textContent = 'PLAY';

  menu.appendChild(title);
  menu.appendChild(boardSizeInput);
  menu.appendChild(playerNameInputs);
  menu.appendChild(playButton);

  playButton.addEventListener('click', () => {
    const [size, sizeValid] = getBoardSize();
    const [names, namesValid] = getNames();
    if (!sizeValid || !namesValid) return;

    const isola = createIsola(size, names);
    document.body.appendChild(isola.ui.element);
    menu.remove();
  });

  return menu;
}

export { createMenu };
