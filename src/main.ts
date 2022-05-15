import { startFaviconSwitching } from './favicon';
import { createMenu } from './menu';

const FAVICON_CYCLE = 10;

function main() {
  startFaviconSwitching(FAVICON_CYCLE * 1000);

  const menu = createMenu();
  document.body.appendChild(menu);
}

window.addEventListener('DOMContentLoaded', main);
