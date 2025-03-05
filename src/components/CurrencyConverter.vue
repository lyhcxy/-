<template>
  <div class="app-container">
    <!-- 标题栏 -->
    <div class="title-bar">
      <div class="title">
        <img src="../assets/logo.png" class="app-logo" alt="logo"/>
        <span>秋风的小工具</span>
      </div>
      <div class="window-controls">
        <div class="window-control minimize" @click="handleMinimize">
          <span>─</span>
        </div>
        <div class="window-control close" @click="handleClose">
          <span>×</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <el-card class="converter-card">
        <template #header>
          <div class="card-header">
            <h3>万事达汇率计算器

            </h3>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              :disabled-date="disableFutureDate"
              @change="handleDateChange"
              class="date-picker"
            />
          </div>
        </template>
        
        <div class="conversion-grid">
          <div v-for="(form, index) in conversionForms" :key="index" class="conversion-form">
            <el-form>
              <el-form-item label="金额">
                <el-input-number 
                  v-model="form.amount" 
                  :min="0"
                  :precision="2"
                  :step="1"
                  class="full-width-input"
                />
              </el-form-item>

              <el-form-item label="从">
                <el-select v-model="form.fromCurrency" class="full-width-input">
                  <el-option 
                    v-for="currency in currencies" 
                    :key="currency.value" 
                    :label="currency.label" 
                    :value="currency.value" 
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="到">
                <el-select v-model="form.toCurrency" class="full-width-input">
                  <el-option 
                    v-for="currency in currencies" 
                    :key="currency.value" 
                    :label="currency.label" 
                    :value="currency.value" 
                  />
                </el-select>
              </el-form-item>

              <el-form-item v-if="form.result">
                <div class="result-display">
                  <div class="result-line">
                    结果: {{ form.result.amount }}
                    <span class="fee-info" v-if="fee > 0">(含手续费{{ fee }}%)</span>
                  </div>
                  <div class="result-line">汇率: {{ form.result.rate }}</div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div class="action-buttons">
          <el-form-item label="手续费率">
            <el-input-number 
              v-model="fee" 
              :min="0"
              :max="100"
              :precision="2"
              :step="0.01"
              style="width: 150px"
            >
              <template #suffix>%</template>
            </el-input-number>
          </el-form-item>

          <div class="button-group">
            <el-button 
              type="primary" 
              plain
              @click="refreshRates" 
              :loading="refreshing"
              :disabled="loading"
            >
              刷新汇率
            </el-button>
            <el-button 
              type="primary" 
              @click="convertAll" 
              :loading="loading"
              :disabled="refreshing"
            >
              全部转换
            </el-button>
          </div>
        </div>
      </el-card>
      
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <h3>历史记录</h3>
          </div>
        </template>
        
        <div class="history-content">
          <el-table :data="historyRecords">
            <el-table-column 
              prop="date" 
              label="日期" 
              width="85"
              :formatter="formatDate"
            />
            <el-table-column prop="fromCurrency" label="原币种" width="85" />
            <el-table-column prop="toCurrency" label="目标币种" width="85" />
            <el-table-column 
              prop="rate" 
              label="汇率" 
              width="95"
              :formatter="formatTableRate"
            />
            <el-table-column label="操作" min-width="75">
              <template #default="scope">
                <el-button 
                  type="text" 
                  @click="useHistoryRate(scope.row)"
                >
                  使用此汇率
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="update-info" v-if="lastUpdateTime">
            最后更新时间: {{ formatUpdateTime(lastUpdateTime) }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import db from '../utils/db'
import { ipcRenderer } from 'electron'

export default {
  name: 'CurrencyConverter',
  data() {
    return {
      selectedDate: new Date(),
      fee: 0,
      loading: false,
      refreshing: false,
      currencies: [
        { label: '人民币 CNY', value: 'CNY' },
        { label: '美元 USD', value: 'USD' },
        { label: '卢布 RUB', value: 'RUB' },
        { label: '白俄罗斯卢布 BYN', value: 'BYN' },
        { label: '欧元 EUR', value: 'EUR' },
        { label: '日元 JPY', value: 'JPY' },
        { label: '英镑 GBP', value: 'GBP' },
        { label: '港币 HKD', value: 'HKD' },
        { label: '澳元 AUD', value: 'AUD' },
        { label: '加元 CAD', value: 'CAD' },
        { label: '新西兰元 NZD', value: 'NZD' },
        { label: '新加坡元 SGD', value: 'SGD' },
        { label: '瑞士法郎 CHF', value: 'CHF' }
      ],
      conversionForms: [
        { amount: 100, fromCurrency: 'CNY', toCurrency: 'USD', result: null },
        { amount: 100, fromCurrency: 'CNY', toCurrency: 'EUR', result: null },
        { amount: 100, fromCurrency: 'CNY', toCurrency: 'RUB', result: null },
        { amount: 100, fromCurrency: 'CNY', toCurrency: 'BYN', result: null }
      ],
      historyRecords: [],
      lastUpdateTime: null
    }
  },
  methods: {
    disableFutureDate(date) {
      return date > new Date()
    },
    async handleDateChange() {
      await this.loadHistoryRates()
    },
    async loadHistoryRates() {
      try {
        const records = await db.getHistoryRates(this.selectedDate)
        this.historyRecords = records
        await this.updateLastUpdateTime()
      } catch (error) {
        console.error('加载历史记录失败:', error)
        ElMessage.error('加载历史记录失败')
      }
    },
    async convertAll() {
      this.loading = true
      try {
        for (const form of this.conversionForms) {
          const historyRate = await db.findRate(
            this.selectedDate,
            form.fromCurrency,
            form.toCurrency
          )

          if (historyRate) {
            form.result = this.calculateWithRate(form.amount, historyRate)
          } else {
            await this.convertCurrency(form)
          }
        }
      } catch (error) {
        ElMessage.error('转换失败：' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async convertCurrency(form, forceRefresh = false) {
      if (!forceRefresh) {
        const historyRate = await db.findRate(
          this.selectedDate,
          form.fromCurrency,
          form.toCurrency
        )
        if (historyRate) {
          form.result = this.calculateWithRate(form.amount, historyRate)
          return
        }
      }

      try {
        const response = await axios({
          method: 'get',
          url: process.env.VUE_APP_API_BASE_URL,
          params: {
            fxDate: this.selectedDate.toISOString().split('T')[0],
            transCurr: form.fromCurrency,
            crdhldBillCurr: form.toCurrency,
            bankFee: this.fee,
            transAmt: form.amount
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Referer': 'https://www.mastercard.com.cn/zh-cn/personal/get-support/convert-currency.html',
            'Origin': 'https://www.mastercard.com.cn',
            'Host': 'www.mastercard.com.cn'
          },
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 300
          }
        })

        if (!response.data || !response.data.data) {
          throw new Error('API 返回数据格式错误')
        }

        const data = response.data.data
        
        await db.saveRate({
          date: this.selectedDate,
          fromCurrency: form.fromCurrency,
          toCurrency: form.toCurrency,
          rate: data.conversionRate
        })

        form.result = {
          amount: `${data.crdhldBillAmt.toFixed(2)} ${form.toCurrency}`,
          rate: this.formatRate(data.conversionRate)
        }
      } catch (error) {
        console.error('API Error:', error)
        throw new Error(`转换失败: ${error.message || '网络错误'}`)
      }
    },
    calculateWithRate(amount, rate) {
      const convertedAmount = amount * rate * (1 + this.fee / 100)
      return {
        amount: `${convertedAmount.toFixed(2)}`,
        rate: this.formatRate(rate)
      }
    },
    formatRate(rate) {
      const rateStr = rate.toString()
      
      if (rateStr.length > 8) {
        return Number(rate).toFixed(6)
      }
      
      return rateStr
    },
    useHistoryRate(record) {
      const form = this.conversionForms.find(
        f => f.fromCurrency === record.fromCurrency && 
             f.toCurrency === record.toCurrency
      )
      if (form) {
        form.result = this.calculateWithRate(form.amount, record.rate)
      }
    },
    handleMinimize() {
      ipcRenderer.send('window-min')
    },
    handleClose() {
      ipcRenderer.send('window-close')
    },
    async saveCurrentSettings() {
      const formsToSave = this.conversionForms.map(form => ({
        amount: form.amount,
        fromCurrency: form.fromCurrency,
        toCurrency: form.toCurrency
      }))
      await db.saveSettings(formsToSave, this.selectedDate)
    },
    async loadSavedSettings() {
      const settings = await db.loadSettings()
      if (settings) {
        this.conversionForms = settings.forms.map(form => ({
          ...form,
          result: null
        }))
        
        const savedDate = new Date(settings.lastDate)
        if (savedDate <= new Date()) {
          this.selectedDate = savedDate
        }
      }
    },
    formatDate(row) {
      const date = new Date(row.date);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    },
    async refreshRates() {
      this.refreshing = true
      try {
        for (const form of this.conversionForms) {
          await this.convertCurrency(form, true)
        }
        await this.updateLastUpdateTime()
        ElMessage.success('汇率已更新')
      } catch (error) {
        ElMessage.error('更新汇率失败：' + (error.message || '未知错误'))
      } finally {
        this.refreshing = false
      }
    },
    async updateLastUpdateTime() {
      this.lastUpdateTime = await db.getLastUpdateTime(this.selectedDate)
    },
    formatUpdateTime(isoString) {
      const date = new Date(isoString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    formatTableRate(row) {
      return this.formatRate(row.rate)
    }
  },
  async mounted() {
    await this.loadSavedSettings()
    await this.loadHistoryRates()
  },
  watch: {
    conversionForms: {
      deep: true,
      handler() {
        this.saveCurrentSettings()
      }
    },
    selectedDate() {
      this.saveCurrentSettings()
    }
  }
}
</script>

<style scoped>
.app-container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  background: #fff;
}

.title-bar {
  -webkit-app-region: drag;
  height: 32px;
  background: linear-gradient(to right, #409EFF, #67C23A);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 13px;
  margin-left: 8px;
}

.app-logo {
  width: 18px;
  height: 18px;
}

.window-controls {
  -webkit-app-region: no-drag;
  display: flex;
  height: 100%;
}

.window-control {
  width: 42px;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,0.9);
  transition: background 0.2s;
  cursor: pointer;
}

.window-control:hover {
  background: rgba(255,255,255,0.12);
}

.window-control.close:hover {
  background: #ff5f57;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.converter-card, .history-card {
  height: 100%;
  border-radius: 0;
  border: none;
  display: flex;
  flex-direction: column;
  box-shadow: none !important;
}

.converter-card {
  flex: 1 1 55%;
}

.history-card {
  flex: 0 0 calc(45%);
  border-left: 1px solid #ebeef5;
}

:deep(.el-card__header) {
  padding: 0 12px !important;
  height: 40px !important;
  border-bottom: 1px solid #ebeef5 !important;
  background: #f8f9fa;
}

:deep(.el-card__body) {
  flex: 1;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conversion-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 1px;
  background: #ebeef5;
}

.conversion-form {
  padding: 12px 0;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  width: 60px !important;
  text-align: left;
  padding-right: 8px;
  line-height: 32px !important;
  margin-bottom: 0;
  padding-left: 10px;
}

.history-card :deep(.el-table) {
  width: 100% !important;
}

.history-card :deep(.el-table td),
.history-card :deep(.el-table th) {
  padding: 4px 0;
}

.history-card :deep(.el-button--text) {
  padding: 0;
}

.history-card :deep(.el-table__row) {
  height: 32px;
}

.history-card :deep(.el-table__header th) {
  background: #f8f9fa;
  height: 32px;
}

.history-card :deep(.el-button--text) {
  color: #409EFF;
  font-size: 12px;
}

.history-card :deep(.el-table .cell) {
  text-align: center;
}

.action-buttons {
  height: 46px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  background: #f8f9fa;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.card-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  flex: 1;
  text-align: center;
}

/* 日期选择器样式 */
.date-picker {
  width: 130px;
}

.converter-card .card-header h3 {
  margin-right: 130px; /* 为日期选择器预留空间，保持标题居中 */
}

/* 历史记录标题居中 */
.history-card .card-header h3 {
  text-align: center;
}

/* 移除所有滚动条 */
:deep(*) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

:deep(*::-webkit-scrollbar) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 移除表格边框 */
:deep(.el-table), :deep(.el-table__inner-wrapper) {
  border: none !important;
}

:deep(.el-table::before) {
  display: none;
}

:deep(.el-table--border) {
  border: none !important;
}

/* 统一输入框宽度 */
.full-width-input {
  width: 140px !important;
}

/* 表单项对齐 */
.conversion-form :deep(.el-form-item__content) {
  margin-left: 60px !important;
  display: flex;
  align-items: center;
}

/* 结果显示样式 */
.result-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #409EFF;
  font-size: 13px;
  margin-top: 4px;
  margin-left: -50px;  /* 调整左边距使其与"从"对齐 */
}

.result-line {
  line-height: 1.4;
  display: flex;
  align-items: center;
  min-height: 20px;
}

.fee-info {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
  font-weight: normal;
}

/* 确保所有输入框高度一致 */
.conversion-form :deep(.el-input-number),
.conversion-form :deep(.el-select) {
  line-height: 32px;
  height: 32px;
}

.conversion-form :deep(.el-input-number .el-input__wrapper),
.conversion-form :deep(.el-select .el-input__wrapper) {
  height: 32px;
}

/* 调整表单项标签对齐 */
:deep(.el-form-item__label) {
  width: 60px !important;
  text-align: left;
  padding-right: 8px;
  line-height: 32px !important;
  margin-bottom: 0;
  padding-left: 10px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 12px;
  height: 32px;  /* 确保与手续费输入框同高 */
}

/* 手续费表单项样式 */
.action-buttons :deep(.el-form-item) {
  margin-bottom: 0 !important;
  height: 32px;
  display: flex;
  align-items: center;
}

/* 历史记录内容区域 */
.history-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 更新时间信息 */
.update-info {
  padding: 0 12px;  /* 调整内边距与左侧一致 */
  height: 46px;     /* 与左侧操作按钮区域等高 */
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 12px;
}

/* 调整历史记录卡片布局 */
.history-card {
  display: flex;
  flex-direction: column;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 调整表格样式 */
.history-card :deep(.el-table) {
  flex: 1;
  overflow: auto;
}

/* 确保表格行高一致 */
.history-card :deep(.el-table__row) {
  height: 32px;
}

/* 调整表格头部样式 */
.history-card :deep(.el-table__header-wrapper) {
  background: #f8f9fa;
}
</style>