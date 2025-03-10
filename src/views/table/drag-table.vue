<template>
  <div class="app-container">
    <el-button type="primary" class="add-button" @click="handleAdd">添加教室</el-button>
    <el-table :data="classrooms" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="id" label="房间ID" width="100" />
      <el-table-column prop="name" label="教室名称" width="180">
        <template slot-scope="scope">
          <el-link @click="handleViewImage(scope.row)">{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="房间类型" width="120" />
      <el-table-column prop="capacity" label="容量" width="100" />
      <el-table-column label="投影仪" width="100">
        <template slot-scope="scope">

          {{ scope.row.projector > 0 ? scope.row.projector : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="多媒体" width="100">
        <template slot-scope="scope">
          {{ scope.row.multimedia > 0 ? scope.row.multimedia : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="特殊权限" width="180">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.specialPermission">特殊权限</el-checkbox>
          <el-button v-if="scope.row.specialPermission" size="mini" @click="handleSetPermission(scope.row)">设置权限</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="currentClassroom" label-width="100px">
        <el-form-item label="房间ID">
          <el-input v-model="currentClassroom.id" type="number" disabled />
        </el-form-item>
        <el-form-item label="教室名称">
          <el-input v-model="currentClassroom.name" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-input v-model="currentClassroom.type" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input v-model="currentClassroom.capacity" type="number" />
        </el-form-item>
        <el-form-item label="投影仪">
          <el-input v-model="currentClassroom.projector" type="number" />
        </el-form-item>
        <el-form-item label="多媒体">
          <el-input v-model="currentClassroom.multimedia" type="number" />
        </el-form-item>
        <el-form-item label="教室图片">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          />
          <el-button slot="trigger" size="small" type="primary">选取图片</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件,且不超过500kb</div>
          <img v-if="currentClassroom.imageUrl" :src="currentClassroom.imageUrl" class="classroom-image-preview">
        </el-form-item>
        <el-form-item label="特殊权限">
          <el-checkbox v-model="currentClassroom.specialPermission">特殊权限</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="教室图片" :visible.sync="imageDialogVisible" width="500px">
      <img :src="currentImage" class="classroom-image-preview">
    </el-dialog>

    <el-dialog title="设置权限" :visible.sync="permissionDialogVisible" width="500px">
      <el-form :model="currentPermission" label-width="150px">
        <el-form-item label="允许预定的用户" class="indented-item">
          <el-input v-model="searchQuery" placeholder="搜索用户姓名" />
          <el-button @click="searchUser">搜索</el-button>
          <el-select v-model="currentPermission.allowedUsers" multiple placeholder="请选择用户">
            <el-option
              v-for="user in filteredUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
          <el-button v-if="filteredUsers.length > 0" @click="addUser">添加</el-button>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="allTeachersSelected" @change="handleAllTeachersChange">所有老师</el-checkbox>
          <el-checkbox v-model="allStudentsSelected" @change="handleAllStudentsChange">所有学生</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      classrooms: [
        { id: 1, name: '教室A', type: '普通教室', capacity: 30, projector: 1, multimedia: 0, specialPermission: false, allowedUsers: [], imageUrl: '/images/classroomA.jpg' },
        { id: 2, name: '教室B', type: '多媒体教室', capacity: 50, projector: 2, multimedia: 1, specialPermission: false, allowedUsers: [1, 2], imageUrl: '/images/classroomB.png' }
      ],
      dialogVisible: false,
      dialogTitle: '',
      currentClassroom: {
        id: null,
        name: '',
        type: '',
        capacity: 0,
        projector: 0,
        multimedia: 0,
        specialPermission: false,
        allowedUsers: [],
        imageUrl: ''
      },
      permissionDialogVisible: false,
      currentPermission: {
        allowedUsers: []
      },
      imageDialogVisible: false,
      currentImage: '',
      users: [
        { id: 1, name: '学生A' },
        { id: 2, name: '学生B' },
        { id: 3, name: '老师A' },
        { id: 4, name: '老师B' }
      ],
      allTeachersSelected: false,
      allStudentsSelected: false,
      searchQuery: '',
      filteredUsers: []
    }
  },
  methods: {
    handleAdd() {
      this.dialogTitle = '添加教室'
      this.currentClassroom = { id: null, name: '', type: '', capacity: 0, projector: 0, multimedia: 0, specialPermission: false, allowedUsers: [], imageUrl: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑教室'
      this.currentClassroom = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定删除该教室吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.classrooms = this.classrooms.filter(classroom => classroom !== row)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSave() {
      if (this.dialogTitle === '添加教室') {
        this.currentClassroom.id = this.classrooms.length + 1
        this.classrooms.push({ ...this.currentClassroom })
      } else {
        const index = this.classrooms.findIndex(classroom => classroom.id === this.currentClassroom.id)
        if (index !== -1) {
          this.classrooms.splice(index, 1, { ...this.currentClassroom })
        }
      }
      this.dialogVisible = false
      this.$message({
        type: 'success',
        message: '保存成功!'
      })
    },
    handleSetPermission(row) {
      this.currentPermission = { ...row }
      this.allTeachersSelected = this.currentPermission.allowedUsers.length === this.users.filter(user => user.name.includes('老师')).length
      this.allStudentsSelected = this.currentPermission.allowedUsers.length === this.users.filter(user => user.name.includes('学生')).length
      this.filteredUsers = this.users
      this.permissionDialogVisible = true
    },
    handleSavePermission() {
      const index = this.classrooms.findIndex(classroom => classroom.id === this.currentPermission.id)
      if (index !== -1) {
        this.classrooms.splice(index, 1, { ...this.currentPermission })
      }
      this.permissionDialogVisible = false
      this.$message({
        type: 'success',
        message: '权限设置成功!'
      })
    },
    handleUploadSuccess(response, file) {
      this.currentClassroom.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt500K = file.size / 1024 / 1024 < 0.5

      if (!isJPG && !isPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt500K) {
        this.$message.error('上传图片大小不能超过 500KB!')
      }
      return (isJPG || isPNG) && isLt500K
    },
    handleViewImage(row) {
      this.currentImage = row.imageUrl
      this.imageDialogVisible = true
    },
    handleAllTeachersChange() {
      if (this.allTeachersSelected) {
        const teacherNames = this.users.filter(user => user.name.includes('老师')).map(user => user.name)
        this.currentPermission.allowedUsers = this.currentPermission.allowedUsers.filter(userName => !this.users.some(user => user.name === userName && user.name.includes('老师')))
        this.currentPermission.allowedUsers = [...this.currentPermission.allowedUsers, ...teacherNames]
      } else {
        this.currentPermission.allowedUsers = this.currentPermission.allowedUsers.filter(userName => !this.users.some(user => user.name === userName && user.name.includes('老师')))
      }
    },
    handleAllStudentsChange() {
      if (this.allStudentsSelected) {
        const studentNames = this.users.filter(user => user.name.includes('学生')).map(user => user.name)
        this.currentPermission.allowedUsers = this.currentPermission.allowedUsers.filter(userName => !this.users.some(user => user.name === userName && user.name.includes('学生')))
        this.currentPermission.allowedUsers = [...this.currentPermission.allowedUsers, ...studentNames]
      } else {
        this.currentPermission.allowedUsers = this.currentPermission.allowedUsers.filter(userName => !this.users.some(user => user.name === userName && user.name.includes('学生')))
      }
    },
    searchUser() {
      const query = this.searchQuery.trim().toLowerCase()
      this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(query))
      if (this.filteredUsers.length === 1) {
        const user = this.filteredUsers[0]
        this.searchQuery = user.name
      } else {
        this.filteredUsers = []
      }
    },
    addUser() {
      this.filteredUsers.forEach(user => {
        if (!this.currentPermission.allowedUsers.includes(user.name)) {
          this.currentPermission.allowedUsers.push(user.name)
        }
      })
      this.filteredUsers = []
      this.searchQuery = ''
    },
    getUserTypeById(userId) {
      const user = this.users.find(user => user.id === userId)
      if (user) {
        return user.name.includes('老师') ? '老师' : '学生'
      }
      return null
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
</style>
