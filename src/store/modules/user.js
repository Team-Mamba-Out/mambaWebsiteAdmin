import {  logout} from '@/api/user'
import { verifyCode, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  email:'',
  uid:0,
  avatar: '',
  introduction: '',
  roles: [],
  role:'',
  phone:''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_UID:(state,uid)=>{
    state.uid=uid
  },
  SET_PHONE:(state,phone)=>{
    state.phone=phone
  }
}

const actions = {
  // user login
  login({ commit }, loginForm) {
    const { email, code } = loginForm
    return new Promise((resolve, reject) => {
      verifyCode(email.trim(),code.trim()).then(response => {
        const { data } = response
        if (data.code === 200) {
          commit('SET_TOKEN', data.data)
          setToken(data.data)
          resolve()
        } else {
          reject(new Error(data.message || 'Login failed'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo(state.token).then(response => {
        let  data  = response.data.data

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { role, name, email, uid,phone } = data
        console.log(data);


        var roles = ['admin']
        data.roles=roles
        commit('SET_ROLES', roles)
        commit('SET_ROLE', role)
        commit('SET_NAME', name)
        commit('SET_EMAIL', email)
        commit('SET_UID', uid)
        commit('SET_PHONE',phone)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
