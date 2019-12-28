function Player() {
    this.players = [];
    this.playersId = [];

    this.new = function (player) 
    {
        let id = this.count();

        player["id"] = id;

        this.playersId.push(id);
        this.players.push(player);
        
        return player;
    }

    this.count = function () 
    {
        return this.players.length;    
    }

    this.get = function (id) 
    {
        return this.players[id];    
    }

    this.all = function () 
    {
        return this.players;    
    }

    this.update = function (id, player) 
    {
        this.players[id] = player;    
    }

    this.exist = function (id) 
    {
        return this.playersId.indexOf(id) > -1;    
    }

    this.is_lock = function (id)
    {
        let player = this.get(id);

        return player.lock >0;
    }

    this.opposition = function (id) 
    {
        let player = this.get(id);

        return this.get(player.opposition);
    }
    
    this.delete = function (id) {
        this.players.splice(id, 1);
        this.playersId.splice(id, 1);
    }
    
}

module.exports = Player;