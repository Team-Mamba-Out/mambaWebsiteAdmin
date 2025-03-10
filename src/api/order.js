import axios from 'axios'

const BASE_URL = '/api/orders'

export function fetchOrders(params) {
  return axios.get(`${BASE_URL}/getRecords`, { params })
}

export function deleteOrder(id) {
  return axios.delete(`${BASE_URL}/${id}`)
}

export function countCompletedOrders() {
  return axios.get(`${BASE_URL}/count/completed`)
}

export function countOrders() {
  return axios.get(`${BASE_URL}/count`)
}
