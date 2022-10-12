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
        onInit: ()=>{

          const randomCards = arrayShuffle([ // 202210112027: 這邊是初始隨機洗牌
            ...state.pairGame.sourceCards,
            ...state.pairGame.sourceCards,
          ])

          state.pairGame.cards = randomCards // 202210112027: 這邊是初始隨機洗牌

          state.pairGame.cards.forEach((node, index)=>{ // 202210112027: 這邊是把洗牌後的 card 逐一加事件

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
              state.pairGame.onClick({ // 202210112027: 這邊賦予的 onClick 的詳細內容在下方 line: 134
                data: node,
                index: index,
              })

              state.pairGame.openCard({
                data: node,
                index: index,
              })
            })

          })
        },
        onClick: (e)=>{
          const element = $(state.pairGame.gameArea).find(`.card-${e.index}`)
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
          state.pairGame.time = 60
          state.pairGame._matched = 0
          $(state.pairGame.gameArea).empty()
        },
        openCard: (card)=>{
          const self = state.pairGame
          const { data, index } = card
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
              question: '為什麼金融機構要進行確認客戶身分？對民眾有甚麼好處？',
              options: [ '遏止不法金流的第一道防線', '可有效降低人頭帳戶', '避免民眾帳戶被輕易盜用或冒用', '以上皆是' ],
              correctAns: 3,
            },
            {
              question: '關於民眾購買保險，下列哪一項的敘述正確？',
              options: [ '如民眾拒絕提供保險受益人資料可婉拒投保', '為保護隱私民眾可拒絕提供被保險人資料', '為賺取業績，民眾購買高額保險時，業務員不得過問資金來源', '以上皆是' ],
              correctAns: 0,
            },
            {
              question: '關於房地產的交易，下列敘述何者不合理嗎?',
              options: [ '民眾用現金買房若收入顯不相當，可依法確認客戶及實際受益人身分', '為賺取業績，民眾購買高額房產時，房仲不應過問資金來源', '標的金額高之房地產交易，以非現金的支付價款應為常態', '不動產有價高易轉手的特性，可能成為借以漂白贓款之管道' ],
              correctAns: 1,
            },
            {
              question: '在什麼情況下金融機構會婉拒建立業務關係或交易?',
              options: [ '疑似使用假名、人頭', '持用偽、變造身分證明文件', '客戶拒絕提供審核客戶身分措施相關文件', '以上皆是' ],
              correctAns: 3,
            },
            {
              question: '您若在政府機關擔任重要政治性職務，請問與您有關係的人中，下列何者並不會被銀行加強審查？',
              options: [ '同居的外遇對象', '養子的老婆', '論文指導教授', '離家出走的兒子' ],
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

            const result = arrayShuffle(state.quizGame.questions)[0] // 202210112027: 隨機挑選題目，可從這裡抓，但 pc 版的 html 那邊就不能綁 {{ state.quizGame.randomQuestion.XXXX }} 需自行再指定到別的地方
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

      // state.scrollToSection('section-quizGameIntro', {
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
