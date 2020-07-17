import serve from 'rollup-plugin-serve';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
    
  input: 'src/index.js',
  output: {
    file: 'dist/fabricPublisher.js',
    format: 'esm'
  },
    
    plugins: [
	resolve({'browser': true}),
	commonjs(),
	json(),
	serve('dist')
  ]
};
