function Game({time, score} = {}){
  this.time = time || 30
  this.score = score || 0
  this._timer = null
}

Game.prototype.start = function(){
  this.clearTimer()
  this._timer = setInterval(()=>{

    if( this.time <= 0 ){
      this.timesUp()
      return
    }

    this.time-=1

  }, 1000)
}

Game.prototype.success = function(){
  this.clearTimer()
}

Game.prototype.failed = function(){
  this.clearTimer()
}

Game.prototype.clearTimer = function(){
  clearInterval(this._timer)
  this._timer = null
}

Game.prototype.timesUp = function(){
  this.clearTimer()
  this.time = 0
}

export default Game