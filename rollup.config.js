import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

const plugs = [
    resolve({
        dedupe: [ 
            'react',
            'react-dom',
            'rxjs/ajax',
            'rxjs/operators',
            'rxjs'
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
        'process.env.NODE_ENV': JSON.stringify( 'production' )
    })

]


export default [
    {
        input: 'src/main.js',
        output: {
            file: 'dist/slh.min.js',
            format: 'iife',
            name: 'SantasLittleHelper',
        },
        plugins:[...plugs]
    },
    {
        input: 'src/main.js',
        output: {
            file: '../../docker/apache-php/files/www/templates/index/js/slh.js',
            format: 'iife',
            name: 'SantasLittleHelper',
        },
        plugins:[...plugs]
    },

] 