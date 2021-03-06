import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    name: 'Vue',
    format: 'umd',
    sourcemap: true // 调试源代码
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // 排除 nodemodules 中的模块
    }),
    resolve()
  ]
}
