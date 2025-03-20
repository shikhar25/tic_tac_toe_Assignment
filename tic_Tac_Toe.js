const readline = require('readline');

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(' ');
        this.players = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('Welcome to Tic-Tac-Toe!\n');
        await this.setupPlayers();
        await this.playGame();
    }

    async setupPlayers() {
        const p1Name = await this.askQuestion('Enter Player 1 name: ');
        let p1Symbol = (await this.askQuestion(`${p1Name}'s symbol (default: O): `, 'O')).toUpperCase();
        this.players.push(new HumanPlayer(p1Name, p1Symbol, this.rl));

        const opponentType = await this.askQuestion('Human or Computer opponent? (h/c): ');
        if (opponentType.toLowerCase() === 'h') {
            const p2Name = await this.askQuestion('Enter Player 2 name: ');
            let p2Symbol = (await this.askQuestion(`${p2Name}'s symbol (default: X): `, 'X')).toUpperCase();

            if (p2Symbol === this.players[0].symbol) {
                console.log(`Symbol must be different from ${this.players[0].name}`);
                process.exit(1);
            }
            this.players.push(new HumanPlayer(p2Name, p2Symbol, this.rl));
        } else {
            const computerSymbol = this.players[0].symbol === 'X' ? 'O' : 'X';
            this.players.push(new ComputerPlayer('Computer', computerSymbol));
        }
    }

    async playGame() {
        let currentPlayerIndex = 0;
        while (true) {
            this.displayBoard();
            const currentPlayer = this.players[currentPlayerIndex];
            const move = await currentPlayer.getMove(this.board);

            this.board[move] = currentPlayer.symbol;

            if (this.checkWin(currentPlayer.symbol)) {
                this.displayBoard();
                console.log(`${currentPlayer.name} wins!`);
                break;
            }

            if (this.isTie()) {
                this.displayBoard();
                console.log("It's a tie!");
                break;
            }

            currentPlayerIndex = 1 - currentPlayerIndex;
        }
        this.rl.close();
    }

    displayBoard() {
        console.log('\n');
        for (let i = 0; i < 9; i += 3) {
            console.log(` ${this.board[i]} | ${this.board[i + 1]} | ${this.board[i + 2]} `);
            if (i < 6) console.log('-----------');
        }
        console.log('\n');
    }

    checkWin(symbol) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern =>
            pattern.every(index => this.board[index] === symbol)
        );
    }

    isTie() {
        return !this.board.includes(' ') && !this.checkWin('X') && !this.checkWin('O');
    }

    askQuestion(query, defaultValue = '') {
        return new Promise(resolve => {
            this.rl.question(query, answer => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }
}

class Player {
    constructor(name, symbol) {
        this.name = name;
        this.symbol = symbol;
    }
}

class HumanPlayer extends Player {
    constructor(name, symbol, rl) {
        super(name, symbol);
        this.rl = rl;
    }

    async getMove(board) {
        while (true) {
            const input = await this.askQuestion(`${this.name}'s move (1-9): `);
            const position = parseInt(input.trim(), 10) - 1;

            if (isNaN(position) || position < 0 || position > 8) {
                console.log('Invalid input! Please enter a number between 1-9.');
                continue;
            }

            if (board[position] !== ' ') {
                console.log('Position already occupied! Choose another spot.');
                continue;
            }

            return position;
        }
    }

    askQuestion(query) {
        return new Promise(resolve => {
            this.rl.question(query, answer => {
                resolve(answer.trim());
            });
        });
    }
}

class ComputerPlayer extends Player {
    getMove(board) {
        console.log("AI is making a move...");
        return this.minimax(board, this.symbol).index;
    }

    minimax(newBoard, player) {
        const availableSpots = newBoard
            .map((cell, index) => (cell === ' ' ? index : null))
            .filter(index => index !== null);

        if (this.checkWinner(newBoard, 'X')) return { score: -10 };
        if (this.checkWinner(newBoard, 'O')) return { score: 10 };
        if (availableSpots.length === 0) return { score: 0 };

        let moves = [];
        for (let i = 0; i < availableSpots.length; i++) {
            let move = {};
            move.index = availableSpots[i];
            newBoard[availableSpots[i]] = player;

            if (player === 'O') {
                let result = this.minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                let result = this.minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availableSpots[i]] = ' ';
            moves.push(move);
        }

        let bestMove = 0;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    checkWinner(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern =>
            pattern.every(index => board[index] === player)
        );
    }
}

const game = new TicTacToe();
game.start();
