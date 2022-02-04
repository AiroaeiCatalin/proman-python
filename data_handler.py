import persistence
import data_handler


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_boards():
    """
    Gather all boards
    :return:
    """
    return persistence.get_boards(force=True)


def get_cards_for_board(board_id, board_type):
    persistence.clear_cache()
    if board_type == "board":
        all_cards = persistence.get_cards()
    elif board_type == "archived_board":
        all_cards = persistence.get_archived_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    # sorted the cards dictionaries by the order key value pair
    return sorted(matching_cards, key=lambda x: x['order'])


def add_private_boards(session):
    boards = data_handler.get_boards()
    private_boards = persistence.redeem_private_boards(session)
    for board in private_boards:
        if board.get('user') == board.get('current_user'):
            boards.append({'id': board.get('id'), 'title': board.get('title'), 'type': 'private'})
    return boards


