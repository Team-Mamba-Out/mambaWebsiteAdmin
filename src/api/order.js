import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const fetchOrders = (params) => {
  return api.get(`/records/getRecords`, { params })
}

export const deleteOrders = (id, reason) => {
  return api.delete(`/admin/cancelRecordAndReassign/${id}`, {
      data: reason,
      headers: { 'Content-Type': 'application/json' }
  });
};

export const getNameByUid = (params) =>{
  return api.get(`/admin/getNameByUid/${params}`);
}

export const getRooms = (params) => {
  return api.get('/rooms/getRooms', { params });
};

export const createRecord = (data) => {
  return api.post('/records', data, {
    headers: { 'Content-Type': 'application/json' }
  });
};




