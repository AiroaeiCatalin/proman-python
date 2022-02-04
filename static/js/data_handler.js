// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it is a "cache for all data received: boards, cards and statuses. It is not accessed from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())  // parse the response as JSON
        .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        // it is not called from outside
        // sends the data to the API, and calls callback function
        fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(json_response => callback(json_response));
    },
    _simple_api_get : function (url) {
        // getting data without a callback function
        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())

    },
    _simple_api_post :function (url, data) {
        // posting data without a callback function
        fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(response => response.json())
    },
    init: function () {
    },
    getBoards: function ( callback) {
        // the boards are retrieved and then the callback function is called with the boards

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data['boards'] = response;
            callback(response);
        });
    },
    getPrivateBoards: function (callback) {
        this._api_get('/private-boards', (response) => {
            this._data['private_boards'] = response;
            callback(response);
        })
    },
    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
    },
    getStatuses: function (callback) {
        // the statuses are retrieved and then the callback function is called with the statuses
        this._api_get('/get-statuses', (response) => {
            this._data['statuses'] = response;
            callback(response);
        })
    },
    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`/get-cards/${boardId}`, (response) => {
            this._data['cards_by_id'] = response;
            callback(response);
        })
    },
    getArchivedCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`/get-archived-cards/${boardId}`, (response) => {
            this._data['cards_by_id'] = response;
            callback(response);
        })
    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
        this._api_get(`/retrieve-card/${cardId}`, (response) => {
            this._data['cards_by_id'] = response;
            callback(response);
        })
    },
    createNewBoard: function (boardTitle, callback) {
        // creates new board, saves it and calls the callback function with its data
        this._api_post('/add-board', boardTitle,(response) => {
            this._data['board'] = response;
            callback(response);
        })
    },
    createNewPrivateBoard: function (boardTitle, callback) {
        this._api_post('/add-private-board', boardTitle,(response) => {
            this._data['private-board'] = response;
            callback(response);
        })
    },
    renameBoards: function(titles) {
        this._simple_api_post('/update-board-titles', titles);
    },
    createNewCard: function (cardTitle, boardId, statusId, callback) {
        const data = [boardId, statusId, cardTitle]
        this._api_post('/create-new-card', data, (response) => {
            this._data['card'] = response;
            callback(response);
        })
    },
    addNewColumn: function (columnTitle) {
        this._simple_api_post('/add-column', columnTitle)
    },
    renameColumn: function (data) {
        this._simple_api_post('/update-column-name', data)
    },
    updateCardsOrder: function(data) {
        this._simple_api_post('/update-cards-order', data)
    },
    renameCard: function(data) {
        this._simple_api_post('/rename_card', data)
    },
    deletePublicBoardHandler(data) {
        this._simple_api_post('/delete-public-board', data);
    },
    deletePrivateBoardHandler(data) {
        this._simple_api_post('/delete-private-board', data)
    },
    deleteCard(data) {
        this._simple_api_post('/delete-card', data)
    },
    deleteColumn(data) {
        this._simple_api_post('/delete-column', data)
    },
    archiveCardToDB(data) {
        this._simple_api_post('/archive-card', data)
    },
    removeCardFromArchiveDB(data) {
        this._simple_api_post('/de-archive-card', data)
    },
};
