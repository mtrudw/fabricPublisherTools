import serve from 'rollup-plugin-serve';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {eslint} from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';


export default [{
    
  input: 'src/index.js',
  output: {
    file: 'dist/fabricPublisherTools.js',
    format: 'esm'
  },
    
    plugins: [
	resolve({'browser': true}),
	commonjs(),
	json(),
	eslint(),
	serve('dist'),
	
  ]
},
{
  input: 'src/index.js',
  output: {
    file: 'dist/fabricPublisherTools.min.js',
    format: 'esm'
  },
    
    plugins: [
	resolve({'browser': true}),
	commonjs(),
	json(),
	terser()
  ]
}];
