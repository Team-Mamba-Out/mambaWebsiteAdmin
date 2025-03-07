<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.Order_Id" placeholder="Order_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.Room_Id" placeholder="Room_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.User_Id" placeholder="User_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="filterList"
      fit                                                                                   
      style="width: 1390px;"
      @sort-change="sortChange"
    >
      <el-table-column label="Order Id" prop="id" align="center" width="110">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Record Time" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.record_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Room Id" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.room_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Room Type" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.room_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="User Id" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.user_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Start Time" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.start_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="End Time" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.end_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" width="120">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Order Id" prop="id" label-width="120px">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item label="Record Time" prop="record_time" label-width="120px">
          <el-date-picker v-model="temp.record_time" type="datetime" placeholder="Please pick a time" />
        </el-form-item>
        <el-form-item label="User Id" prop="user_id" label-width="120px">
          <el-input v-model="temp.user_id" />
        </el-form-item>
        <el-form-item label="Room Id" prop="room_id" label-width="120px">
          <el-input v-model="temp.room_id" />
        </el-form-item>
        <el-form-item label="Room Type" prop="room_type" label-width="120px">
          <el-input v-model="temp.room_type" />
        </el-form-item>
        <el-form-item label="Start Time" prop="start_time" label-width="120px">
          <el-date-picker v-model="temp.start_time" type="datetime" placeholder="Please pick a time" />
        </el-form-item>
        <el-form-item label="End Time" prop="end_time" label-width="120px">
          <el-date-picker v-model="temp.end_time" type="datetime" placeholder="Please pick a time" />
        </el-form-item>
        <el-form-item label="Status" label-width="120px">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createArticle } from '@/api/article'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'warning',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    statusText(status) {
      const textMap = {
        published: 'completed',
        deleted: 'canceled',
        draft: 'upcoming'
      }
      return textMap[status]
    }
  },
  data() {
    return {
      total: 1,
      listQuery: {
        Order_Id: '',
        Room_Id: '',
        User_Id: '',
        page: 1,
        limit: 10
      },
      list: [
        { id: '1001', record_time: '2025-03-01 07:00', room_id: 'R001', room_type: 'classroom', user_id: 'U001', start_time: '2025-03-01 09:00', end_time: '2025-03-01 12:00', status: 'published' },
        { id: '1002', record_time: '2025-03-02 10:00', room_id: 'R002', room_type: 'conference room', user_id: 'U002', start_time: '2025-03-02 14:00', end_time: '2025-03-02 16:00', status: 'draft' },
        { id: '1003', record_time: '2025-03-03 8:30', room_id: 'R003', room_type: 'conference room', user_id: 'U003', start_time: '2025-03-03 10:30', end_time: '2025-03-03 13:30', status: 'deleted' },
        { id: '1001', record_time: '2025-03-01 07:00', room_id: 'R001', room_type: 'classroom', user_id: 'U001', start_time: '2025-03-01 09:00', end_time: '2025-03-01 12:00', status: 'published' },
        { id: '1002', record_time: '2025-03-02 10:00', room_id: 'R002', room_type: 'conference room', user_id: 'U002', start_time: '2025-03-02 14:00', end_time: '2025-03-02 16:00', status: 'draft' },
        { id: '1003', record_time: '2025-03-03 8:30', room_id: 'R003', room_type: 'conference room', user_id: 'U003', start_time: '2025-03-03 10:30', end_time: '2025-03-03 13:30', status: 'deleted' },
        { id: '1003', record_time: '2025-03-03 8:30', room_id: 'R003', room_type: 'conference room', user_id: 'U003', start_time: '2025-03-03 10:30', end_time: '2025-03-03 13:30', status: 'deleted' },
        { id: '1004', record_time: '2025-03-05 10:00', room_id: 'R004', room_type: 'classroom', user_id: 'U004', start_time: '2025-03-05 14:00', end_time: '2025-03-05 16:00', status: 'draft' }

      ],
      filterList: [],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        record_time: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        id: '',
        user_id: '',
        room_id: '',
        room_type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        id: [{ required: true, message: 'id is required', trigger: 'blur' }],
        record_time: [{ type: 'date', required: true, message: 'Record time is required', trigger: 'change' }],
        user_id: [{ required: true, message: 'User id is required', trigger: 'blur' }],
        room_id: [{ required: true, message: 'Room id is required', trigger: 'blur' }],
        room_type: [{ required: true, message: 'Room type is required', trigger: 'blur' }],
        start_time: [{ type: 'date', required: true, message: 'Start time is required', trigger: 'change' }],
        end_time: [{ type: 'date', required: true, message: 'End time is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.filterList = this.list
    this.getList
  },
  methods: {
    getList() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      this.filterList = this.list.slice(start, end)
      this.total = this.list.length
    },
    handleFilter() {
      this.filterList = this.list.filter(item =>
        (!this.listQuery.Order_Id || item.id === this.listQuery.Order_Id) &&
        (!this.listQuery.Room_Id || item.room_id === this.listQuery.Room_Id) &&
        (!this.listQuery.User_Id || item.user_id === this.listQuery.User_Id)
      )
    },
    resetTemp() {
      this.temp = {
        record_time: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        id: '',
        user_id: '',
        room_id: '',
        room_type: '',
        status: 'published'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.handleFilter()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
      this.handleFilter()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['Order Id', 'Record Time', 'Room Id', 'Room Type', 'User Id', 'Start Time', 'End Time', 'Status']
        const filterVal = ['id', 'record_time', 'room_id', 'room_type', 'user_id', 'start_time', 'end_time', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'record_time' || j === 'start_time' || j === 'end_time') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
  }
}
</script>
