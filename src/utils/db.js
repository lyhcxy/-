import Dexie from 'dexie'

class CurrencyDB extends Dexie {
  constructor() {
    super('CurrencyConverterDB')
    
    this.version(3).stores({  // �������汾3
      rates: '++id, date, fromCurrency, toCurrency, rate, updateTime',
      settings: 'id, forms, lastDate'  // ����µı�
    })
  }

  async saveRate(rateData) {
    const { date, fromCurrency, toCurrency, rate } = rateData
    const dateStr = new Date(date).toISOString().split('T')[0]
    const updateTime = new Date().toISOString()
    
    // ����Ƿ��Ѵ�����ͬ��¼
    const existing = await this.rates
      .where({
        date: dateStr,
        fromCurrency,
        toCurrency
      })
      .first()

    if (existing) {
      // �������м�¼
      await this.rates.update(existing.id, { rate, updateTime })
    } else {
      // ����¼�¼
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

  // ��ӻ�ȡ������ʱ��ķ���
  async getLastUpdateTime(date) {
    const dateStr = new Date(date).toISOString().split('T')[0]
    const records = await this.rates
      .where('date')
      .equals(dateStr)
      .toArray()
    
    if (records.length === 0) return null
    
    // ��ȡ���µĸ���ʱ��
    return records.reduce((latest, current) => {
      return latest > current.updateTime ? latest : current.updateTime
    }, records[0].updateTime)
  }

  // ���������صķ���
  async saveSettings(forms, lastDate) {
    await this.settings.put({
      id: 1,  // ʹ�ù̶� id
      forms,
      lastDate
    })
  }

  async loadSettings() {
    const settings = await this.settings.get(1)
    return settings || null
  }
}

// ֻ����һ��ʵ��
const db = new CurrencyDB()
export default db 