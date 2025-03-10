import axios from 'axios'

const BASE_URL = '/api/users'

export function countUsers() {
  return axios.get(`${BASE_URL}/count`)
}
