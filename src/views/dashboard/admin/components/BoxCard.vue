<template>
  <el-card class="box-card-component" style="margin-left:8px;">
    <div slot="header" class="box-card-header">
      <img src="https://wpimg.wallstcn.com/e7d23d71-cf19-4b90-a1cc-f56af8c0903d.png">
    </div>
    <div style="position:relative;">
      <pan-thumb :image="avatar" class="panThumb" />
      <mallki class-name="mallki-text" text="Administrator" />
      <div style="padding-top:35px;" class="progress-item">
        <span>Name: {{ userInfo.name || 'N/A' }}</span>
      </div>
      <div class="progress-item">
        <span>Uid: {{ userInfo.uid || 'N/A' }}</span>

      </div>
      <div class="progress-item">
        <span>Email: {{ userInfo.email || 'N/A' }}</span>

      </div>
      <div class="progress-item">
        <span>Phone: {{ userInfo.phone || 'N/A' }}</span>

      </div>
    </div>
  </el-card>
</template>

<script>
import { fetchAdmins } from '@/api/admin'
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import Mallki from '@/components/TextHoverEffect/Mallki'

export default {
  components: { PanThumb, Mallki },

  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      userInfo: {}
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getAdminInfo()
  },

  methods: {
    async getAdminInfo() {
      try {
        const response = await fetchAdmins()
        if (response.data && response.data.data.length > 0) {
          this.userInfo = response.data.data[0]
          console.warn('No admin data found.')
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      }
    }
  }
}
</script>

<style lang="scss" >
.box-card-component{
  .el-card__header {
    padding: 0px!important;
  }
}
</style>
<style lang="scss" scoped>
.box-card-component {
  .box-card-header {
    position: relative;
    height: 220px;
    img {
      width: 100%;
      height: 100%;
      transition: all 0.2s linear;
      &:hover {
        transform: scale(1.1, 1.1);
        filter: contrast(130%);
      }
    }
  }
  .mallki-text {
    position: absolute;
    top: 0px;
    right: 0px;
    font-size: 20px;
    font-weight: bold;
  }
  .panThumb {
    z-index: 100;
    height: 70px!important;
    width: 70px!important;
    position: absolute!important;
    top: -45px;
    left: 0px;
    border: 5px solid #ffffff;
    background-color: #fff;
    margin: auto;
    box-shadow: none!important;
    ::v-deep .pan-info {
      box-shadow: none!important;
    }
  }
  .progress-item {
    margin-bottom: 10px;
    margin-left: 15px;
    font-size: 15px;
    font-weight: bold;
  }
  @media only screen and (max-width: 1510px){
    .mallki-text{
      display: none;
    }
  }
}
</style>
