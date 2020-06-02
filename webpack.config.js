const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')
const { name } = require('./package.json')
const chalk = require('chalk')
const ip = require('ip')
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const PORT = 4000

const optimization = () => {
  const config = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunck-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}

const plugins = () => {
  const base = [
    new CleanTerminalPlugin({
      message: `
        You can now view ${chalk.bold(name) || ''} in the browser.

        ${chalk.black.bgBlue.bold('Local')}               http://localhost:${PORT}
        ${chalk.black.bgBlue.bold('On Your Network')}:    http://${ip.address()}:${PORT}

        Note that the development build is not optimized.
        To create a production build, use ${chalk.blue('npm run build')}.
      `
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ]

  return base
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

module.exports = {
  entry: './src/index.tsx',
  stats: {
    all: false,
    warnings: true,
    errors: true
  },
  devtool: isDev ? 'source-map' : '',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: filename('js'),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.png'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: plugins(),
  devServer: {
    port: PORT,
    historyApiFallback: true,
    overlay: true
  },
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: isDev,
            reloadAll: true
          }
        }, 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(js|ts)x?$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      }
    ]
  }
}
