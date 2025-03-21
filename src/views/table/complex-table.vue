<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.Order_Id" placeholder="Order Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.Room_Name" placeholder="Room Name" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.User_Name" placeholder="User Name" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleAdd">
        Add Order
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table :data="filterList" style="width: 1340px;" border>
      <el-table-column label="Order Id" prop="id" align="center" width="110" />
      <el-table-column label="Room Name" prop="roomId" width="230px" align="center" >
        <template slot-scope="scope">
          {{ getRoomNameById(scope.row.roomId) }}
        </template>
      </el-table-column>
      <el-table-column label="User Name" prop="userId" width="130px" align="center" >
        <template slot-scope="scope">
          {{ getUserNameById(scope.row.userId) }}
        </template>
      </el-table-column>
      <el-table-column label="Record Time" prop="recordTime" width="180px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.recordTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Start Time" prop="startTime" width="180px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="End Time" prop="endTime" width="180px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" prop="statusId" width="120">
        <template slot-scope="scope">
          <span :style="{ color: getStatusColor(scope.row.statusId) }">
            {{ getStatusText(scope.row.statusId) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
            Force Delete and resign
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: center;"
    />

    <el-dialog title="Add New Order" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="newOrder" label-width="120px" style="margin-left: -30px;">
        <el-form-item label="Room" required>
          <el-select v-model="newOrder.roomId" placeholder="Select Room" style="width: 100%;">
            <el-option v-for="room in classrooms" :key="room.id" :label="room.roomName" :value="room.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="User ID" required>
          <el-input v-model="newOrder.userId" placeholder="Enter User ID" style="width: 100%;"></el-input>
        </el-form-item>
        <el-form-item label="Start Time" required>
          <el-date-picker v-model="newOrder.startTime" type="datetime" placeholder="Select Start Time" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" required>
          <el-date-picker v-model="newOrder.endTime" type="datetime" placeholder="Select End Time" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="Comment" >
          <el-input v-model="newOrder.comment" placeholder="Enter Comment(optional)"  type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addRecord">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchOrders, deleteOrders, getNameByUid,  getRooms, createRecord} from '@/api/order'
import waves from '@/directive/waves'

export default {
  name: 'ComplexTable',
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'completed': 'success',
        'incompleted': 'warning'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      total: 0,
      classrooms: [],
      userCache: {},
      listQuery: {
        Order_Id: '',
        Room_Id: '',
      },
      dialogFormVisible: false,
      newOrder: {
        roomId: '',
        userId: '',
        startTime: '',
        endTime: '',
        hasCheckedIn: false,
        comment: ''
      },
      list: [],
      filterList: [],
      dialogStatus: '',
      downloadLoading: false,
      pagination: {
      currentPage: 1,
      pageSize: 10
      }
    }
  },
  created() {
    this.fetchRoom()
    this.getList()
  },
  methods: {
    formatDateToISO(date) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(' ', 'T');
    },
    getStatusText(statusId) {
      switch (statusId) {
        case 1: return 'Pending';
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
    },
    handleAdd(){
      this.newOrder = { roomId: '',  userId: '', startTime: '', endTime: '', hasCheckedIn: false, comment: ''}
      this.dialogFormVisible= true
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
    addRecord(){
      this.newOrder.startTime = this.formatDateToISO(this.newOrder.startTime)
      this.newOrder.endTime = this.formatDateToISO(this.newOrder.endTime)
      createRecord(this.newOrder)
          .then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$message.success('Record added successfully!');
          })
          .catch(error => {
            console.error('Error adding record:', error);
            this.$message.error('Failed to add record.');
          });
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
    getList() {
      fetchOrders({
        page: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
        .then(response => {
          this.list = response.data.data.records
          this.total = response.data.data.total
          this.filterList = this.list
        })
        .catch(error => {
          console.error('Error fetching records:', error)
        })
    },
    handleFilter() {
      const queryId = this.listQuery.Order_Id
      const queryUser = this.listQuery.User_Name
      const queryRoom = this.listQuery.Room_Name
      if (!queryId && !queryUser && !queryRoom) {
        this.getList();
        return;
      }
      this.filterList = this.list.filter(item => {
        const matchesId = !queryId || String(item.id).includes(queryId);
        const matchesUser = !queryUser || this.getUserNameById(item.userId).includes(queryUser);
        const matchesRoom = !queryRoom || this.getRoomNameById(item.roomId).includes(queryRoom);

        return matchesId && matchesUser && matchesRoom;
      });
      this.total = this.filterList.length;
    },

    handleDelete(row) {
      this.$prompt('Please enter the reason for deletion', 'Reminder', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        inputPattern: /.+/,
        inputErrorMessage: 'Reason cannot be empty'
      }).then(({ value }) => {
        this.$confirm('Are you sure to delete this record?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          deleteOrders(row.id, value)
            .then(() => {
              this.getList();
              this.$message.success('Record deleted successfully!');
            })
            .catch(error => {
              console.error('Error deleting record:', error);
              this.$message.error('Failed to delete record.');
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          });
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        });
      });
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['Order Id', 'Record Time', 'Room Id', 'User Id', 'Start Time', 'End Time', 'Status']
        const filterVal = ['id', 'recordTime', 'roomId', 'userId', 'startTime', 'endTime', 'status']
        const data = this.formatJson(filterVal, this.filterList)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, data) {
      return data.map(v => filterVal.map(j => {
        if (j === 'recordTime' || j === 'startTime' || j === 'endTime') {
          return this.formatDate(v[j]);
        } else if (j === 'roomId') {
          return this.getRoomNameById(v[j]);
        } else if (j === 'userId') {
          return this.getUserNameById(v[j]);
        } else if (j === 'statusId') {
          return this.getStatusText(v[j]);
        } else {
          return v[j];
        }
      }));
    },
    formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getList()
    }
  }
}
</script>


