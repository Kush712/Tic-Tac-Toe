from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------------------------------
# Home Route (Fixes "Not Found")
# -------------------------------
@app.route("/", methods=["GET"])
def home():
    return "Tic Tac Toe API is running!", 200


# -------------------------------
# Game State
# -------------------------------
game_state = {
    "board": [""] * 9,
    "current_player": "X",
    "winner": None,
    "game_over": False
}


# -------------------------------
# Check Winner Function
# -------------------------------
def check_winner(board):
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
        [0, 4, 8], [2, 4, 6]              # diagonals
    ]

    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != "":
            return board[combo[0]]
    return None


# -------------------------------
# Get Current Game State
# -------------------------------
@app.route("/api/game", methods=["GET"])
def get_game():
    return jsonify(game_state)


# -------------------------------
# Make a Move
# -------------------------------
@app.route("/api/move", methods=["POST"])
def make_move():
    data = request.json
    position = data.get("position")

    # Invalid move checks
    if position is None or position < 0 or position > 8:
        return jsonify({"error": "Invalid position"}), 400

    if game_state["game_over"]:
        return jsonify({"error": "Game already over"}), 400

    if game_state["board"][position] != "":
        return jsonify({"error": "Spot already taken"}), 400

    # Apply move
    game_state["board"][position] = game_state["current_player"]

    # Check win
    winner = check_winner(game_state["board"])
    if winner:
        game_state["winner"] = winner
        game_state["game_over"] = True
    elif "" not in game_state["board"]:  # Draw
        game_state["game_over"] = True
    else:
        # Switch player
        game_state["current_player"] = (
            "O" if game_state["current_player"] == "X" else "X"
        )

    return jsonify(game_state)


# -------------------------------
# Reset Game
# -------------------------------
@app.route("/api/reset", methods=["POST"])
def reset_game():
    game_state["board"] = [""] * 9
    game_state["current_player"] = "X"
    game_state["winner"] = None
    game_state["game_over"] = False
    return jsonify(game_state)


# -------------------------------
# Run Server
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
