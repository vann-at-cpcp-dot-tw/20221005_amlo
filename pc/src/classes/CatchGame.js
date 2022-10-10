
import Game from '@src/classes/Game.js'
import { rand, isEmpty, arrayShuffle } from '@src/helpers'


function CatchGame({
  time, catchBox, gameArea, dropItemImg, dropSpeed=[500, 1000], genItemSpeed, genItemMode='wait',
  onStart=()=>{},
  onCaught=()=>{},
  onTimesUp=()=>{}
} = {}){

  // 建構式函式繼承(繼承屬性)
  Game.call(this, {time})

  this.amountOfColumns = 7
  this.avatarLocation = Math.round( this.amountOfColumns/2 ) - 1 || 0
  this.catchBox = catchBox,
  this.gameArea =  gameArea,
  this.dropItemImg = dropItemImg,
  this.dropSpeed = dropSpeed // a ms number range [5000, 10000]
  this.genItemSpeed = genItemSpeed || ((dropSpeed[0] + dropSpeed[1]) / 2) // ms
  this.genItemMode = genItemMode // wait, continuous
  this.onStart = onStart
  this.onCaught = onCaught
  this.onTimesUp = onTimesUp

  this._caughtTimes = 0
  this._caughtItems = []
  this._collisionWatcher = null

  if( typeof arguments[1] === 'object'){
    const ext = arguments[1]
    Object.keys(ext).forEach((key)=>{
      this[key] = ext[key]
    })
  }
}

// 原型鏈繼承(繼承方法)
// bad:
CatchGame.prototype = new Game()

// good:
// CatchGame.prototype = Object.create(Game.prototype)
// CatchGame.prototype.constructor = CatchGame
// ref: https://pjchender.dev/javascript/js-oo/


CatchGame.prototype.init = function(){
  $(this.gameArea).addClass('catchGame-gameArea')
  $(this.catchBox).addClass('catchGame-catchBox')

  $(this.gameArea).empty()
  for( let i=0; i<this.amountOfColumns; i++){
    $(this.gameArea).append('<div class="column"></div>')
  }

  this._collisionWatcher = ()=>{

    if( this.time <= 0 ){
      return
    }

    $(this.gameArea).find('.dropItem').each((index, node)=>{
      if( this.isCollide($(this.catchBox)[0], node) ){
        $(node).detach()

        this._caughtTimes+=1
        // this._caughtItems.push(node) // for performance reason
        this.onCaught({
          caughtItem: node,
          state: this,
        })
      }
    })

    if(this.time > 0){
      requestAnimationFrame(this._collisionWatcher)
    }
  }
  requestAnimationFrame(this._collisionWatcher)
}

CatchGame.prototype.moveCatchBox = function(columnIndex){

  if( columnIndex > this.amountOfColumns-1 ){
    this.avatarLocation = this.amountOfColumns - 1
  }else if( columnIndex < 0 ){
    this.avatarLocation = 0
  }else {
    this.avatarLocation = columnIndex
  }

  const cssPosition = $(this.gameArea).find('.column').eq(this.avatarLocation).offset().left
  $(this.catchBox).css('left', `${cssPosition}px`)

}

CatchGame.prototype.genDropItem = function(){

  let targetColumnIndex
  let targetColumn

  switch(this.genItemSpeed){
    case 'continuous': {
      targetColumnIndex = rand(0, this.amountOfColumns-1)
      targetColumn = $(this.gameArea).find('.column').eq(targetColumnIndex)[0]
      break
    }

    case 'wait':
    default: {
      targetColumn = arrayShuffle($(this.gameArea).find('.column').filter(function(){
        return !$.trim(this.innerHTML)
      }))[0]
      break
    }
  }

  const currentDropItemIndex = $(targetColumn).find('.dropItem').length
  const currentDropSpeed = typeof this.dropSpeed === 'number' ?this.dropSpeed :rand(this.dropSpeed[0], this.dropSpeed[1])

  if( this.genItemMode === 'wait' && !targetColumn ){
    return
  }

  $(targetColumn).append(`<div class="dropItem dropItem-${currentDropItemIndex}" style="transition: all ${currentDropSpeed}ms cubic-bezier(0.250, 0.250, 0.750, 0.750);">
    <img src="${this.dropItemImg}" alt="" />
  </div>`)

  const currentDropItem = $(targetColumn).find(`.dropItem-${currentDropItemIndex}`)[0]

  setTimeout(()=>{
    $(currentDropItem).addClass('dropping')
  }, 10)

  setTimeout(()=>{
    $(currentDropItem).detach()
  }, currentDropSpeed + 10)

}

CatchGame.prototype.itemDrop = function(){

  function drop(){

    this.genDropItem()

    if( this.time > 0){
      setTimeout(()=>{
        drop.call(this)
      }, this.genItemSpeed)
    }
  }

  drop.call(this)

}

CatchGame.prototype.isCollide = function(a, b){
  var aRect = a.getBoundingClientRect()
  var bRect = b.getBoundingClientRect()

  return !(
    ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
  )
}

CatchGame.prototype.start = function(){
  Game.prototype.start.call(this)
  this.init()
  this.moveCatchBox(this.avatarLocation)
  this.itemDrop()
  this.onStart()
}

CatchGame.prototype.timesUp = function(){
  Game.prototype.timesUp.call(this)
  this.moveCatchBox(Math.round( this.amountOfColumns/2 ) - 1 || 0)
  this.onTimesUp({
    state: this
  })
}


export default CatchGame