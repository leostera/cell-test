import 'whatwg-fetch'

import type {
  Arrow,
} from 'zazen/arr'

import {
  arrow as arr,
  cell,
} from 'zazen'

import {
  apply,
  compose,
  map,
  flatten,
  identity as id,
} from 'ramda'

const l = console.log.bind({})

const Atom = k => (Symbol.for(k))

const Action = (type, payload) => ({ type: Atom(type), payload })

/*
 * Combinators / Reducers
 */

const logger = arr( reducer => arr( (state, action) => {
  l('logger', state, action)
  return reducer(state, action)
}))

const location = arr( reducer => arr( (state, {type, payload}) => {
  l('location combinator', payload)
  return Atom('location') === type
    ? { ...state, location: payload.pathname }
    : reducer(state, {type, payload})
}))


/*
 * Effects
 */

const auth = cell( () => {

}, id)



// GET /login
const router = effect( next => cell(({state: {location}}) => {
  l('router effect', location)
  return {next, location}
}, cell( ({next, location}) => {
  l('router effect 2', location)
  next(Action('login start'), {})
}, id))


const dom = cell(({state}) => {
  return state.location
}, cell((location) => {
  return {
    type: 'div',
    props: [],
    children: [
      location
    ]
  }
}, cell( tree => render(tree, document.getElementById('root')), id)))

/*
 * Store and App
 */

const store = arr( app => ({
  ...app,
  state: app.actions.reduce(app.reducer, app.state)
}))


const next = previous_app => (...actions) => {
  return actions.length > 0 ?
    app({...previous_app, actions}) :
    previous_app
}

const app = store
  .pipe( app => ({
    ...app,
    next: next(app)
  }) )
  .pipe( ({state, next, effects}) => {
    return compose(
      flatten,
      map( e => e({state, next}) )
    )(effects)
  })

/*
 * Run!
 */

app({

  state: {
    session: false,
  },

  actions: [
    Action('location', window.location)
  ],

  reducer: compose(
    logger,
    location
  )(id),

  effects: [
    ({next}) => (window.next = next),
    router,
    //    auth
  ]

})
