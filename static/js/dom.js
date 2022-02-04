// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";
import {dragging} from "./dragging.js"

export let dom = {
    init: function () {
        const boardsContainer = document.getElementById('boards');
        dom.toggleArchive(boardsContainer);
        dom.archiveCard(boardsContainer)
        dom.removeColumn(boardsContainer)
        dom.expandBoard(boardsContainer)
        dom.removeFromArchive(boardsContainer)
        dom.addColumns(boardsContainer)
        dom.addNewCard(boardsContainer)
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
        });
    },
    showNewBoard: function() {
        // appends new created board with ajax
        dataHandler.getBoards(function(boards) {
            // last board from the list of boards (last object from a list of objects)
            let last = [Object.values(boards)[Object.values(boards).length-1]];
            dom.showBoards(last)
        })
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        let boardList = '';

        for(let board of boards){
            boardList += dom.boardBuilder(board.id, board.title, board.type)
        }

        const outerHtml = `
            <ul class="board-container">
                ${boardList}
        `;

        let boardsContainer = document.querySelector('#boards');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);

        dom.loadStatuses()

        // loads cards for each board
        for (let board of boards) {
            dom.loadCards(board.id)
            dom.loadArchivedCards(board.id)
        }
        //drag function is called after 2 sec - after the data is fetched from the backed with AJAX
        setTimeout(function() {
            dom.dragCards()
        }, 1000)
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(cards);
        })
    },
    loadArchivedCards: function(boardId) {
        dataHandler.getArchivedCardsByBoardId(boardId, function (cards) {
            dom.appendArchivedCards(cards);
        })
    },
    appendArchivedCards: function(cards) {
        const cardsContainers = document.getElementsByClassName('archived-cards')
        for (let container of cardsContainers) {
            for (let card of cards) {
                if (container.getAttribute('data-archive-id') === card.board_id) {
                    const newCard = dom.archivedCardBuilder(card.id, card.title, card.status)
                    container.innerHTML += newCard;
                }
            }
        }
    },
    showCards: function (cards) {
        // gets all the columns container divs, slices them accordingly, and appends the cards
        const boardNumber = parseInt(cards[0].board_id) - 1
        let columnContainer = []
        const numberOfBoards = document.getElementsByClassName('board').length
        const cardsContainer = document.getElementsByClassName('board-column-content')
        const numberOfStatuses = cardsContainer.length/numberOfBoards
        for (let col of cardsContainer) {
            columnContainer.push(col)
        }
        let columns = columnContainer.slice(boardNumber * numberOfStatuses, boardNumber * numberOfStatuses + numberOfStatuses)

        for (let column of columns) {
            const status = column.getAttribute('data-status')
            for (let card of cards) {
                if (status === card.status_id) {
                    const newCard = dom.cardBuilder(card.id, card.title)
                    column.innerHTML += newCard;
                }
            }
        }
    },
    // creates a new board text input field
    addBoards: function () {
        const addBoardButton = document.getElementById('create-new-board');
        addBoardButton.addEventListener('click', function (){
            dom.getBoardInput('board-input');
        })

    },
    addPrivateBoard: function () {
        const addBoardButton = document.getElementById('add-private-board');
        addBoardButton.addEventListener('click', function (){
            dom.getBoardInput('private-board-input');
        })
    },
    getBoardInput (domElement) {
        const titleInput = document.getElementById(domElement)
        titleInput.innerHTML = 'Enter board name';
        document.getElementById('buttons-misc').appendChild(titleInput);
        titleInput.contentEditable = "true";
    },
    savePrivateBoard: function () {
        const saveBoardButton = document.getElementById('save-private-board');
        saveBoardButton.addEventListener('click', function () {
            let title = document.getElementById('private-board-input')
            dataHandler.createNewPrivateBoard(title.textContent, function(){
            dom.showNewBoard();
         });
            title.innerHTML = '';
            title.contentEditable = "false";
    })},
    reloadBoards: function () {
        // adds public board, the board has to be added before the private boards, all the boards are removed and then read
        const boardsDiv = document.getElementById('boards')
        boardsDiv.innerHTML = ''
        dom.loadBoards();
    },
    // saves the name of the new board
    saveBoard: function () {
        const saveBoardButton = document.getElementById('save-board');
        saveBoardButton.addEventListener('click', function () {
            let title = document.getElementById('board-input')
            dataHandler.createNewBoard(title.textContent, function(){
                dom.showNewBoard()
         });
            title.innerHTML = '';
            title.contentEditable = "false";
    })},
    // renames titles once the save titles is hit
    renameTitle: function() {
        const boardsTitles = document.getElementsByClassName('board-title');
        const renameTitlesBtn = document.getElementById('save-board-name');
        renameTitlesBtn.addEventListener('click', function () {
            let titles = [];
            for (let title of boardsTitles) {
            titles.push(title.textContent);
        }
        dataHandler.renameBoards(titles);
        })
    },
    expandBoard: function (expandHandler) {
        // for the clicked button finds the boards div neighbour node - adds or removes it by the data-state attribute
        // expands columns and buttons
        expandHandler.addEventListener('click', function (event) {
            if (event.target.className === 'board-toggle') {
                let columnContainer = event.target.parentNode.nextElementSibling
                if (columnContainer.getAttribute('data-state') === 'closed') {
                    columnContainer.setAttribute('data-state','open');
                    event.target.parentNode.nextElementSibling.style.display = 'flex';
                    event.target.parentNode.firstElementChild.nextElementSibling.style.display = 'inline';
                } else {
                    columnContainer.setAttribute('data-state','closed')
                    event.target.parentNode.nextElementSibling.style.display = 'none';
                    event.target.parentNode.firstElementChild.nextElementSibling.style.display = 'none';
                }
            }
        });
    },
    addColumns: function (boardsDiv) {
        // ads a new column/status to the db - AJAX
        boardsDiv.addEventListener('click', function (event) {
            if (event.target.className === 'column-add') {
                const input = event.target.nextElementSibling;
                const columnTitle = input.value;
                if (columnTitle === '') {
                    alert('Empty field. Please enter a column name!')
                    return
                }
                dataHandler.addNewColumn(input.value)
                const columnsContainer = event.target.parentNode.parentNode.nextElementSibling
                const newColumn = `
                                       <div class="board-column">
                                            <div class="board-column-title">${columnTitle}</div>
                                            <div class="board-column-content" data-status="${columnTitle}">                                            
                                                                    </div>
                                       </div>
                                       `
                columnsContainer.insertAdjacentHTML('beforeend', newColumn)

            }
        })
    },
    renameColumnOrCard: function (renameField) {
        const boardsDiv = document.getElementById('boards')
        boardsDiv.addEventListener('click', function (event) {
            if (event.target.className === renameField) {
                let field = event.target;
                const initialColumnName = field.textContent;
                field.contentEditable = 'true';
                field.addEventListener('keyup', function (event) {
                    if (event.keyCode === 13) {
                        // posts data with new column name and old column name
                        if (renameField === 'board-column-title'){
                            // const bothColumnNames = [field.textContent, initialColumnName]
                            dataHandler.renameColumn([field.textContent, initialColumnName]);
                            // dom.loadBoards();
                        } else if (renameField === 'card-title') {
                            const cardId = event.target.getAttribute('data-cardtitle-id');
                            dataHandler.renameCard([field.textContent, cardId]);
                        }
                        field.contentEditable = 'false';
                    } else if (event.keyCode === 27) {
                        field.textContent = initialColumnName
                        field.contentEditable = 'false'
                    }
                })
            }
        })
    },
    // gets statuses with AJAX and calls the callback function
    loadStatuses: function () {
        dataHandler.getStatuses(function (columns) {
            dom.showColumns(columns)
        })
    },
    // get statuses, grab the board columns div and then insert the a loop with each status in that div - AJAX
    showColumns: function(columns) {
        const boards = document.getElementsByClassName('board-columns');
        let columnsList = '';
        for (let column of columns) {
            columnsList += `    
                            <div class="board-column" data-status-delete="${column.id}">
                                            <div class="board-column-title">${column.title}<button data-column-id="${column.id}" class="col-remove-btn">X</button></div>
                                            <div class="board-column-content" data-status="${column.title}" data-status-id="${column.id}">                                            
                                                                    </div>
                            </div>
                            `
        }
        for (let board of boards) {
            board.innerHTML = columnsList;
        }

    },
    addNewCardToDOM: function (title, column) {
        const card = `<div class="card" draggable="true">
                            <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                            <div class="card-title">${title}</div>
                        </div>
                      `
        column.innerHTML += card;
        dom.dragCards()
    },
    addNewCard: function (boardsDiv) {
        // ads a new card to the db and calls a callback function which adds the card to the DOM
        boardsDiv.addEventListener('click', function(event){
            if (event.target.className === 'card-add') {
                const addNewCardBtn = event.target
                let cardTitleInput = addNewCardBtn.nextElementSibling.value
                if (cardTitleInput === '') {
                    alert('Empty field. Please enter a card name!')
                    return
                }
                addNewCardBtn.nextElementSibling.value = '';
                const boardId = addNewCardBtn.parentNode.parentNode.parentNode.getAttribute('data-board-id')
                // creates a variable with column div where the card can be appended and passes it to the add to dom function
                const cardColumn = addNewCardBtn.parentNode.parentNode.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling
                dataHandler.createNewCard(cardTitleInput, boardId,'0', function () {
                    dom.addNewCardToDOM(cardTitleInput, cardColumn)
                })
            }
        })
    },
    dragCards: function () {
        // drag functionality
        const dropZones = document.getElementsByClassName('board-column-content');
        const draggables = document.getElementsByClassName('card');
        dragging.initDragAndDrop(draggables, dropZones);
    },
    deleteBoard: function () {
        // delete public or private board
        const boardsDiv = document.getElementById('boards')
        boardsDiv.addEventListener('click', function (event) {
            if (event.target.className === 'delete-board') {
                const boardId = event.target.parentNode.parentNode.getAttribute('data-board-id')
                if (event.target.getAttribute('data-board-type') === 'private') {
                    dataHandler.deletePrivateBoardHandler(boardId);
                } else {
                    dataHandler.deletePublicBoardHandler(boardId);
                }
                const boardToBeDeleted = document.querySelector(`[data-board-number="${boardId}"]`);
                boardToBeDeleted.remove();
            }
        })
    },
    removeCard: function() {
        const board = document.getElementById('boards');
        board.addEventListener('click', function (event) {
            if (event.target.className === 'remove-btn') {
                const cardId = event.target.getAttribute('data-card-id');
                const card = event.target.parentNode.parentNode;
                // removes card div and deletes it from the db
                card.remove();
                dataHandler.deleteCard(cardId);
            }
        })
    },
    removeColumn: function(board) {
        board.addEventListener('click', function (event) {
            if (event.target.className === 'col-remove-btn') {
                const columnId = event.target.getAttribute('data-column-id')
                // gets all the columns with columnId and deletes them
                const deletedColumns = document.querySelectorAll(`[data-status-delete="${columnId}"]`)
                for (let column of deletedColumns) {
                    column.remove();
                }
                dataHandler.deleteColumn(columnId)
            }
        })
    },
    archiveCard: function (boardsContainer) {
        boardsContainer.addEventListener('click', function(event){
            if (event.target.className === 'archive-btn') {
                const cardId = event.target.nextSibling.getAttribute('data-card-id')
                const card = event.target.parentNode.parentNode
                const cardName = card.getAttribute('data-card-attribute')
                dataHandler.archiveCardToDB(cardId);
                dataHandler.deleteCard(cardId);
                //appending the card to the archive container
                dom.addingToArchive(card, cardId, cardName);
            }
        })
    },
    addingToArchive: function(card, cardId, cardName) {
        const archiveContainerId = card.parentNode.parentNode.parentNode.getAttribute('data-board-id')
        const archiveContainer = document.querySelector(`[data-archive-id="${archiveContainerId}"]`)
        const newCard = dom.archivedCardBuilder(cardId, cardName);
        archiveContainer.innerHTML += newCard
        card.remove()
    },
    toggleArchive: function (btn) {
        // toggles archive by clicking the button
        btn.addEventListener('click', function(event){
            if (event.target.className === 'toggle-archive') {
                const boardId = event.target.getAttribute('data-board-title');
                console.log(boardId);
                // const archives = document.getElementsByClassName('archived-cards')[boardId - 1];
                const archives = document.querySelector(`[data-archive-id="${boardId}"]`);
                if (archives.getAttribute('data-state') === 'closed') {
                    archives.setAttribute('data-state', 'open');
                    archives.style.display = 'grid';
                } else {
                    archives.setAttribute('data-state', 'closed');
                    archives.style.display = 'none';
                }
            }
        })
    },
    removeFromArchive: function (button) {
        button.addEventListener('click', function (event) {
            if (event.target.className === 'unarchived-btn') {
                // removes the card from archived cards, adds it to the cards db, removes the div and then appends the div to the previous column
                const cardId = event.target.nextElementSibling.getAttribute('data-card-id')
                const card = document.querySelector(`[data-card-id="${cardId}"]`).parentNode
                dataHandler.getCard(cardId, function (cardDetails) {
                    const columnContainer = document.querySelector(`[data-board-last="${cardDetails.board_id}"]`)
                    const column = columnContainer.children[cardDetails.status_id]
                    const newCard = dom.cardBuilder(cardDetails.id, cardDetails.title)
                    column.children[1].innerHTML += (newCard);
                })
                dataHandler.removeCardFromArchiveDB(cardId);
                card.remove();
            }
        })
    },
    cardBuilder: function (id, title) {
        return `<div class="card" draggable="true" data-card-attribute="${title}">
                            <div class="card-remove" data-card-id="${id}"><button class="archive-btn">a</button><button data-card-id="${id}" class="remove-btn">X</button></div>
                            <div class="card-title" data-cardtitle-id = ${id}>${title}</div>
                        </div>`
    },
    boardBuilder: function(id, title, type) {
        return `
        <li data-board-number="${id}">    
                <section class="board" data-board-id="${id}">
                    <div class="board-header"><span contenteditable="true" class="board-title">${title}</span>
                        <div class="buttons-container" style="display:none;">
                            <button class="column-add">Add Column</button>
                            <input class="column-input">
                            <button class="card-add">Add Card</button>
                            <input class="card-input">
                            <button class="toggle-archive" data-board-title="${id}" data-state="closed">ARCHIVE</button>
                        </div>
                        <button data-board-type="${type}" class="delete-board"><i class="fas fa-compress-arrows-alt"></i></button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="board-columns" data-state = "closed" style="display: none;" data-board-id="${id}" data-board-last="${id}">
                    </div>
                </section>
                <h4 data-archivedtitle-id="${id}">Archived cards - ${title}</h4>
                <div class="archived-cards" data-archive-id="${id}"></div>
            </li>
            `;
    },
    archivedCardBuilder: function (id, title, status) {
        return `<div class="card" draggable="true" data-card-attribute="${title}" data-card-status="${status}">
                            <div class="card-remove" data-card-id="${id}"><button class="unarchived-btn">U</button><button data-card-id="${id}" class="remove-btn">X</button></div>
                            <div class="card-title">${title}</div>
                        </div>`
    },
};
