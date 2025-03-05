import Dexie from 'dexie'

class CurrencyDB extends Dexie {
  constructor() {
    super('CurrencyConverterDB')
    
    this.version(3).stores({  // 升级到版本3
      rates: '++id, date, fromCurrency, toCurrency, rate, updateTime',
      settings: 'id, forms, lastDate'  // 添加新的表
    })
  }

  async saveRate(rateData) {
    const { date, fromCurrency, toCurrency, rate } = rateData
    const dateStr = new Date(date).toISOString().split('T')[0]
    const updateTime = new Date().toISOString()
    
    // 检查是否已存在相同记录
    const existing = await this.rates
      .where({
        date: dateStr,
        fromCurrency,
        toCurrency
      })
      .first()

    if (existing) {
      // 更新现有记录
      await this.rates.update(existing.id, { rate, updateTime })
    } else {
      // 添加新记录
      await this.rates.add({
        date: dateStr,
        fromCurrency,
        toCurrency,
        rate,
        updateTime
      })
    }
  }

  async getHistoryRates(date) {
    const dateStr = new Date(date).toISOString().split('T')[0]
    return await this.rates
      .where('date')
      .equals(dateStr)
      .toArray()
  }

  async findRate(date, fromCurrency, toCurrency) {
    const dateStr = new Date(date).toISOString().split('T')[0]
    const record = await this.rates
      .where({
        date: dateStr,
        fromCurrency,
        toCurrency
      })
      .first()
    
    return record?.rate
  }

  // 添加获取最后更新时间的方法
  async getLastUpdateTime(date) {
    const dateStr = new Date(date).toISOString().split('T')[0]
    const records = await this.rates
      .where('date')
      .equals(dateStr)
      .toArray()
    
    if (records.length === 0) return null
    
    // 获取最新的更新时间
    return records.reduce((latest, current) => {
      return latest > current.updateTime ? latest : current.updateTime
    }, records[0].updateTime)
  }

  // 添加设置相关的方法
  async saveSettings(forms, lastDate) {
    await this.settings.put({
      id: 1,  // 使用固定 id
      forms,
      lastDate
    })
  }

  async loadSettings() {
    const settings = await this.settings.get(1)
    return settings || null
  }
}

// 只创建一个实例
const db = new CurrencyDB()
export default db 