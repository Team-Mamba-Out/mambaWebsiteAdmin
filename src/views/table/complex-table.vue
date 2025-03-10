<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.Order_Id" placeholder="Order_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.Room_Id" placeholder="Room_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.User_Id" placeholder="User_Id" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
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
          <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
            {{ row.statu }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchOrders, deleteOrder } from '@/api/order'
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
        'completed': 'success',
        'incompleted': 'warning'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      total: 100,
      listQuery: {
        Order_Id: '',
        Room_Id: '',
        User_Id: '',
        page: 1,
        limit: 10
      },
      list: [],
      filterList: [],
      statusOptions: ['completed', 'incompleted'],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const response = await fetchOrders({
          id: this.listQuery.Order_Id || null,
          roomId: this.listQuery.Room_Id || null,
          userId: this.listQuery.User_Id || null,
          startTime: null,
          endTime: null,
          hasCheckedIn: null,
          isCancelled: null,
          page: this.listQuery.page,
          size: this.listQuery.limit
        })
        this.list = response.data.data.records.filter(order => !order.isCancelled).map(order => ({ ...order, status: order.hasCheckedIn ? 'completed' : 'incompleted' })).sort((a, b) => a.id - b.id)
        this.total = this.list.length
        this.filterList = this.list
        if (this.listQuery.page > Math.ceil(this.total / this.listQuery.limit)) {
          this.listQuery.page = 1
        }
        const start = (this.listQuery.page - 1) * this.listQuery.limit
        const end = start + this.listQuery.limit
        this.filterList = this.list.slice(start, end)
        this.total = this.list.length
      } catch (error) {
        console.error('The record failed', error)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      if (!this.listQuery.Order_Id && !this.listQuery.Room_Id && !this.listQuery.User_Id) {
        this.total = this.list.length
        this.getList()
        return
      }
      this.filterList = this.list.filter(item =>
        (!this.listQuery.Order_Id || item.id === this.listQuery.Order_Id) &&
        (!this.listQuery.Room_Id || item.room_id === this.listQuery.Room_Id) &&
        (!this.listQuery.User_Id || item.user_id === this.listQuery.User_Id)
      )
      this.total = this.filterList.length
    },
    async handleDelete(row) {
      try {
        await this.$confirm('Are you sure to delete this order?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        })

        await deleteOrder(row.id)

        await this.getList()

        this.$notify({
          title: 'Success',
          message: 'Order Deleted Successfully',
          type: 'success',
          duration: 2000
        })
      } catch (error) {
        console.error('Error deleting order:', error)
        this.$notify.error({
          title: 'Error',
          message: 'Failed to delete order'
        })
      }
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['Order Id', 'Record Time', 'Room Id', 'Room Type', 'User Id', 'Start Time', 'End Time', 'Status']
        const filterVal = ['id', 'record_time', 'room_id', 'room_type', 'user_id', 'start_time', 'end_time', 'status']
        const data = this.formatJson(filterVal, this.filterList)
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
    }
  }
}
</script>
