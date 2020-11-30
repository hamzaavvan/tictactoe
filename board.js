function Board()
{
    this.matches = [];

    this.getMatch = function(id)
    {
        return this.matches[id];
    }

    this.hasMatch = function(id)
    {
        let match = this.getMatch(id);

        return match != undefined;
    }

    this.matchCount = function() 
    {
        return this.matches.length;    
    }
    
    this.newMatch = function(match)
    {
        this.matches.push(match);    
    }

    this.setMatchMove = function(id, cell, symbol)
    {
        let match = this.getMatch(id);

        console.log(!match.moves[cell]);
        console.log(match.moves[cell]);
        if (!match.moves[cell]) {
            match.moves[cell] = symbol;
            return true;  
        }
            
        return false;
    }

    this.getMatchMoves = function(id)
    {
        let match = this.getMatch(id);

        if (match && 'moves' in match)
            return match.moves;
            
        return null;
    }

    this.matchEnded = function (id) 
    {
        let match = this.getMatch(id);

        return match && match.ended;
    }

    this.isMatchDraw = function (id) 
    {
        let match = this.getMatch(id);
        console.log("is_draw")
        console.log(match)

        return match && match.draw;
    }

    this.endMatch = function (id) 
    {
        let match = this.getMatch(id);

        match.ended = true;
    }

    this.matchDraw = function(id)
    {
        const match = this.getMatch(id);
        let match_moves = match.moves;
        
        is_draw_ctr=0;
        match_moves.forEach((s) => {
            if (s!="" &&s.length>0) is_draw_ctr++;
        });

        console.log("is_draw counter:")
        console.log(is_draw_ctr)
        if (is_draw_ctr>=9) {
            match.draw = true;
            match.ended = true;

            return true;
        }

        return false;
    }

	this.checkForWinner = function(player, Player)
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

        const match_id = player.matchId;
        const match = this.getMatch(match_id);
        
		winningCombinations.forEach((winingCombo) => {
			const pos0symbol = match.moves[winingCombo[0]];
			const pos1symbol = match.moves[winingCombo[1]];
			const pos2symbol = match.moves[winingCombo[2]];
			const isWinningCombo = pos0symbol !== undefined && pos0symbol === pos1symbol && pos1symbol === pos2symbol;

            if (isWinningCombo) 
			{
                winner = player;

                if (player.symbol != pos0symbol) {
                    winner = Player.get(player.opposition);
                }

                this.endMatch(match_id);

                return;
			}
        });

		return winner;
	}
}

module.exports = Board;