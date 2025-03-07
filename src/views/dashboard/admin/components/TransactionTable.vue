<template>
  <el-table :data="list" style="width: 100%;padding-top: 5px;">
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
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger',
        warning: 'warning'
      }
      return statusMap[status]
    },
    statusText(status) {
      const textMap = {
        success: 'completed',
        pending: 'canceled',
        warning: 'upcoming'
      }
      return textMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: [
      {
          order_no: '1',
          room_id: 'R001',
          user_id: 'U001',
          start_time: '2025-03-01 09:00',
          end_time: '2025-03-01 12:00',
          status: 'success'
        },
        {
          order_no: '2',
          room_id: 'R002',
          user_id: 'U002',
          start_time: '2025-03-02 14:00',
          end_time: '2025-03-02 16:00',
          status: 'success'
        },
        {
          order_no: '3',
          room_id: 'R003',
          user_id: 'U003',
          start_time: '2025-03-03 10:30',
          end_time: '2025-03-03 13:30',
          status: 'pending'
        },
        {
          order_no: '4',
          room_id: 'R004',
          user_id: 'U004',
          start_time: '2025-03-04 08:00',
          end_time: '2025-03-04 11:00',
          status: 'success'
        },
        {
          order_no: '5',
          room_id: 'R005',
          user_id: 'U005',
          start_time: '2025-03-05 13:00',
          end_time: '2025-03-05 15:00',
          status: 'pending'
        },
        {
          order_no: '6',
          room_id: 'R006',
          user_id: 'U006',
          start_time: '2025-03-06 11:00',
          end_time: '2025-03-06 14:00',
          status: 'warning'
        },
        {
          order_no: '7',
          room_id: 'R007',
          user_id: 'U007',
          start_time: '2025-03-06 11:00',
          end_time: '2025-03-06 14:00',
          status: 'pending'
        },
      ]
    }
  },
}
</script>
