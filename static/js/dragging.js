// each card is draggable, adds and removes dragging class in order to change the opacity
import { dataHandler } from "./data_handler.js";

export let dragging = {
    initDragAndDrop: function (dragItems, dropZones) {
        this.initDrag(dragItems)
        this.initDrop(dropZones)
    },
    initDrag: function (items) {
        for (let item of items) {
            this.initDraggable(item)
        }
    },
    initDrop: function (items) {
        for (let item of items) {
            this.initDropzone(item)
        }
    },
    initDraggable: function(draggingItem) {
        draggingItem.addEventListener('dragstart', this.dragStartHandler);
        draggingItem.addEventListener('dragend', this.dragEndHandler);
    },
    initDropzone: function(dropArea) {
        dropArea.addEventListener('dragover', this.dragOver);
        dropArea.addEventListener('dragenter', this.dragEnter);
        dropArea.addEventListener('dragleave', this.dragLeave);
        dropArea.addEventListener('drop', this.dragDrop);
    },
    dragStartHandler: function () {
        // adds dragging class to the dragged element
        this.classList.add('dragging')
    },
    dragEndHandler: function () {
        this.classList.remove('dragging')
    },
    dragOver: function(e) {
        e.preventDefault();
    },
    dragEnter: function (e) {
        e.preventDefault();
    },
    dragLeave: function() {
    },
    dragDrop: function(event) {
        // looks for the element with the .dragging class and drops it to the new DOM place
        const dragged = document.querySelector('.dragging');
        this.appendChild(dragged);

        // variables for when the card is moved within the same column
        const dropColumnName = event.target.parentNode.parentNode.getAttribute('data-status-id')
        const boardId = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('data-board-id')
        const dropColumnCards = event.target.parentNode.parentNode.children

        // variables for when the card is moved to other column
        const otherColumnName = event.target.parentNode.getAttribute('data-status-delete')
        const otherColumnBoardId = event.target.parentNode.parentNode.getAttribute('data-board-id')
        const otherColumnKids = event.target.children
        // checks if the card is moved to another column or within the same column calls the function accordingly
        if (otherColumnKids.length > 0){
            dragging.changeOrderMovedCard(otherColumnKids, otherColumnName, otherColumnBoardId)
        } else {
            dragging.changeOrderMovedCard(dropColumnCards, dropColumnName, boardId)
        }

    },
    changeOrderMovedCard: function(columnOfCards, columnName, boardId) {
        let data = []
        let count = -1
        for (let card of columnOfCards) {
            console.log(card)
            count += 1
            data.push([card.firstElementChild.getAttribute('data-card-id'), card.getAttribute('data-card-attribute'), columnName, (count).toString(), boardId])
        }
        dataHandler.updateCardsOrder(data)

    }
}