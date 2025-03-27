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

    <el-table :data="filterList" style="width: 1450px;" border>
      <el-table-column label="Order Id" prop="id" align="center" width="120" />
      <el-table-column label="Room Name" prop="roomId" width="230px" align="center" >
        <template slot-scope="scope">
          {{ getRoomNameById(scope.row.roomId) }}
        </template>
      </el-table-column>
      <el-table-column label="User Name" prop="userId" width="160px" align="center" >
        <template slot-scope="scope">
          {{ getUserNameById(scope.row.userId) }}
        </template>
      </el-table-column>
      <el-table-column label="Record Time" prop="recordTime" width="190px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.recordTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Start Time" prop="startTime" width="190px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="End Time" prop="endTime" width="190px" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" prop="statusId" width="130">
        <template slot-scope="scope">
          <span :style="{ color: getStatusColor(scope.row.statusId) }">
            {{ getStatusText(scope.row.statusId) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.statusId !== 4"
            size="mini"
            type="danger"
            @click="handleDeleteorReassign(scope.row)">
            Delete or Reassign
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

    <el-dialog :title="dialogTitle" :visible.sync="deleteDialogVisible" width="450px" >
      <el-form>
        <el-form-item label="Reason for Deletion" >
          <el-select v-model="selectedReason" placeholder="Select Reason" style="width: 350px;">
            <el-option label="Schedule Change" :value="'1; Schedule Change'"></el-option>
            <el-option label="Equipment Failure" :value="'2; Equipment Failure'"></el-option>
            <el-option label="Operation Error" :value="'3; Operation Error'"></el-option>
            <el-option label="Emergency" :value="'4; Emergency'"></el-option>
            <el-option label="Other" :value="'5; Other'"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="selectedReason === '5; Other'" label="Specify Reason">
          <el-input v-model="customReason" placeholder="Please enter reason" style="width: 350px;"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="deleteDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmDelete">Confirm</el-button>
      </span>
    </el-dialog>

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
          <el-date-picker
            v-model="testTime.date"
            type="date"
            placeholder="Select date"
            style="width: 150px"
          />
          <el-time-select
            v-model="testTime.time"
            :picker-options="startTimeOptions"
            placeholder="Select time"
            style="width: 140px; margin-left: 10px;"
          />
        </el-form-item>
        <el-form-item label="End Time" required>
          <el-date-picker
              v-model="testTime.enddate"
              type="date"
              placeholder="Select date"
              style="width: 150px"
            />
            <el-time-select
              v-model="testTime.endtime"
              :picker-options="endTimeOptions"
              placeholder="Select time"
              style="width: 140px; margin-left: 10px;"
            />
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
import { fetchOrders, deleteandReassignOrders, getNameByUid,  getRooms, createRecord, normalCancelByAdmin} from '@/api/order'
import waves from '@/directive/waves'

export default {
  watch: {
    'testTime.date'(val) {
      if (!this.testTime.enddate || this.testTime.enddate !== val) {
        this.testTime.enddate = val;
      }
    },
    'testTime.enddate'(val) {
      if (!this.testTime.date || this.testTime.date !== val) {
        this.testTime.date = val;
      }
    }
  },
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
      testTime:{
        date: '',
        enddate: '',
        time:'',
        endtime:''
      },
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
      pageSize: 20
      },
      deleteDialogVisible: false,
      selectedReason: '',
      currentDeleteRow: null,
      customReason: '',
      dialogTitle: 'Delete Record',
      currentOperation: ''
    }
  },
  created() {
    this.fetchRoom()
    this.getList()
  },
  methods: {
    handleDeleteorReassign(row) {
      this.$msgbox({
        title: 'Choose Operation',
        message: 'Please select the operation you wish to perform:',
        showCancelButton: true,
        showConfirmButton: true,
        showClose: true,
        distinguishCancelAndClose: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Reassign',
        type: 'warning',
        confirmButtonClass: 'el-button--primary',
        cancelButtonClass: 'el-button--primary',
      }).then(action => {
        if (action === 'confirm') {
          this.handleDelete(row);
        }
      }).catch(action => {
        if (action === 'cancel') {
          this.handleDeleteandReassign(row);
        } else if (action === 'close') {
          this.$message.info('Operation canceled');
        }
      });
    },
    formatDateToISO(date) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(' ', 'T');
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
      const start = this.combinedStartTime
      const end = this.combinedEndTime
      if (!this.newOrder.roomId || !this.newOrder.userId || !start || !end) {
        this.$message.error('Please fill in all required fields.');
        return;
      }
      this.newOrder.startTime = this.formatDateToISO(this.combinedStartTime)
      this.newOrder.endTime = this.formatDateToISO(this.combinedEndTime)
      createRecord(this.newOrder)
          .then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$message.success('Record added successfully!');
            this.testTime = {date: '',enddate: '',time:'',endtime:''}
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

    handleDeleteandReassign(row) {
      this.currentDeleteRow = row;
      this.selectedReason = '';
      this.customReason = '';
      this.dialogTitle = 'Delete and Reassign Record';
      this.currentOperation = 'deleteAndReassign';
      this.deleteDialogVisible = true;
    },
    handleDelete(row) {
      this.currentDeleteRow = row;
      this.selectedReason = '';
      this.customReason = '';
      this.dialogTitle = 'Delete Record';
      this.currentOperation = 'delete';
      this.deleteDialogVisible = true;
    },
    confirmDelete() {
      let finalReason = this.selectedReason;

      if (!finalReason) {
        this.$message.error('Please select a reason.');
        return;
      }

      if (finalReason === '5; Other') {
        if (!this.customReason.trim()) {
          this.$message.error('Please specify the reason.');
          return;
        }
        finalReason = `5; ${this.customReason.trim()}`;
      }

      this.$confirm('Are you sure to delete this record?', 'Confirmation', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const operationPromise = this.currentOperation === 'delete'
          ? normalCancelByAdmin(this.currentDeleteRow.id, finalReason)
          : deleteandReassignOrders(this.currentDeleteRow.id, finalReason);

        operationPromise
          .then(() => {
            this.getList();
            this.$message.success('Operation completed successfully!');
            this.deleteDialogVisible = false;
          })
          .catch(error => {
            console.error('Error:', error);
            this.$message.error('Failed to complete operation.');
          });
      }).catch(() => {
        this.$message.info('Operation canceled');
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
    },
    formatDateToYYYYMMDD(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  computed: {
    combinedStartTime() {
      if (this.testTime.date && this.testTime.time) {
        return new Date(`${this.formatDateToYYYYMMDD(this.testTime.date)} ${this.testTime.time}`);
      }
      return null;
    },
    combinedEndTime() {
      if (this.testTime.enddate && this.testTime.endtime) {
        return new Date(`${this.formatDateToYYYYMMDD(this.testTime.enddate)} ${this.testTime.endtime}`);
      }
      return null;
    },
    endTimeOptions() {
      if (!this.testTime.time) {
        return {
          start: '08:30',
          step: '00:30',
          end: '22:00'
        };
      }

      const [hourStr, minuteStr] = this.testTime.time.split(':');
      let hour = parseInt(hourStr, 10);
      let minute = parseInt(minuteStr, 10);

      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute -= 60;
      }

      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      const newStart = `${formattedHour}:${formattedMinute}`;

      return {
        start: newStart,
        step: '00:30',
        end: '22:00'
      };
    },
    startTimeOptions() {
      if (!this.testTime.endtime) {
        return {
          start: '08:00',
          step: '00:30',
          end: '21:30'
        };
      }

      const [hourStr, minuteStr] = this.testTime.endtime.split(':');
      let hour = parseInt(hourStr, 10);
      let minute = parseInt(minuteStr, 10);

      minute -= 30;
      if (minute < 0) {
        hour -= 1;
        minute += 60;
      }

      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      const newEnd = `${formattedHour}:${formattedMinute}`;

      return {
        start: '08:00',
        step: '00:30',
        end: newEnd
      };
    }
  }
}
</script>

<style scoped>

.el-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
