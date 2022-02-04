from flask import Flask, render_template, request, redirect, url_for, session, escape, make_response, flash
from util import json_response
import persistence
import data_handler
import password

app = Flask(__name__)
app.config['SECRET_KEY'] = 'TechWithTim'


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html', user=session)


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards, including private boards
    If the user is logged in, it checks if the user
    created any private boards and then updates the list
    """
    boards = data_handler.get_boards()
    if 'user' not in session:
        return boards
    else:
        boards = data_handler.add_private_boards(session)
        return boards


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id, "board")


@app.route("/get-archived-cards/<int:board_id>")
@json_response
def get_archived_cards_for_board(board_id: int):
    """
    All archived cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id, "archived_board")


@app.route('/add-board', methods=['GET', 'POST'])
@json_response
def add_new_board():
    data = request.get_json()
    return persistence.add_board(persistence.BOARDS_FILE, data)


@app.route('/update-board-titles', methods=['POST'])
@json_response
def rename_titles():
    data = request.get_json()
    """
    Updates all boards titles
    """
    return persistence.update_boards_title(persistence.BOARDS_FILE, data)


@app.route('/add-column', methods=['POST'])
@json_response
def add_new_column():
    data = request.get_json()
    # print(data)
    return persistence.add_column(persistence.STATUSES_FILE, data)


@app.route('/get-statuses')
@json_response
def get_statuses_endpoint():
    # only works if the argument is true for get_statuses - cache will be ignored
    return persistence.get_statuses(True)


@app.route('/update-column-name', methods=['POST'])
@json_response
def update_columns_name():
    """
    Updates designated column name
    """
    data = request.get_json()
    print(data)
    return persistence.rename_status(persistence.STATUSES_FILE, data[0], data[1])


@app.route('/create-new-card', methods=['POST'])
@json_response
def add_new_card():
    """
    Adds a new card to the db
    """
    data = request.get_json()
    print(data)
    return persistence.create_new_card(persistence.CARDS_FILE, data[2], data[0], data[1])


@app.route('/update-cards-order', methods=['POST'])
@json_response
def change_cards_order():
    """
    Changes the order of the cards after
    a card has been dragged and dropped within the same column
    """
    data = request.get_json()
    print(data)
    return persistence.update_cards_order(persistence.CARDS_FILE, data)


@app.route('/rename_card', methods=['POST'])
@json_response
def rename_card():
    """
    Renames the clicked card
    """
    data = request.get_json()
    print(data)
    return persistence.rename_card(persistence.CARDS_FILE, data[0], data[1])


@app.route('/add-private-board', methods=['POST'])
@json_response
def get_private_boards():
    """
    Adds private board
    """
    data = request.get_json()
    print(data)
    return persistence.add_private_board(persistence.PRIVATE_BOARDS_FILE, data, session['user'])


@app.route('/register-user', methods=['GET', 'POST'])
def register_page():
    if request.method == 'POST':
        username = request.form['username']
        used_password = request.form['password']
        hashed_password = password.hash_password(used_password)
        persistence.add_new_user(persistence.CREDENTIALS_FILE, username, hashed_password)
        return redirect(url_for('index'))
    return render_template('register.html')


@app.route('/login-user', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        username = request.form['username']
        used_password = request.form['password']
        users = persistence.get_users(persistence.CREDENTIALS_FILE)
        print(users)
        for user in users:
            if user['username'] == username and password.verify_password(used_password, user['password']):
                session['user'] = username
                return redirect(url_for('index'))
        flash('Incorrect username or password')
    return render_template('login.html')


@app.route('/logout')
def logout_page():
    if 'user' in session:
        session.pop('user', None)
        return redirect(url_for('index'))


@app.route('/delete-public-board', methods=['POST'])
@json_response
def delete_public_board():
    data = request.get_json()
    print(data)
    persistence.delete_board(persistence.BOARDS_FILE, data, 'public')
    return persistence.delete_cards_by_criteria(persistence.CARDS_FILE, data, 'board_id')


@app.route('/delete-private-board', methods=['POST'])
@json_response
def delete_private_board():
    data = request.get_json()
    print(data)
    persistence.delete_board(persistence.PRIVATE_BOARDS_FILE, data, 'private')
    return persistence.delete_cards_by_criteria(persistence.CARDS_FILE, data, 'board_id')


@app.route('/delete-card', methods=['POST'])
@json_response
def delete_card():
    data = request.get_json()
    print(data)
    return persistence.delete_cards_by_criteria(persistence.CARDS_FILE, data, 'card_id')


@app.route('/delete-column', methods=['POST'])
@json_response
def delete_column():
    data = request.get_json()
    persistence.delete_cards_by_criteria(persistence.CARDS_FILE, data, 'status_id')
    return persistence.delete_status(persistence.STATUSES_FILE, data)


@app.route('/archive-card', methods=['POST'])
@json_response
def archive_card():
    data = request.get_json()
    print(data)
    return persistence.archive_card(persistence.ARCHIVED_CARDS_FILE, persistence.CARDS_FILE, data)


@app.route('/retrieve-card/<card_id>')
@json_response
def get_card(card_id):
    return persistence.get_card(card_id)


@app.route('/de-archive-card', methods=['POST'])
@json_response
def de_archive_card():
    data = request.get_json()
    print(data)
    persistence.archive_card(persistence.CARDS_FILE, persistence.ARCHIVED_CARDS_FILE, data)
    return persistence.delete_cards_by_criteria(persistence.ARCHIVED_CARDS_FILE, data, 'card_id')


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
