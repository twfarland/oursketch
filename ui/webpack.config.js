module.exports = {
    entry: "./src/app.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
    },

    module: {
        
        rules: [

            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { 
                test: /\.tsx?$/, 
                use: ["awesome-typescript-loader"] 
            },

            { 
                test: /\.css$/, 
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader"
                ]
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { 
                test: /\.js$/, 
                use: ["source-map-loader"] 
            }
        ]
    }
};