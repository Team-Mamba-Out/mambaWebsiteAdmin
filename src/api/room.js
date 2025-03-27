  import axios from 'axios';

  const api = axios.create({
    baseURL: 'http://localhost:8080',
  });

  export const getRooms = (params) => {
    return api.get('/rooms/getRooms', { params });
  };
  export const getLecturers = (params) => {
    return api.get('/lecturers', { params });
  };
  export const updateRoomPermission = (data) => {
    return api.put('/admin/updateRoomPermission', data, {
      headers: { 'Content-Type': 'application/json' }
    })
  };

  export const getPermissionUser = (params) => {
    return api.get('/rooms/getPermissionUser', { params });
  };

  export const deleteRoom = (id) => {
    return api.delete(`/rooms/${id}`);
  };

  export const addRoom = (data) => {
    return api.post('/rooms/addRoom', data, {
      headers: { 'Content-Type': 'application/json' }
    });
  };

  export const updateRoom = (id, data) => {
    return api.put(`/rooms/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  export const getApprovalResources = (roomId) => {
    return api.get('/admin/getApprovalResources', { params: { roomId } });
  }

  export const approveApprovalResource = (id) => {
    return api.put('/admin/approveApprovalResource', id, {
      params: { id },
      headers: { 'Content-Type': 'application/json' }
    });
  }

  export const rejectRestrictedResource = (id) => {
    return api.delete(`/admin/rejectRestrictedResource/${id}`);
  }

  export const getNameByUid = (params) =>{
    return api.get(`/admin/getNameByUid/${params}`);
  }

  export const getMaintenance = (params) => {
    return api.get('/maintenance/getMaintenance', { params});
  }

  export const addMaintenance = (request) => {
    return api.post(`/admin/roomRecord`, request, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  export const deleteMaintenance = (id) => {
    return api.delete(`/maintenance/${id}`)
  }

  export const getMaintenanceReports = (receiver,params) => {
    return api.get(`/messages/getMessage/${receiver}`,{params});
  }

  export const readMessage = (id) => {
    return api.post('/messages/read', id, {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  export const getRoomUtilization = (rangeType) => {
    return api.get('/admin/roomReport',{ params: { rangeType } })
  }

  export const getFreeMaintainTime = (roomId) => {
    return api.get('/admin/getFreeMaintainTime',{ params: { roomId } })
  }