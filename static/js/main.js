import { dom } from "./dom.js";

// This function is to initialize the application
function init() {
    // init data
    // loads the boards to the screen
    dom.loadBoards();
    // adds a new board
    dom.addBoards();
    dom.saveBoard();
    dom.renameTitle();
    // dom.expandBoard();
    // dom.addColumns();
    dom.renameColumnOrCard('board-column-title');
    dom.renameColumnOrCard('card-title')
    // dom.addNewCard();
    dom.deleteBoard();
    dom.addPrivateBoard();
    dom.savePrivateBoard();
    dom.removeCard();
    // dom.archiveCard();
    // dom.toggleArchive()
    dom.init()
}

init();
