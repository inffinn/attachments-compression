import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '',
  build: {
    watch: true ? {exclude: 'node_modules/**', include: 'src/**'} : null, //watch in dev, exclude iconfont for prevent looping
    minify: true,
    sourcemap: true,
  }
})
