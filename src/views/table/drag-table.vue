<template>
  <div class="app-container">
    <el-button type="primary" class="add-button" @click="handleAdd">Add New Room</el-button>
    <el-button type="primary" class="report-button" @click="fetchMaintenanceReports">
      Message Report
    </el-button>
    <el-table :data="classrooms" style="width: 1500px; margin-top: 20px;" border>
      <el-table-column prop="id" label="Room ID" width="80" align="center"/>
      <el-table-column prop="roomName" label="Room Name" width="225" />
      <el-table-column prop="image" label="Room Image" width="110">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleViewImage(scope.row)">{{ "Click to view" }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="Room Type" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.roomType === 1">Teaching Room</span>
          <span v-else-if="scope.row.roomType === 2">Meeting Room</span>
          <span v-else-if="scope.row.roomType === 3">Activity Room</span>
          <span v-else>Unknown</span>
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="Capacity" width="80" />
      <el-table-column label="projector" width="85">
        <template slot-scope="scope">
          {{ scope.row.projector? 'Yes' : 'No' }}
        </template>
      </el-table-column>
      <el-table-column label="Multimedia" width="95">
        <template slot-scope="scope">
          {{ scope.row.multimedia ? 'Yes' : 'No' }}
        </template>
      </el-table-column>
      <el-table-column label="Restriction" width="150">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.restricted" class="readonly-checkbox">is Restricted</el-checkbox>
          <el-button v-if="scope.row.restricted" size="mini" @click="handleSetPermission(scope.row)">Set Permission</el-button>
        </template>
      </el-table-column>
      <el-table-column label="Approval" width="150">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.requireApproval" class="readonly-checkbox">Required</el-checkbox>
          <el-button v-if="scope.row.requireApproval" size="mini" @click="handleApproval(scope.row)">handle approval</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="maintenance" label="Maintenance" width="150">
        <template slot-scope="scope">
          <span :style="{ color: scope.row.maintenance ? 'red' : 'green' }">
            {{ scope.row.maintenance ? 'Under Maintenance' : 'Available' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Permission Setting" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="handleEdit(scope.row)">Edit</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">Delete</el-button>
          <el-button size="mini" type="warning" style="display: block; margin-top: 5px; width: 135px; margin-left: 0px;" @click="handleMaintenance(scope.row)">Maintenance</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="currentClassroom" label-width="100px">
        <el-form-item label="Room ID">
          <el-input v-model="currentClassroom.id" type="number" disabled/>
        </el-form-item>
        <el-form-item label="Room Name">
          <el-input v-model="currentClassroom.roomName" />
        </el-form-item>
        <el-form-item label="Location">
          <el-input v-model="currentClassroom.location" />
        </el-form-item>
        <el-form-item label="Room Type">
          <el-select v-model="currentClassroom.roomType" placeholder="Select Room Type">
            <el-option label="Teaching Room" :value="1"></el-option>
            <el-option label="Meeting Room" :value="2"></el-option>
            <el-option label="Activity Room" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Capacity">
          <el-input v-model="currentClassroom.capacity" type="number" />
        </el-form-item>
        <el-form-item label="Projector">
          <el-select v-model="currentClassroom.projector" placeholder="Select Projector">
            <el-option label="Yes" :value="true"></el-option>
            <el-option label="No" :value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Multimedia">
          <el-select v-model="currentClassroom.multimedia" placeholder="Select Multimedia">
            <el-option label="Yes" :value="true"></el-option>
            <el-option label="No" :value="false"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Restriction">
          <el-checkbox v-model="currentClassroom.restricted">is Restricted</el-checkbox>
        </el-form-item>
        <el-form-item label="Approval">
          <el-checkbox v-model="currentClassroom.requireApproval">Approval is required</el-checkbox>
        </el-form-item>
        <el-form-item label="Description" >
          <el-input v-model="currentClassroom.description" type="textarea" :rows="8" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSave">Save</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Room Image" :visible.sync="imageDialogVisible" width="500px">
      <img :src="currentImage" class="classroom-image-preview">
    </el-dialog>

    <el-dialog title="Permission Setting" :visible.sync="permissionDialogVisible" width="500px">
      <el-form :model="currentPermission" label-width="150px">
        <div style="display: flex; align-items: center; gap: 0px;">
          <el-input v-model="searchQuery" placeholder="Input User Email" style="width: 350px" @keyup.enter.native="searchUser" />
          <el-button class="search-button" @click="searchUser">Search</el-button>
        </div>
        <el-select v-model="currentPermission.allowedUsers" class="user-select" multiple placeholder="Please Select Users" style="width: 350px;">
          <el-option
            v-for="user in users"
            :key="user.uid"
            :label="user.name"
            :value="user.uid"
          />
        </el-select>
        <el-form-item>
          <div style="margin-left: -150px; margin-top: 0px;">
            <el-checkbox v-model="allTeachersSelected" @change="handleAllTeachersChange">All Teachers</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div style="margin-top: -25px">
          <el-button class="clear-button" style="margin-right: 0px;" @click="clearAllPermissions">Clear Permission</el-button>
          <el-button @click="permissionDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSavePermission">Save</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="Approval Orders" :visible.sync="approvalDialogVisible" width="1100px">
      <el-table :data="approvalOrders" border style="width: 100%">
        <el-table-column prop="id" label="Order ID" width="80" align="center"/>
        <el-table-column prop="userId" label="User Name" width="120">
          <template slot-scope="scope">
            {{ getUserNameById(scope.row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="Start Time" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="End Time" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="recordTime" label="Record Time" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.recordTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100">
          <template slot-scope="scope">
            <span :style="{ color: getStatusColor(scope.row.statusId) }">
              {{ getStatusText(scope.row.statusId) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="250">
          <template slot-scope="scope">
            <el-button size="mini" type="success" @click="ApproveOrder(scope.row.id)">Approve</el-button>
            <el-button size="mini" type="danger" @click="RejectOrder(scope.row.id)">Reject</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="Maintenance Management" :visible.sync="maintenanceDialogVisible" width="800px">
      <el-table :data="maintenanceRecords" border>
        <el-table-column prop="id" label="ID" width="80" align="center"/>
        <el-table-column prop="scheduledStart" label="Start Time" width="150">
          <template slot-scope="scope">{{ formatDate(scope.row.scheduledStart) }}</template>
        </el-table-column>
        <el-table-column prop="scheduledEnd" label="End Time" width="150">
          <template slot-scope="scope">{{ formatDate(scope.row.scheduledEnd) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="Description" width="260" />
        <el-table-column label="Action" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="deleteMaintenanceRecord(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="maintenancePagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="maintenancePagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="maintenancePagination.total"
        @current-change="handleMaintainPageChange"
        @size-change="handleMaintainSizeChange"
      />

      <el-form label-width="100px" style="margin-top: 20px;">
        <el-form-item label="Start Time">
          <el-date-picker v-model="newMaintenance.newStartTime" type="datetime" placeholder="Select start time" />
        </el-form-item>
        <el-form-item label="End Time">
          <el-date-picker v-model="newMaintenance.newEndTime" type="datetime" placeholder="Select end time" />
        </el-form-item>
        <el-form-item label="Reason">
          <el-input v-model="newMaintenance.reason" type="textarea" />
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="maintenanceDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addMaintenanceRecord">Add Maintenance and resign</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Message Reports" :visible.sync="reportDialogVisible" width="1300px">
      <el-select v-model="selectedMessageType" placeholder="Select message type" @change="filterMessages">
        <el-option label="All Messages" value="all"></el-option>
        <el-option label="Maintenance Reports" value="maintenance"></el-option>
        <el-option label="Other Messages" value="other"></el-option>
      </el-select>
      <el-table :data="filteredMessages" border>
        <el-table-column prop="title" label="Report Title" width="250" align="center"/>
        <el-table-column label="Room Name" prop="roomId" width="225px" align="center" >
          <template slot-scope="scope">
            {{ getRoomNameById(scope.row.roomId) }}
          </template>
        </el-table-column>
        <el-table-column prop="text" label="Description" width="500"/>
        <el-table-column prop="sender" label="Reported By" width="150">
          <template slot-scope="scope">
            {{ getSenderName(scope.row.sender) }}
          </template>
        </el-table-column>
        <el-table-column label="Action" width="150">
          <template slot-scope="scope">
            <el-button v-if="scope.row.type === 1" size="mini" type="success" @click="handleMaintenanceReport(scope.row)">
              Handle
            </el-button>
            <el-button v-if="scope.row.type === 0 || scope.row.type === 2" size="mini" type="info" @click="markAsRead(scope.row)">
              Mark as Read
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="reportPagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="reportPagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="reportPagination.total"
        @current-change="handleReportPageChange"
        @size-change="handleReportSizeChange"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getRooms, getLecturers ,updateRoomPermission, getPermissionUser, deleteRoom, addRoom, updateRoom, getApprovalResources,approveApprovalResource, rejectRestrictedResource, getNameByUid, getMaintenance, addMaintenance, deleteMaintenance, getMaintenanceReports, readMessage} from '@/api/room'
export default {
  data() {
    return {
      approvalOrders: [],
      userCache: {},
      classrooms: [],
      maintenanceDialogVisible: false,
      currentRoomId: null,
      currentRoomName: '',
      maintenanceRecords: [],
      newMaintenance: {
        roomId: null,
        newStartTime: '',
        newEndTime: '',
        reason: ''
      },
      dialogVisible: false,
      dialogTitle: '',
      currentClassroom: {
        id: null,
        isBusy: false,
        location: '',
        requireApproval: false,
        roomName: '',
        roomType: 0,
        capacity: 0,
        projector: false,
        multimedia: false,
        restricted: false,
        allowedUsers: [],
        url: '',
        description: ''
      },
      maintenancePagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      permissionDialogVisible: false,
      currentPermission: {
        allowedUsers: []
      },
      imageDialogVisible: false,
      currentImage: '',
      users: [],
      allTeachersSelected: false,
      allStudentsSelected: false,
      searchQuery: '',
      filteredUsers: [],
      approvalDialogVisible: false,
      approvalOrders: [],
      reportDialogVisible: false,
      maintenanceReports: [],
      reportPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      currentUserId: 1,
      filteredMessages: [],
      selectedMessageType: "all",
    }
  },
  created() {
    this.fetchClassrooms()
    this.fetchLecturers()
  },
  methods: {
    filterMessages() {
      if (this.selectedMessageType === "all") {
        this.filteredMessages = this.maintenanceReports;
      } else if (this.selectedMessageType === "maintenance") {
        this.filteredMessages = this.maintenanceReports.filter(msg => msg.type === 1);
      } else if (this.selectedMessageType === "other") {
        this.filteredMessages = this.maintenanceReports.filter(msg => msg.type === 0);
      }
    },
    markAsRead(row){
      readMessage({"id": row.id})
        .then(() => {
        this.$message.success('Message marked as read successfully!');
        this.fetchMaintenanceReports()
        this.filterMessages();
      })
      .catch(error => {

        console.error('Error marking message as read:', error);
        this.$message.error('Failed to mark message as read.');
      });

    },
    getSenderName(sender) {
      if (!sender) return "Unknown";
      return sender.includes(";") ? sender.split(";").pop().trim() : sender;
    },
    formatDateToISO(date) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(' ', 'T');
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
    getRoomNameById(roomId) {
      const room = this.classrooms.find(room => room.id === roomId);
      return room ? room.roomName : 'Unknown Room';
    },
    fetchClassrooms() {
     getRooms({
        page: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
        .then(response => {
          this.classrooms = response.data.data.rooms
          this.pagination.total = response.data.data.total
          this.classrooms.forEach(room => {
            getPermissionUser({ room_id: room.id })
              .then(permissionResponse => {
                room.allowedUsers = permissionResponse.data.data
              })
              .catch(error => {
                console.error(`Error fetching permissions for room ${room.id}:`, error)
              })
          })
        })
        .catch(error => {
          console.error('Error fetching classrooms:', error)
        })
    },
    fetchLecturers() {
      getLecturers()
        .then(response => {
          this.users = response.data.data.lecturers
        })
        .catch(error => {
          console.error('Error fetching users:', error)
        })
    },
    handleAdd() {
      this.dialogTitle = 'Add Room'
      this.currentClassroom = { id: null, roomName: '', roomType: 1, capacity: 0, projector: false, multimedia: false, restricted: false, url: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
    this.dialogTitle = 'Edit Room'
    this.currentClassroom = { ...row}
    this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('Are you sure to delete this classroom?', 'Reminder', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteRoom(row.id)
          .then(() => {
            this.fetchClassrooms()
            this.$message.success('Room deleted successfully!')
          })
          .catch(error => {
            console.error('Error deleting room:', error)
            this.$message.error('Failed to delete room.')
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    handleSave() {
      if (this.currentClassroom.id) {
        updateRoom(this.currentClassroom.id, this.currentClassroom)
          .then(() => {
            this.fetchClassrooms();
            this.dialogVisible = false;
            this.$message.success('Room updated successfully!');
          })
          .catch(error => {
            console.error('Error updating room:', error);
            this.$message.error('Failed to update room.');
          });
      } else {
        addRoom(this.currentClassroom)
          .then(() => {
            this.fetchClassrooms();
            this.dialogVisible = false;
            this.$message.success('Room added successfully!');
          })
          .catch(error => {
            console.error('Error adding room:', error);
            this.$message.error('Failed to add room.');
          });
      }
    },
    handleSetPermission(row) {
      this.currentClassroom= {...row}
      this.currentPermission.allowedUsers = [...row.allowedUsers];
      this.filteredUsers = []
      this.permissionDialogVisible = true
    },
    handleSavePermission() {
      updateRoomPermission({
        id:this.currentClassroom.id,
        permissionUsers:this.currentPermission.allowedUsers
      }) .then(() => {
          this.fetchClassrooms()
          this.permissionDialogVisible = false
          this.$message.success('Permission saved successfully!')
        })
        .catch(error => {
          console.error('Error saving permission:', error)
          this.$message.error('Failed to save permission.')
        })
    },
    handleApproval(row) {
      getApprovalResources(row.id)
      .then(response => {
        this.approvalOrders = response.data.data;
        this.approvalDialogVisible = true;
      })
      .catch(error => {
        console.error('Error fetching approval orders:', error);
        this.$message.error('Failed to fetch approval orders.');
      });
    },
    ApproveOrder(orderId) {
      approveApprovalResource(orderId)
        .then(() => {
          this.$message.success(`Order ${orderId} approved successfully!`);
          this.approvalOrders = this.approvalOrders.filter(order => order.id !== orderId);
        })
        .catch(error => {
          console.error('Error approving order:', error);
          this.$message.error('Failed to approve order.');
        });
    },
    RejectOrder(orderId) {
      rejectRestrictedResource(orderId)
        .then(() => {
          this.$message.success(`Order ${orderId} rejected
          successfully!`);
          this.approvalOrders = this.approvalOrders.filter(order => order.id !== orderId);
        })
        .catch(error => {
          console.error('Error rejecting order:', error);
          this.$message.error('Failed to reject order.');
        });
    },
    handleViewImage(row) {
      this.currentImage = row.url
      this.imageDialogVisible = true
    },
    handleAllTeachersChange() {
      if (this.allTeachersSelected) {
        const teacherIds = this.users.map(user => user.uid);
        this.currentPermission.allowedUsers = Array.from(new Set([...this.currentPermission.allowedUsers, ...teacherIds]));
      } else {
        this.currentPermission.allowedUsers = this.currentPermission.allowedUsers.filter(uid =>
          !this.users.some(user => user.uid === uid)
        );
      }
    },
    searchUser() {
    const matchedUsers = this.users.filter(user => user.email === this.searchQuery);//filter teachers
      if (matchedUsers.length > 0) {
        this.$confirm(`User ${matchedUsers[0].name} found. Do you want to add?`, 'User Found', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'info'
        }).then(() => {
          this.addUser(matchedUsers[0])
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'User not added'
          })
        })
      } else {
        this.$message({
          type: 'error',
          message: 'Fail: No user found. Please check the email and try again.'
        })
      }
    },
    addUser(user) {
      if (!this.currentPermission.allowedUsers.includes(user.uid)) {
        this.currentPermission.allowedUsers.push(user.uid)
      }
      this.currentPermission.allowedUsers = [...this.currentPermission.allowedUsers]
      this.filteredUsers = []
      this.searchQuery = ''
    },
    clearAllPermissions() {
      this.currentPermission.allowedUsers = []
    },
    getUserTypeById(userId) {
      const user = this.users.find(user => user.id === userId)
      if (user) {
        return user.name.includes('Teacher') ? 'Teacher' : 'Student'
      }
      return null
    },
    handlePageChange(page) {
      this.pagination.currentPage = page;
      this.fetchClassrooms();
    },

    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.currentPage = 1;
      this.fetchClassrooms();
    },

    handleMaintainPageChange(page) {
      this.maintenancePagination.currentPage = page;
      this.getMaintenanceList(this.currentRoomId);
    },

    handleMaintainSizeChange(size) {
      this.maintenancePagination.pageSize = size;
      this.maintenancePagination.currentPage = 1;
      this.getMaintenanceList(this.currentRoomId);
    },

    handleReportPageChange(page) {
      this.reportPagination.currentPage = page;
      this.fetchMaintenanceReports();
    },

    handleReportSizeChange(size) {
      this.reportPagination.pageSize = size;
      this.reportPagination.currentPage = 1;
      this.fetchMaintenanceReports();
    },
    handleMaintenanceReport(report) {
      this.markAsRead(report)
      this.reportDialogVisible = false;
      this.handleMaintenance({ id: report.roomId });
    },
    fetchMaintenanceReports() {
      getMaintenanceReports(this.currentUserId,{
        page: this.reportPagination.currentPage,
        size: this.reportPagination.pageSize
      })
      .then(response => {
        const allMessages = response.data.data.messages;
        const unreadMessages = allMessages.filter(msg => msg.read === false);
        this.maintenanceReports = unreadMessages;
        this.reportPagination.total = response.data.data.total;
        this.reportDialogVisible = true;
        this.filterMessages();
      })
      .catch(error => {
        console.error('Error fetching maintenance reports:', error);
        this.$message.error('Failed to fetch maintenance reports.');
      });
    },
    handleMaintenance(row) {
      this.currentRoomId = row.id;
      this.newMaintenance.roomId = this.currentRoomId;
      this.getMaintenanceList(row.id);
      this.maintenanceDialogVisible = true;
    },
    getMaintenanceList(roomId){
      getMaintenance({roomId: roomId,
    page: this.maintenancePagination.currentPage,
    size: this.maintenancePagination.pageSize })
        .then(response => {
          this.maintenanceRecords = response.data.data.maintenanceList;
          this.maintenancePagination.total = response.data.data.total;
        })
        .catch(error => {
          console.error('Error fetching maintenance records:', error);
          this.$message.error('Failed to fetch maintenance records.');
        });
    },
    addMaintenanceRecord() {
    if (!this.newMaintenance.newStartTime || !this.newMaintenance.newEndTime || !this.newMaintenance.reason) {
      this.$message.error('Please fill in all maintenance details.');
      return;
    }
    this.newMaintenance.newStartTime = this.formatDateToISO(this.newMaintenance.newStartTime)
    this.newMaintenance.newEndTime = this.formatDateToISO(this.newMaintenance.newEndTime)
      addMaintenance(this.newMaintenance)
      .then(() => {
        this.$message.success('Maintenance record added successfully!');
        this.fetchClassrooms();
        this.getMaintenanceList(this.currentRoomId);
        this.newMaintenance = { startTime: '', endTime: '', reason: '' };
      }).catch(error => {
        console.error('Error adding maintenance record:', error);
        this.$message.error('Failed to add maintenance record.');
      });
    },
    deleteMaintenanceRecord(row){
      this.$confirm('Are you sure to delete this record?', 'Reminder', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteMaintenance(row.id)
          .then(() => {
            this.fetchClassrooms()
            this.getMaintenanceList(this.currentRoomId)
            this.$message.success('Record deleted successfully!')
          })
          .catch(error => {
            console.error('Error deleting record:', error)
            this.$message.error('Failed to delete record.')
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
    },
    getRoomName(roomId) {
      const room = this.classrooms.find(r => r.id === roomId);
      return room ? room.roomName : "Unknown Room";
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
    }
  }
}
</script>

<style scoped>
.readonly-checkbox {
  pointer-events: none;
}
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.add-button {
  margin-bottom: 20px;
}

.el-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-dialog {
  border-radius: 8px;
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: 20px;
}

.classroom-image-preview {
  width: 100%;
  height: auto;
  margin-top: 10px;
}

.indented-item {
  padding-left: 20px;
}

.search-button {
  margin-left: 10px;
}

.user-select {
  margin-top: 10px;
  width: 100%;
}

.add-button {
  margin-top: 10px;
}

.clear-button {
  margin-right: 10px;
}
</style>
