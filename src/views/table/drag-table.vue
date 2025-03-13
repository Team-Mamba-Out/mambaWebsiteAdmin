<template>
  <div class="app-container">
    <el-button type="primary" class="add-button" @click="handleAdd">Add New Room</el-button>
    <el-table :data="classrooms" style="width: 1450px; margin-top: 20px;" border>
      <el-table-column prop="id" label="Room ID" width="80" />
      <el-table-column prop="roomName" label="Room Name" width="230" />
      <el-table-column prop="image" label="Room Image" width="110">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleViewImage(scope.row)">{{ "Click to view" }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="Room Type" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.roomType === 1">Teaching Room</span>
          <span v-else-if="scope.row.roomType === 2">Meeting Room</span>
          <span v-else-if="scope.row.roomType === 3">Activity Room</span>
          <span v-else>Unknown</span>
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="Capacity" width="100" />
      <el-table-column label="projector" width="100">
        <template slot-scope="scope">
          {{ scope.row.projector? 'Yes' : 'No' }}
        </template>
      </el-table-column>
      <el-table-column label="Multimedia" width="110">
        <template slot-scope="scope">
          {{ scope.row.multimedia ? 'Yes' : 'No' }}
        </template>
      </el-table-column>
      <el-table-column label="Restriction" width="150">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.isRestricted" class="readonly-checkbox">is Restricted</el-checkbox>
          <el-button v-if="scope.row.isRestricted" size="mini" @click="handleSetPermission(scope.row)">Set Permission</el-button>
        </template>
      </el-table-column>
      <el-table-column label="Approval" width="150">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.requireApproval" class="readonly-checkbox">Required</el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="Permission Setting" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="handleEdit(scope.row)">Edit</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">Delete</el-button>
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
          <el-input v-model="currentClassroom.id" type="number" disabled />
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
        <el-form-item label="Room Image">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :on-change="handleUploadSuccess"
          >
            <el-button size="small" type="primary">Selet Image</el-button>
          </el-upload>
          <img v-if="currentClassroom.url" :src="currentClassroom.url" class="classroom-image-preview">
          <div class="el-upload__tip">Only jpg/png files with a maximum size of 500kb can be uploaded</div>
        </el-form-item>
        <el-form-item label="Restriction">
          <el-checkbox v-model="currentClassroom.isRestricted">is Restricted</el-checkbox>
        </el-form-item>
        <el-form-item label="Approval">
          <el-checkbox v-model="currentClassroom.requireApproval">Approval is required</el-checkbox>
        </el-form-item>
        <el-form-item label="Description" >
          <el-input v-model="currentClassroom.description" type="textarea" :rows="7" />
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
  </div>
</template>

<script>
import { getRooms, getLecturers ,setPermissionUser, getPermissionUser, deleteRoom, addRoom} from '@/api/room'
export default {
  data() {
    return {
      classrooms: [],
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
        isRestricted: false,
        allowedUsers: [],
        url: '',
        description: ''
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
      filteredUsers: []
    }
  },
  created() {
    this.fetchClassrooms()
    this.fetchUsers()
  },
  methods: {
    fetchClassrooms() {
     getRooms({
        page: this.pagination.currentPage,
        limit: this.pagination.pageSize
      })
        .then(response => {
          this.classrooms = response.data.data.rooms
          console.log(this.classrooms)
          this.pagination.total = response.data.data.total
          this.classrooms.forEach(room => {
            getPermissionUser({ room_id: room.id })
              .then(permissionResponse => {
                room.allowedUsers = permissionResponse.data.data[0]
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
    fetchUsers() {
      getLecturers()
        .then(response => {
          this.users = response.data.data.lecturers
          console.log(this.users);
        })
        .catch(error => {
          console.error('Error fetching users:', error)
        })
    },
    handleAdd() {
      this.dialogTitle = 'Add Room'
      this.currentClassroom = { id: null, roomName: '', roomType: 1, capacity: 0, projector: false, multimedia: false, isRestricted: false, url: '' }
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
        // Update existing room
        addRoom(this.currentClassroom)
          .then(() => {
            this.fetchClassrooms()
            this.dialogVisible = false
            this.$message.success('Room updated successfully!')
          })
          .catch(error => {
            console.error('Error updating room:', error)
            this.$message.error('Failed to update room.')
          })
      } else {
        // Add new room
        addRoom(this.currentClassroom)
          .then(() => {
            this.fetchClassrooms()
            this.dialogVisible = false
            this.$message.success('Room added successfully!')
          })
          .catch(error => {
            console.error('Error adding room:', error)
            this.$message.error('Failed to add room.')
          })
      }
    },
    handleSetPermission(row) {
      this.currentClassroom= {...row}
      this.filteredUsers = []
      this.permissionDialogVisible = true
    },
    handleSavePermission() {
      setPermissionUser({
        room_id: this.currentClassroom.id,
        uids: this.currentPermission.allowedUsers
      })
        .then(() => {
          this.fetchClassrooms() // Refresh list
          this.permissionDialogVisible = false
          this.$message.success('Permission saved successfully!')
        })
        .catch(error => {
          console.error('Error saving permission:', error)
          this.$message.error('Failed to save permission.')
        })
    },
    handleUploadSuccess(response, file) {
      this.currentClassroom.url = ''
      this.$nextTick(() => {
        this.currentClassroom.url = URL.createObjectURL(file.raw)
      })
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt500K = file.size / 1024 / 1024 < 0.5

      if (!isJPG && !isPNG) {
        this.$message.error('Upload images only in JPG or PNG format!')
        return false
      }
      if (!isLt500K) {
        this.$message.error('Upload picture size cannot exceed 500KB!')
        return false
      }
      return true
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
    const matchedUsers = this.users.filter(user => user.email.includes(this.searchQuery));
      if (matchedUsers != null) {
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
        this.$alert('No user found. Please check the name and try again.', 'User Not Found', {
          confirmButtonText: 'OK',
          type: 'warning'
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
      this.pagination.currentPage = page
      this.fetchClassrooms()
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      this.fetchClassrooms()
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
