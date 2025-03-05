const { defineConfig } = require('@vue/cli-service')


module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "汇率计算器",
        appId: "com.currency.converter",
        win: {
          icon: "public/icon.ico",
          target: [
            {
              target: "portable",
              arch: ["x64"]
            }
          ]
        },
        portable: {
          artifactName: "汇率计算器.exe"
        },
        directories: {
          output: "dist_electron"
        }
      }
    }
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader'
        }
      ]
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'https://www.mastercard.com.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/settlement/currencyrate'
        }
      }
    }
  }
})
