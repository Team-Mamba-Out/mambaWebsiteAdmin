import axios from 'axios'

const BASE_URL = '/api/room'

export function countRooms() {
  return axios.get(`${BASE_URL}/count`)
}
