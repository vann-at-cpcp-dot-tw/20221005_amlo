
import Game from '@src/classes/Game.js'
import { isEmpty, arrayShuffle } from '@src/helpers'



function PairGame({
  time, score, sourceCards=[], cardBack='', gameArea, prepareTime=7000, timeAfterOpen=300, flipDuration=200,
  onStart=()=>{},
  onBeforeClose=()=>{},
  onClick=()=>{},
  onSuccess=()=>{},
  onFailed=()=>{},
}){

  Game.call(this, {time, score})

  this.sourceCards = sourceCards.map((url, index)=>({ // card front images url list must be even
    url,
    key: index,
  }))
  this.cardBack = cardBack // card back images url
  this.gameArea = gameArea
  this.timeAfterOpen = timeAfterOpen // ms
  this.flipDuration = flipDuration //ms
  this.prepareTime = prepareTime // ms
  this.onClick = onClick
  this.onStart = onStart
  this.onBeforeClose = onBeforeClose
  this.onSuccess = onSuccess
  this.onFailed = onFailed
  this._matched = 0
  this._readyForMatch = [],
  this._closing = false

  if( typeof arguments[1] === 'object'){
    const ext = arguments[1]
    Object.keys(ext).forEach((key)=>{
      this[key] = ext[key]
    })
  }
}

PairGame.prototype = new Game()

PairGame.prototype.init = function(){

  $(this.gameArea).empty()
  $(this.gameArea).addClass('pairGame-gameArea')
  if( $('.pairGame-gameArea-style').length < 1 ){
    $('body').append('<div class="pairGame-gameArea-style"></div>')
  }

  $('.pairGame-gameArea-style').empty()
  $('.pairGame-gameArea-style').append(`<style>
  ${this.gameArea} .card .back img {
    transition: all ${this.flipDuration}ms
  }
  ${this.gameArea} .card .front img {
    transition: all ${this.flipDuration}ms
  }
  ${this.gameArea} .card.open .front img {
    transition-delay: ${this.flipDuration}ms
  }
  ${this.gameArea} .card.closing .back img {
    transition-delay: ${this.flipDuration}ms
  }
  </style>`)

  this.cards = arrayShuffle([
    ...this.sourceCards,
    ...this.sourceCards,
  ])

  this.cards.forEach((node)=>{

    const card = document.createElement('div')
    $(card).addClass('card')
    $(card).append(`
      <div class="back"><img src="${this.cardBack}" /></div>
      <div class="front"><img src="${node.url}" /></div>
    `)
    $(card).addClass('open')
    $(this.gameArea).append(card)
    $(card).on('click', ()=>{
      this.onClick({
        data: node,
        element: card,
      })
      this.openCard({
        data: node,
        element: card,
      })
    })
  })
}

PairGame.prototype.check = function(){

  if( this._readyForMatch.length < 2 ){
    return
  }

  const isMatched = this._readyForMatch[0].data.key === this._readyForMatch[1].data.key

  if( isMatched ){

    this._readyForMatch.forEach((cardInLoop)=>{
      $(cardInLoop.element).addClass('done')
    })

    this._matched += 1
    this._readyForMatch = []

    if( this.isCompleted() ){
      this.success()
    }

  }else{

    this.onBeforeClose(this._readyForMatch)
    setTimeout(()=>{
      this.closeCard()
    }, this.timeAfterOpen)

  }

}

PairGame.prototype.openCard = function(card){

  const { data, element } = card

  if( $(element).is('.open') || this._closing || this._readyForMatch.length >= 2 ){
    return
  }

  $(element).append(`<div class="front"><img src="${data.url}" alt="" /></div>`)

  setTimeout(()=>{
    $(element).addClass('open')

    setTimeout(()=>{
      this._readyForMatch.push(card)
      this.check()
    }, this.flipDuration)
  }, 0)

}

PairGame.prototype.closeCard = function(){

  if( this._closing ){ return }

  const notDoneCards = $(this.gameArea).find('.card:not(.done)')

  notDoneCards.removeClass('open').addClass('closing')

  setTimeout(()=>{
    notDoneCards.find('.front').detach()
    notDoneCards.removeClass('closing')
    this._closing = false
    this._readyForMatch = []
  }, this.flipDuration)
}

PairGame.prototype.isCompleted = function(){
  return this.time >= 0 && this._matched ===  this.cards.length / 2
}

PairGame.prototype.start = function(){

  this.init()
  this.onStart()
  setTimeout(()=>{

    this.closeCard()
    Game.prototype.start.call(this)
    this.onStart()

  }, this.prepareTime)

}

PairGame.prototype.success = function(){
  Game.prototype.success.call(this)
  this.onSuccess({
    state: this,
  })
}

PairGame.prototype.failed = function(){
  Game.prototype.success.call(this)
  this.onFailed({
    state: this,
  })
}

PairGame.prototype.timesUp = function(){
  Game.prototype.timesUp.call(this)
  if( this.isCompleted() ){
    this.success()
  }else{
    this.failed()
  }
}

export default PairGame