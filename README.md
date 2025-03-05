# ���ʼ�����

һ������ Vue 3 + Electron �Ŀ�ƽ̨����Ӧ�ã�����ʵʱ��ȡ�ͼ�����һ��ʡ�

## ����ջ

- **ǰ�˿��**: Vue 3
- **������**: Electron 13
- **UI �����**: Element Plus
- **���ݿ�**: Dexie (IndexedDB)
- **HTTP �ͻ���**: Axios
- **��������**: Vue CLI + vue-cli-plugin-electron-builder
- **��������**: JavaScript/Vue

## ������������

### ��װ����
```bash
# ��װ��Ŀ����
npm install
```

### ��������
```bash
# �����������������������أ�
npm run electron:serve

# ���Ӧ��
npm run electron:build

# ������
npm run lint

# �����鲢�Զ��޸�
npm run lint -- --fix
```

## ��Ŀ�ṹ
```
currency-converter-app/
������ src/
��   ������ assets/          # ��̬��Դ
��   ������ components/      # Vue ���
��   ������ utils/          # ���ߺ���
��   ������ App.vue         # �����
��   ������ background.js   # Electron ������
��   ������ main.js        # Vue ����ļ�
��   ������ preload.js     # Electron Ԥ���ؽű�
������ public/            # ������Դ
������ vue.config.js      # Vue �� Electron ����
������ package.json       # ��Ŀ���ú�����
```

## ������Դ

���������������´￨�ٷ� API��
- API ��ַ��https://www.mastercard.com.cn/settlement/currencyrate/conversion-rate
- ����ʱ�䣺ÿ������ʱ������ 4:00������ʱ������賿 4:00 �� 5:00��

## ��Ҫ����

- ֧�ֶ��ֻ���ʵʱת��
- ��ʷ���ʼ�¼��ѯ
- �����Ѽ���
- �������ݴ洢
- �Զ���ת�����

## ����ע������

1. ����ʱ��Ҫȷ�������ܷ������´￨ API
2. �״�������Ҫ��ʼ���������ݿ�
3. ���ʱע��������Ӧ��ͼ���Ӧ����Ϣ
4. ע�⴦�� API ����Ĵ���ͳ�ʱ
5. ��������ʱ���뱾��ʱ���ת��

## ��������

�������Ӧ��λ�ڣ�
```
dist_electron/
������ win-unpacked/      # �ⰲװ��
��   ������ ���ʼ�����.exe
������ ���ʼ�����.exe      # ��Я��
```

## �汾��ʷ

- v1.0.0
  - ��������ת������
  - ��ʷ��¼��ѯ
  - �����Ѽ���
  - �������ݴ洢

## ���֤

MIT License
