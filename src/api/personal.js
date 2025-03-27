import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const getAdmins = (params) => {
  return api.get('/admin', { params });
};

export const countRooms = () => {
  return api.get('/rooms/count');
}

export const countRecords = () => {
  return api.get('/records/count');
}

export const countUsers = () => {
  return api.get('/admin/getUserCount');
}

export const countCompletedRecords = () => {
  return api.get('/records/count/completed');
}

export const fetchOrders = (params) => {
  return api.get(`/records/getRecords`, { params })
}

export const getNameByUid = (params) =>{
  return api.get(`/admin/getNameByUid/${params}`);
}

export const getRooms = (params) => {
  return api.get('/rooms/getRooms', { params });
}

export const countOrdersByDayOfWeek = () => {
  return api.get('/records/countOrdersByDayOfWeek');
}