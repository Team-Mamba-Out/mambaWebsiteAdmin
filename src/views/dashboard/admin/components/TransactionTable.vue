<template>
  <el-table :data="list" style="width: 100%;padding-top: 5px;" :row-style="{ height:'51px'}">
    <el-table-column label="Order Id" width="90" align="center">
      <template slot-scope="scope">
        {{ scope.row.order_no | orderNoFilter }}
      </template>
    </el-table-column>
    <el-table-column label="Room Id" width="90" align="center">
      <template slot-scope="scope">
        {{ scope.row.room_id }}
      </template>
    </el-table-column>
    <el-table-column label="User Id" width="90" align="center">
      <template slot-scope="scope">
        {{ scope.row.user_id }}
      </template>
    </el-table-column>
    <el-table-column label="Start Time" width="150" align="center">
      <template slot-scope="scope">
        {{ scope.row.start_time }}
      </template>
    </el-table-column>
    <el-table-column label="End Time" width="150" align="center">
      <template slot-scope="scope">
        {{ scope.row.end_time }}
      </template>
    </el-table-column>
    <el-table-column label="State" width="90" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.status | statusFilter">
          {{ row.status | statusText }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { fetchOrders } from '@/api/order'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        'completed': 'success',
        'incompleted': 'warning'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.getRecentOrder()
  },
  methods: {
    async getRecentOrders() {
      try {
        const response = await fetchOrders({ page: 1, size: 20 })
        const records = response.data.data.records
        const validOrders = records.filter(order => !order.isCancelled)
        this.list = validOrders.slice(0, 7).map(order => ({ ...order, status: order.hasCheckedIn ? 'completed' : 'incompleted' }))
      } catch (error) {
        console.error('Failed to fetch recent orders:', error)
      }
    }
  }
}
</script>
