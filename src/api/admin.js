import axios from 'axios'

const BASE_URL = '/api/admin'

export function fetchAdmins() {
  return axios.get(BASE_URL)
}
