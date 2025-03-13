<template>
  <div class="app-container">
    <el-table :data="users" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="uid" label="User ID" width="120" />
      <el-table-column prop="name" label="User Name" width="150" />
      <el-table-column prop="role" label="Role" width="150">
        <template slot-scope="scope">
          <el-select v-model="scope.row.role" placeholder="Select Role" @change="handleRoleChange(scope.row)">
            <el-option label="Teacher" :value="1" />
            <el-option label="Student" :value="2" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleDelete(scope.row.uid)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: []
    }
  },
  created() {
    this.fetchUsers()
  },
  methods: {
    fetchUsers() {
      axios.get('/users', {
        params: {
          pageSize: 10,
          offset: 0
        }
      })
        .then(response => {
          this.users = response.data.data
        })
        .catch(error => {
          console.error('Error fetching users:', error)
        })
    },
    handleRoleChange(user) {
      axios.put(`/users/${user.uid}`, { role: user.role })
        .then(() => {
          this.$message({
            type: 'success',
            message: 'Role updated successfully!'
          })
        })
        .catch(error => {
          console.error('Error updating role:', error)
          this.$message({
            type: 'error',
            message: 'Failed to update role'
          })
        })
    },
    handleDelete(uid) {
      this.$confirm('Are you sure to delete this user?', 'Reminder', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        axios.delete(`/users/delete/${uid}`)
          .then(() => {
            this.users = this.users.filter(user => user.uid !== uid)
            this.$message({
              type: 'success',
              message: 'Deleted successfully!'
            })
          })
          .catch(error => {
            console.error('Error deleting user:', error)
            this.$message({
              type: 'error',
              message: 'Failed to delete user'
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.el-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
