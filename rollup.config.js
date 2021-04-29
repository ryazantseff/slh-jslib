import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import babel from 'rollup-plugin-babel'
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import { uglify } from "rollup-plugin-uglify"

const plugs = [
    peerDepsExternal(),
    babel({exclude: 'node_modules/**'}),
    resolve({
        dedupe: [ 
            'react',
            'react-dom',
            'rxjs/ajax',
            'rxjs/operators',
            'rxjs',
            'js-cookie',
            'moment'
        ],
    }),
    commonjs({
        // include: 'node_modules/**',
        namedExports: {
          'react': ['useState', 'useEffect', 'useRef', 'createElement'],
          'react-dom': ['render']
        }
    }),
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
]


export default [
    {
        input: 'src/main.js',
        output: {
            file: 'dist/slh.min.js',
            format: 'iife',
            name: 'SantasLittleHelper',
        },
        plugins:[...plugs, uglify()]
    },
    {
        input: 'src/main.js',
        output: {
            file: 'dist/slh-umd.js',
            format: 'umd',
            name: 'SantasLittleHelper',
        },
        plugins:[...plugs]
    },

] 