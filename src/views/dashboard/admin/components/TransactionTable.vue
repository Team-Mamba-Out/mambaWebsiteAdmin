<template>
  <el-table :data="list" style="width: 100%;padding-top: 5px; height: 410px " :row-style="{ height:'51px'}" >
    <el-table-column label="Order Id" prop="id" align="center" min-width="90" />
    <el-table-column label="Room Name" prop="roomId" min-width="230px" align="center" >
        <template slot-scope="scope">
          <span style="font-size: 14px;">
            {{ getRoomNameById(scope.row.roomId) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="User Name" prop="userId" min-width="130px" align="center" >
        <template slot-scope="scope">
          {{ getUserNameById(scope.row.userId) }}
        </template>
      </el-table-column>
      <el-table-column label="Record Time" prop="recordTime" min-width="145px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.recordTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" prop="statusId" min-width="105">
        <template slot-scope="scope">
          <span :style="{ color: getStatusColor(scope.row.statusId) }">
            {{ getStatusText(scope.row.statusId) }}
          </span>
        </template>
      </el-table-column>
  </el-table>
</template>

<script>
import { fetchOrders, getNameByUid, getRooms } from '@/api/personal'

export default {
  data() {
    return {
      list: [],
      classrooms: [],
      pagination: {
      currentPage: 1,
      pageSize: 10
      },
      userCache: {}
    }
  },
  created() {
    this.getList()
    this.fetchRoom()
  },
  methods: {
    getList() {
      fetchOrders({
        page: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
        .then(response => {
          this.list = response.data.data.records
        })
        .catch(error => {
          console.error('Error fetching records:', error)
        })
    },
    fetchRoom(){
      getRooms()
        .then(response => {
          this.classrooms = response.data.data.rooms
        })
        .catch(error => {
          console.error('Error fetching classrooms:', error)
        })
    },
    getRoomNameById(roomId) {
      const room = this.classrooms.find(room => room.id === roomId);
      return room ? room.roomName : 'Unknown Room';
    },
    getUserNameById(userId) {
      if (this.userCache[userId]) {
        return this.userCache[userId];
      }
      getNameByUid(userId)
        .then(response => {
          this.$set(this.userCache, userId, response.data.data);
        })
        .catch(error => {
          console.error(`Error fetching username for ID ${userId}:`, error);
          this.$set(this.userCache, userId, 'Unknown');
        })
      return 'Loading...';
    },
    formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
    },
    getStatusText(statusId) {
      switch (statusId) {
        case 1: return 'Not Started';
        case 2: return 'Ongoing';
        case 3: return 'Done';
        case 4: return 'Cancelled';
        case 5: return 'Overdue';
        default: return 'Unknown';
      }
    },
    getStatusColor(statusId) {
      switch (statusId) {
        case 1: return 'orange';
        case 2: return 'blue';
        case 3: return 'green';
        case 4: return 'gray';
        case 5: return 'red';
        default: return 'black';
      }
    }
  }
}
</script>
