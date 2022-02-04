import csv

STATUSES_FILE = './data/statuses.csv'
BOARDS_FILE = './data/boards.csv'
CARDS_FILE = './data/cards.csv'
CREDENTIALS_FILE = './data/credentials.csv'
PRIVATE_BOARDS_FILE = './data/private-boards.csv'
ARCHIVED_CARDS_FILE = './data/archived_cards.csv'

_cache = {}  # We store cached data in this dict to avoid multiple file readings


def _read_csv(file_name):
    """
    Reads content of a .csv file
    :param file_name: relative path to data file
    :return: OrderedDict
    """
    with open(file_name) as boards:
        rows = csv.DictReader(boards, delimiter=',', quotechar='"')
        formatted_data = []
        for row in rows:
            formatted_data.append(dict(row))
        return formatted_data


def _get_data(data_type, file, force):
    """
    Reads defined type of data from file or cache
    :param data_type: key where the data is stored in cache
    :param file: relative path to data file
    :param force: if set to True, cache will be ignored
    :return: OrderedDict
    """
    if force or data_type not in _cache:
        _cache[data_type] = _read_csv(file)
    return _cache[data_type]


def clear_cache():
    for k in list(_cache.keys()):
        _cache.pop(k)


def get_statuses(force=False):
    return _get_data('statuses', STATUSES_FILE, force)


def get_boards(force=False):
    return _get_data('boards', BOARDS_FILE, force)


def get_cards(force=False):
    return _get_data('cards', CARDS_FILE, force)


def get_archived_cards(force=False):
    return _get_data('cards', ARCHIVED_CARDS_FILE, force)


def add_board(file_name, board_title):
    boards = _read_csv(file_name)
    new_board_id = int(boards[-1].get('id'))
    with open(file_name, 'a+') as boards:
        csv_dict_writer = csv.DictWriter(boards, fieldnames=['id', 'title'])
        csv_dict_writer.writerow({'id': new_board_id + 1, 'title': board_title})


def update_boards_title(file_name, boards_title):
    with open(file_name, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'title'], delimiter=',')
        writer.writeheader()
        counter = 0
        for title in boards_title:
            counter += 1
            writer.writerow({'id': counter, 'title': title})


def add_column(file_name, board_column):
    row_count = 0
    with open(file_name) as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_count += 1
    with open(file_name, 'a+') as columns:
        csv_dict_writer = csv.DictWriter(columns, fieldnames=['id', 'title'])
        csv_dict_writer.writerow({'id': row_count, 'title': board_column})


def rename_status(file_name, new_status_name, old_status_name):
    statuses = _read_csv(file_name)
    with open(file_name, 'w') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'title'])
        writer.writeheader()
        for row in statuses:
            if row['title'] == old_status_name[:-1]:
                row['title'] = new_status_name[:-1]
            writer.writerow(row)


def rename_card(file_name, new_card_name, card_id):
    cards = _read_csv(file_name)
    with open(file_name, 'w') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'board_id', 'title', 'status_id', 'order'])
        writer.writeheader()
        for card in cards:
            if card['id'] == card_id:
                card['title'] = new_card_name
            writer.writerow(card)


def create_new_card(filename, card_title, board_id, status_id):
    cards = _read_csv(filename)
    order = new_card_order(filename, board_id)
    with open(filename, 'a+') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'board_id', 'title', 'status_id', 'order'])
        writer.writerow({'id': len(cards) + 1, 'board_id': board_id, 'title': card_title, 'status_id': status_id,
                         'order': order})


def new_card_order(file_name, board_id):
    """
    # function for getting the order of new card,
    looks for how many cards are in the gives column and returns the length
    """
    first_column_cards = []
    cards = _read_csv(file_name)
    for card in cards:
        if card.get('board_id') == board_id and card.get('status_id') == '0':
            first_column_cards.append(cards)
    return len(first_column_cards)


def update_cards_order(filename, data):
    cards_file = _read_csv(filename)
    with open(filename, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'board_id', 'title', 'status_id', 'order'])
        writer.writeheader()
        for row in cards_file:
            for new_card in data:
                if row.get('id') == new_card[0] and row.get('title') == new_card[1]:
                    row = {'id': new_card[0], 'board_id': new_card[4], 'title': new_card[1], 'status_id': new_card[2],
                           'order': new_card[3]}
            writer.writerow(row)
            
            
def add_new_user(file_name, username, password):
    with open(file_name, 'a+') as file:
        writer = csv.DictWriter(file, fieldnames=['username', 'password'])
        writer.writerow({'username': username, 'password': password})


def get_users(file_name):
    f = []
    with open(file_name) as file:
        reader = csv.DictReader(file)
        for row in reader:
            f.append(row)
    return f


def \
        redeem_private_boards(user):
    boards = []
    private_boards = _read_csv(PRIVATE_BOARDS_FILE)
    for private in private_boards:
        private['current_user'] = user['user']
        boards.append(private)
    return boards


def get_last_board_id(boards, private_boards):
    if len(private_boards) and len(boards) > 0 == 0:
        return int(boards[-1].get('id'))
    if len(boards) == 0:
        return 0
    if int(boards[-1].get('id')) > int(private_boards[-1].get('id')):
        return int(boards[-1].get('id'))
    return int(private_boards[-1].get('id'))


def add_private_board(filename, board_title, user):
    boards = _read_csv(filename)
    private_boards = _read_csv(PRIVATE_BOARDS_FILE)
    last_board_id = get_last_board_id(boards, private_boards)
    with open(filename, 'a+') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'title', 'user'])
        writer.writerow({'id': last_board_id + 1, 'title': board_title, 'user': user})


def delete_board(file_name, board_id, type_of_board):
    boards = _read_csv(file_name)
    with open(file_name, 'w') as f:
        if type_of_board == 'public':
            writer = csv.DictWriter(f, fieldnames=['id', 'title'])
        else:
            writer = csv.DictWriter(f, fieldnames=['id', 'title', 'user'])
        writer.writeheader()
        for row in boards:
            if row['id'] != board_id:
                writer.writerow(row)


def delete_cards_by_criteria(file_name, used_id, criteria):
    cards = _read_csv(file_name)
    with open(file_name, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'board_id', 'title', 'status_id', 'order'])
        writer.writeheader()
        for card in cards:
            if criteria == 'board_id:':
                if card['board_id'] != used_id:
                    writer.writerow(card)
            elif criteria == 'card_id':
                if card['id'] != used_id:
                    writer.writerow(card)
            elif criteria == 'status_id':
                if card['status_id'] != used_id:
                    writer.writerow(card)


def delete_status(file_name, status_id):
    statuses = _read_csv(file_name)
    with open(file_name, 'w') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'title'])
        writer.writeheader()
        for row in statuses:
            if row['id'] != status_id:
                writer.writerow(row)


def archive_card(file_name, cards_source, card_id):
    cards = _read_csv(cards_source)
    for card in cards:
        if card['id'] == card_id:
            card_for_archive = card
    with open(file_name, 'a+') as file:
        writer = csv.DictWriter(file, fieldnames=['id', 'board_id', 'title', 'status_id', 'order'])
        writer.writerow(card_for_archive)


def get_card(card_id):
    cards = _read_csv(ARCHIVED_CARDS_FILE)
    for card in cards:
        if card['id'] == card_id:
            return card
