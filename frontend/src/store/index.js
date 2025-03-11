import { createStore } from 'vuex'
import api from '../services/api'

export default createStore({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user: {}
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
  },
  mutations: {
    auth_request(state) {
      state.status = 'loading'
    },
    auth_success(state, token) {
      state.status = 'success'
      state.token = token
    },
    auth_error(state) {
      state.status = 'error'
    },
    logout(state) {
      state.status = ''
      state.token = ''
    },
  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit('auth_request')
        api.login(user)
          .then(resp => {
            const token = resp.data.token
            const userId = resp.data.userId
            const status = resp.data.status

            // Clear any existing data first
            localStorage.clear()

            // Set new authentication data
            localStorage.setItem('token', token)
            localStorage.setItem('userId', userId)
            localStorage.setItem('email', user.email)
            localStorage.setItem('userStatus', status)

            // Update state
            commit('auth_success', token)

            // Fetch user profile if needed
            if (userId) {
              api.getUserProfile()
                .then(profileResp => {
                  if (profileResp.data && profileResp.data.user) {
                    const userData = profileResp.data.user;
                    if (userData.first_name && userData.last_name) {
                      localStorage.setItem('userFullName', `${userData.first_name} ${userData.last_name}`);
                    }
                    if (userData.phone) {
                      localStorage.setItem('userPhone', userData.phone);
                    }
                    if (userData.address) {
                      localStorage.setItem('userAddress', userData.address);
                    }
                  }
                  resolve(resp);
                })
                .catch(err => {
                  console.error('Error fetching user profile:', err);
                  resolve(resp); // Still resolve even if profile fetch fails
                });
            } else {
              resolve(resp);
            }
          })
          .catch(err => {
            commit('auth_error')
            localStorage.removeItem('token')
            reject(err)
          })
      })
    },
    register({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit('auth_request')
        api.register(user)
          .then(resp => {
            const token = resp.data.token
            const userId = resp.data.userId
            const status = resp.data.status
            localStorage.setItem('token', token)
            localStorage.setItem('userId', userId)
            localStorage.setItem('email', user.email)
            localStorage.setItem('userStatus', status)
            commit('auth_success', token)
            resolve(resp)
          })
          .catch(err => {
            commit('auth_error')
            localStorage.removeItem('token')
            reject(err)
          })
      })
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('logout')
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('email')
        localStorage.removeItem('userStatus')
        resolve()
      })
    }
  },
  modules: {
  }
})