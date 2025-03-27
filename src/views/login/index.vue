<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <img src="@/assets/login/admin.jpg" alt="admin image" />
      </div>
      <div class="login-right">
        <div class="login-box">
          <h2 class="login-title">Admin system</h2>
          <p class="login-subtitle">login page</p>

          <el-form ref="loginForm" :model="loginForm">
            <el-form-item prop="email" style="width: 450px;">
              <el-input v-model="loginForm.email" placeholder="Email" prefix-icon="el-icon-message" />
            </el-form-item>

            <el-form-item prop="code">
              <el-input
                v-model="loginForm.code"
                placeholder="Verification Code"
                prefix-icon="el-icon-lock"
                style="width: 325px; margin-right: 10px;"
              />
              <el-button :disabled="codeButtonDisabled" @click="handleGetCode">
                {{ codeButtonText }}
              </el-button>
            </el-form-item>

            <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 300px; margin-top: 20px; margin-left: 70px;">
              Login
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {startVerify, verifyCode, getAdmins} from '@/api/login'

export default {
  name: 'Login',
  data() {
    return {
      admin: [],
      loginForm: {
        email: '',
        code: ''
      },
      redirect: undefined,
      otherQuery: {},
      loading: false,
      codeButtonText: 'Send code',
      codeButtonDisabled: false,
      codeCountdown: 60,
      pagination: {
      currentPage: 1,
      pageSize: 100
      }
    }
  },
  created() {
    this.fetchAdmins()
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  methods: {
    fetchAdmins() {
      getAdmins({
        page: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
        .then(response => {
          this.admin = response.data.data.admins
        })
        .catch(error => {
          console.error('Error fetching admins:', error)
        })
    },
    handleGetCode() {
      if (!this.loginForm.email) {
        this.$message.warning('Please enter your email address')
        return
      }

      const adminExists = this.admin.some(admin => admin.email === this.loginForm.email)

      if (!adminExists) {
        this.$message.warning('This email is not registered as an admin. Please enter a valid email address.')
        return
      }

      this.codeButtonDisabled = true
      this.codeButtonText = 'Sending...'

      startVerify(this.loginForm.email)
        .then(() => {
          this.$message.success('The verification code has been sent, please check your email')
          this.startCountdown()
        })
        .catch(() => {
          this.codeButtonDisabled = false
          this.codeButtonText = 'Send code'
          this.$message.error('Failed to send verification code')
        })
    },
    startCountdown() {
      const timer = setInterval(() => {
        this.codeCountdown--
        this.codeButtonText = `${this.codeCountdown}s`
        if (this.codeCountdown <= 0) {
          clearInterval(timer)
          this.codeButtonDisabled = false
          this.codeButtonText = 'try again'
          this.codeCountdown = 60
        }
      }, 1000)
    },
    handleLogin() {
      const { code, email } = this.loginForm;

      if (!email && !code) {
        this.$message.warning('Please enter login information');
        return;
      }
      if (!email) {
        this.$message.warning('Email not entered');
        return;
      }
      if (!code) {
        this.$message.warning('The verification code is not entered');
        return;
      }
      this.$store.dispatch('user/login',this.loginForm).then(()=>{

        this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
      }).catch(error  => {
        console.error('Login failed:', error)
       console.log(1123);

            this.$message.error('The verification code is incorrect')
          })

    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom right, #5b8eff, #a7c3f8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  display: flex;
  width: 1100px;
  height: 600px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-left {
  flex: 1.5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-left img {
  width: 80%;
  max-width: 400px;
}

.login-right {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 100%;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #2d3a4b;
  margin-bottom: 10px;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #888;
  text-align: center;
  margin-bottom: 30px;
}

.login-left img {
  width: 95%;
  max-width: 500px;
}
</style>
