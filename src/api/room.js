import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',  // 替换为实际的后端地址
});

// 获取教室列表（支持分页和筛选）
export const getRooms = (params) => {
  return api.get('/rooms/getRooms', { params });
};
export const getLecturers = (params) => {
  return api.get('/lecturers', { params });
};
export const setPermissionUser = (data) => {
  return api.post('/rooms/setPermissionUser', data,{
    headers: { 'Content-Type': 'application/json' } // 确保发送 JSON
  });
};

export const getPermissionUser = (params) => {
  return api.get('/rooms/getPermissionUser', { params });
};

export const deleteRoom = (id) => {
  return api.delete(`/rooms/${id}`);
};

export const addRoom = (data) => {
  return api.post('/rooms', data, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export function countRooms() {
  return axios.get(`${BASE_URL}/count`)
}
