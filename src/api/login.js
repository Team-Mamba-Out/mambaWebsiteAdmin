import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080',
});
api.interceptors.response.use(
    response => response,
    error => {
      return Promise.reject(error) // ⛔ 不加这句，Vuex的.catch不会触发
    }
  )
export const startVerify = (email) => {
    return api.get('/verify/send', {params: { email }})
}

export const verifyCode = (email, codeInput) => {
    return api.get('/verify/validate', {params: { email, codeInput }})
}
export const getUserInfo = (token) => {
    return api.get('/verify/getUserInfo',  {headers:{
        Authorization: token}
    } )
}
export const getAdmins = (params) => {
    return api.get('/admin', { params });
};