import { onBeforeMount, onMounted, onBeforeUnmount, ref, toRefs, reactive, computed, watch, nextTick, defineAsyncComponent, defineComponent } from 'vue'
import useViewport from '@src/use/useViewport'
import useResolveAssets from '@src/use/useResolveAssets'
import { useStore } from 'vuex'
// import { router, useRoute } from '@src/routes'

import { isEmpty, arrayShuffle } from '@src/helpers'

import CatchGame from '@src/classes/CatchGame.js'
import PairGame from '@src/classes/PairGame.js'
import quizGame from '@src/classes/QuizGame.js'
import '@src/classes/styles/CatchGame.sass'
import '@src/classes/styles/PairGame.sass'

import './style.sass'

export default {
  props: {},
  setup(props, {emit}){
    const viewport = useViewport()
    const store = useStore()

    const state = reactive({
      catchGame: new CatchGame({
        gameArea: '.dropArea',
        catchBox: '#avatar',
        dropItemImg: 'assets/images/coin.png',
        time: 30,
        dropSpeed: [500, 1000], //400 , 1200
        onCaught: (e)=>{
          e.state.score += 10
          const avatar = $(e.state.catchBox).find('.role img')
          avatar.removeClass('animate__animated animate__bounce')
          setTimeout(()=>{
            avatar.addClass('animate__animated animate__bounce')
          }, 0)
        },
        onTimesUp: (e)=>{
          $('#game1-success-modal').modal('show')
        }
      },
      {
        reset: ()=>{
          state.catchGame.clearTimer()
          state.catchGame.time = 30
          state.catchGame.score = 0
        },
        onDropItemCreated: function(columnIndex, dropItemIndex, dropSpeed){
          const targetColumn = $(state.catchGame.gameArea).find('.column').eq(columnIndex)[0]

          const dropItem = document.createElement('div')
          $(dropItem).addClass(`dropItem dropItem-${dropItemIndex}`)
          $(dropItem).css({
            transition: `all ${dropSpeed}ms cubic-bezier(0.250, 0.250, 0.750, 0.750)`,
          })
          $(dropItem).append(`<img src="${state.catchGame.dropItemImg}"  />`)
          $(targetColumn).append(dropItem)

          setTimeout(()=>{
            $(dropItem).addClass('dropping')
          }, 100)

          setTimeout(()=>{
            $(dropItem).detach()
          }, dropSpeed + 100)

          // $(targetColumn).append(`<div class="dropItem dropItem-${dropItemIndex}" style="transition: all ${dropSpeed}ms cubic-bezier(0.250, 0.250, 0.750, 0.750);">
          //   <img src="${state.catchGame.dropItemImg}"  />
          // </div>`)

          // const currentDropItem = $(targetColumn).find(`.dropItem-${dropItemIndex}`)[0]

          // setTimeout(()=>{
          //   $(currentDropItem).addClass('dropping')
          // }, 10)

          // setTimeout(()=>{
          //   $(currentDropItem).detach()
          // }, dropSpeed + 10)
        },
        async test(){
          state.scrollToSection('section-catchGame', {
            duration: 200,
            easing: 'linear',
            avatarOffsetX: 150
          }, function(){
            state.catchGame.start()
          })

          for (let index = 0; index < 40; index++){
            let columnIndex = state.catchGame.getRandomInt(0,6)
            let dropItemIndex = 0
            let dropSpeed = state.catchGame.getRandomInt(500,999)
            state.catchGame.onDropItemCreated(columnIndex, dropItemIndex, dropSpeed)
            await state.catchGame.sleep(500)
          }

        },
        sleep(millisecond){
          return new Promise(resolve=>{
            setTimeout(()=>{
              resolve()
            }, millisecond)
          })
        },
        getRandomInt(min, max){
          min = Math.ceil(min)
          max = Math.floor(max)
          return Math.floor(Math.random() * (max - min) + min)
        }
      }),
      pairGame: new PairGame({
        gameArea: '.pairArea',
        time: 30,
        prepareTime: 5000,
        flipDuration: 0,
        timeAfterOpen: 1000,
        sourceCards: [
          'assets/images/card-1.png',
          'assets/images/card-2.png',
          'assets/images/card-3.png',
          'assets/images/card-4.png',
          'assets/images/card-5.png',
          'assets/images/card-6.png',
          'assets/images/card-7.png',
        ],
        cardBack: 'assets/images/card-0.png',
        score: computed(()=>{
          return state.pairGame._matched * 10
        }),
        // onInit: ()=>{

        //   const randomCards = arrayShuffle([ // 202210112027: ???????????????????????????
        //     ...state.pairGame.sourceCards,
        //     ...state.pairGame.sourceCards,
        //   ])

        //   state.pairGame.cards = randomCards // 202210112027: ???????????????????????????

        //   state.pairGame.cards.forEach((node, index)=>{ // 202210112027: ???????????????????????? card ???????????????

        //     const card = document.createElement('div')
        //     $(card).addClass(`card-${index}`)
        //     $(card).addClass('card')
        //     $(card).append(`
        //       <div class="back"><img src="${state.pairGame.cardBack}" /></div>
        //       <div class="front"><img src="${node.url}" /></div>
        //     `)
        //     $(card).addClass('open')
        //     $(state.pairGame.gameArea).append(card)

        //     $(card).on('click', ()=>{
        //       state.pairGame.onClick({ // 202210112027: ??????????????? onClick ???????????????????????? line: 134
        //         data: node,
        //         index: index,
        //       })

        //       state.pairGame.openCard({
        //         data: node,
        //         index: index,
        //       })
        //     })

        //   })
        // },
        onInit: function(randomCards){
          randomCards = jQuery.parseJSON(randomCards)

          // ?????????
          // randomCards = jQuery.parseJSON('[{"url":"assets/images/card-1.png","key":0},{"url":"assets/images/card-3.png","key":2},{"url":"assets/images/card-2.png","key":1},{"url":"assets/images/card-1.png","key":0},{"url":"assets/images/card-6.png","key":5},{"url":"assets/images/card-2.png","key":1},{"url":"assets/images/card-5.png","key":4},{"url":"assets/images/card-6.png","key":5},{"url":"assets/images/card-7.png","key":6},{"url":"assets/images/card-3.png","key":2},{"url":"assets/images/card-7.png","key":6},{"url":"assets/images/card-5.png","key":4},{"url":"assets/images/card-4.png","key":3},{"url":"assets/images/card-4.png","key":3}]')

          console.log(randomCards)

          state.pairGame.cards = randomCards // 202210112027: ???????????????????????????

          setTimeout(()=>{
            randomCards.forEach((node, index)=>{ // 202210112027: ???????????????????????? card ???????????????

              const card = document.createElement('div')
              $(card).addClass(`card-${index}`)
              $(card).addClass('card')
              $(card).append(`
                <div class="back"><img src="${state.pairGame.cardBack}" /></div>
                <div class="front"><img src="${node.url}" /></div>
              `)
              $(card).addClass('open')
              $(state.pairGame.gameArea).append(card)

              $(card).on('click', ()=>{
                state.pairGame.onClick({ // 202210112027: ??????????????? onClick ???????????????????????? line: 134
                  data: node,
                  index: index,
                })

                state.pairGame.openCard({
                  data: node,
                  index: index,
                })
              })

            })
          }, 200)
        },
        // onClick: (e)=>{
        //   const element = $(state.pairGame.gameArea).find(`.card-${e.index}`)
        //   const x = $(element).position().left + 30
        //   const y = $(element).position().top + -10
        //   const origin = {
        //     x: $('.magnifier').data('origin-x'),
        //     y: $('.magnifier').data('origin-y'),
        //   }
        //   const delay = 150
        //   $('.magnifier').css({
        //     left: `${x}px`,
        //     top: `${y}px`,
        //   })
        //   setTimeout(()=>{
        //     $('.magnifier').css({
        //       left: `${origin.x}px`,
        //       top: `${origin.y}px`,
        //     })
        //   }, delay)
        // },
        onClick: function(index){
          try {
            const element = $(state.pairGame.gameArea).find(`.card-${index}`)
            const x = $(element).position().left + 30
            const y = $(element).position().top + -10

            const origin = {
              x: $('.magnifier').data('origin-x'),
              y: $('.magnifier').data('origin-y'),
            }
            const delay = 150
            $('.magnifier').css({
              left: `${x}px`,
              top: `${y}px`,
            })
            setTimeout(()=>{
              $('.magnifier').css({
                left: `${origin.x}px`,
                top: `${origin.y}px`,
              })
            }, delay)
          }
          catch (e){
            console.log(e.name)
            console.log(e.message)
          }
        },
        onBeforeClose: (e)=>{
          e.forEach((node)=>{
            const element = $(state.pairGame.gameArea).find(`.card-${node.index}`)
            $('.card').removeClass('animate__animated animate__flash')
            setTimeout(()=>{
              $(element).addClass('animate__animated animate__flash')
            }, 0)
          })
        },
        onSuccess: (e)=>{
          $('#game2-success-modal').modal('show')
        },
        onFailed: (e)=>{
          $('#game2-success-modal').modal('show')
        },
      },
      {
        reset: ()=>{
          state.pairGame.clearTimer()
          state.pairGame.time = 30
          state.pairGame._matched = 0
          $(state.pairGame.gameArea).empty()
        },
        // openCard: (card)=>{
        //   const self = state.pairGame
        //   const { data, index } = card
        //   const element = $(self.gameArea).find(`.card-${index}`)

        //   if( $(element).is('.open') || self._closing || self._readyForMatch.length >= 2 ){
        //     return
        //   }

        //   $(element).append(`<div class="front"><img src="${data.url}" alt="" /></div>`)

        //   setTimeout(()=>{
        //     $(element).addClass('open')

        //     setTimeout(()=>{
        //       self._readyForMatch.push(card)
        //       self.check()
        //     }, self.flipDuration)
        //   }, 0)
        // }
        openCard: function(card){
          card = jQuery.parseJSON(card)

          const self = state.pairGame
          const data = card.data
          const index = card.index
          const element = $(self.gameArea).find(`.card-${index}`)

          if( $(element).is('.open') || self._closing || self._readyForMatch.length >= 2 ){
            return
          }

          $(element).append(`<div class="front"><img src="${data.url}" alt="" /></div>`)

          setTimeout(()=>{
            $(element).addClass('open')

            setTimeout(()=>{
              self._readyForMatch.push(card)
              self.check()
            }, self.flipDuration)
          }, 0)
        }
      }),
      quizGame: new quizGame(
        {
          time: Infinity,
          questions: [
            {
              question: '??????????????????????????????????????????????????????????????????????????????',
              options: [ '????????????????????????????????????', '???????????????????????????', '??????????????????????????????????????????', '????????????' ],
              correctAns: 3,
            },
            {
              question: '????????????????????????????????????????????????????????????',
              options: [ '?????????????????????????????????????????????????????????', '??????????????????????????????????????????????????????', '?????????????????????????????????????????????????????????????????????????????????', '????????????' ],
              correctAns: 0,
            },
            {
              question: '??????????????????????????????????????????????????????????',
              options: [ '??????????????????????????????????????????????????????????????????????????????????????????', '??????????????????????????????????????????????????????????????????????????????', '???????????????????????????????????????????????????????????????????????????', '??????????????????????????????????????????????????????????????????????????????' ],
              correctAns: 1,
            },
            {
              question: '???????????????????????????????????????????????????????????????????',
              options: [ '???????????????????????????', '????????????????????????????????????', '??????????????????????????????????????????????????????', '????????????' ],
              correctAns: 3,
            },
            {
              question: '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
              options: [ '?????????????????????', '???????????????', '??????????????????', '?????????????????????' ],
              correctAns: 2,
            }
          ],
          onSelect: (e)=>{
            if( state.quizGame.isAllCorrect ){
              $('#game3-success-modal').modal('show')
            }else{
              $('#wrong-modal').modal('show')
            }
          }
        },
        {
          chooseTemp: null,
          isAllCorrect: computed(()=>{
            const userCorrectAnswers = state.quizGame.questions.reduce((acc, node, index)=>{
              if( node.selected === node.correctAns ){
                return acc+1
              }
              return acc
            }, 0)
            return !isEmpty(state.quizGame.questions) && userCorrectAnswers === 1
          }),
          isGaming: computed(()=>{
            return !isEmpty(state.quizGame._timer)
          }),
          randomQuestion: computed(()=>{
            if( state.section !== 'section-quizGame' ){
              return {
                question: null,
                options: []
              }
            }

            const result = arrayShuffle(state.quizGame.questions)[0] // 202210112027: ?????????????????????????????????????????? pc ?????? html ?????????????????? {{ state.quizGame.randomQuestion.XXXX }} ?????????????????????????????????
            return result
          }),
          reset: ()=>{
            state.quizGame.clearTimer()
            state.quizGame.chooseTemp = null
            state.quizGame.questions = state.quizGame.questions.map((node)=>({
              ...node,
              selected: null
            }))
          }
        }
      ),
      avatar: 'female',
      name: '',
      section: '',
      sectionWithOutAniAvatar: ['section-roleChoose'],
      aniAvatarUrl: computed(()=>{
        return `assets/images/role-${{
          female: 1,
          male: 2,
          robot: 3,
        }[state.avatar]}-walk.png`
      }),
      displayAniAvatar: computed(()=>{
        return state.section && !state.sectionWithOutAniAvatar.includes(state.section)
      }),
      scrollToSection: function(target, args={}, callback=function(){}){

        const { duration=800, easing, avatarOffsetX=0 } = args

        $('html, body').animate({
          scrollLeft: ($(`#${target}`).offset().left) + ($(`#${target}`).width() / 2) - ($(window).width() / 2)
        }, {
          duration,
          easing,
          complete: ()=>{
            state.section = target
          }
        })


        $('#avatar').animate({
          left:  ($(`#${target}`).offset().left) + ($(`#${target}`).width() / 2) - ($('#avatar').width() / 2) + avatarOffsetX,
        }, {
          duration: duration + 200,
          easing: 'easeInOutSine',
          complete: ()=>{
            callback()
          }
        })

      },
      reset: ()=>{
        state.catchGame.reset()
        state.pairGame.reset()
        state.quizGame.reset()
        state.scrollToSection('section-catchGameIntro', {
          avatarOffsetX: window.avatarOffsetX['section-catchGameIntro']
        })
      }
    })

    onMounted(()=>{
      window.onload = function(){
        setTimeout(()=>{
          window.scrollTo(0, 0)
        }, 100)
      }

      // state.scrollToSection('section-catchGameIntro', {
      //   duration: 200,
      //   easing: 'linear',
      //   avatarOffsetX: 100
      // }, function(){
      //   // state.catchGame.start()
      // })

      // state.scrollToSection('section-pairGameIntro', {
      //   duration: 200,
      //   easing: 'linear',
      //   avatarOffsetX: 150
      // }, function(){
      //   // state.quizGame.start()
      // })
    })

    window.state = state

    return {
      window,
      store,
      viewport,
      state,
      isEmpty,
    }
  },
}
