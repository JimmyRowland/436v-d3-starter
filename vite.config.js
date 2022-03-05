import {defineConfig} from 'vite';


export default defineConfig(({mode}) => ({
  server: {
    port: 3030
  },
  preview: {
    port: 8080
  }
}));

