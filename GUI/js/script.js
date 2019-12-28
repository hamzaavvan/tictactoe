socket = io();
const ticTacToeGame = new TicTacToeGame();
ticTacToeGame.start();


function TicTacToeGame() {
  const board = new Board();
  const player1 = new Player1(board);

  this.start = function() {
    const config = { childList: true };
    const observer = new MutationObserver(() => takeTurn());
    board.positions.forEach((el) => observer.observe(el, config));
    takeTurn();
  }

  function takeTurn() {
    if (board.checkForWinner()) {
      return;
	}
	
	player1.takeTurn();
  };
}

function Board()
{
	this.positions = Array.from(document.querySelectorAll('._col')); 
	this.checkForWinner = function()
	{
		let winner = false;
		const winningCombinations = [
		[0,1,2],
		[3,4,5],
		[6,7,8],
		[0,4,8],
		[2,4,6],
		[0,3,6],
		[1,4,7],
		[2,5,8]
		];

		const positions = this.positions;

		winningCombinations.forEach((winingCombo) => {
			const pos0InnerText = positions[winingCombo[0]].innerText;
			const pos1InnerText = positions[winingCombo[1]].innerText;
			const pos2InnerText = positions[winingCombo[2]].innerText;
			const isWinningCombo = pos0InnerText !== '' && pos0InnerText === pos1InnerText && pos1InnerText === pos2InnerText;

			if (isWinningCombo) 
			{
				winner = true;
				winingCombo.forEach((index) => 
				{
					positions[index].className += ' winner';
				})
			}
		});
		return winner;
	}
}

function Player1(board)
{
	this.takeTurn = function(){
		board.positions.forEach(el => el.addEventListener('click', handleTurnTaken));
	}

	function handleTurnTaken(event){
		var box = $(event.target).attr("box");
		let d= {box: box};

		if ($(`div[box="${box}"]`).text().length > 0) return;

		$.ajax({
			type: "put",
			url: "/move",
			data: d,
			success: function () {
				$(".msg").html("");
			}
		});

		board.positions.forEach(el => el.removeEventListener('click', handleTurnTaken));
	}
}

