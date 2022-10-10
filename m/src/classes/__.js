
import Game from '@src/classes/Game.js'
import { isEmpty } from '@src/helpers'

function __({
  time, score,
  onStart=()=>{},
  onSuccess=()=>{},
  onFailed=()=>{},
  onTimesUp=()=>{},
}){
  Game.call(this, {time, score})
  this.onStart = onStart
  this.onSuccess = onSuccess
  this.onFailed = onFailed
  this.onTimesUp = onTimesUp

}

__.prototype = new Game()


__.prototype.start = function(){
  Game.prototype.start.call(this)
}

__.prototype.success = function(){
  Game.prototype.success.call(this)
}

__.prototype.failed = function(){
  Game.prototype.failed.call(this)
}

__.prototype.timesUp = function(){
  Game.prototype.timesUp.call(this)
}


export default __