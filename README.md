# vite-multiple-page

## Install Packages
```
npm install
```

## Run App
```
npm run dev
```

open url `http://127.0.0.1:5173/sample1/index.html`, `http://127.0.0.1:5173/sample2/index.html`

<img width="400" alt="スクリーンショット 2022-08-28 17 50 22" src="https://user-images.githubusercontent.com/8470739/187068562-70b7339d-055f-4b19-bf5b-e85a6ef7f5f7.png">

<img width="400" alt="スクリーンショット 2022-08-28 17 50 41" src="https://user-images.githubusercontent.com/8470739/187068564-033c03eb-4787-4df9-9ae8-7400fcf0477e.png">


## Output Files
```
npm run build
```

```shell
% npm run build

> webgl-vite-ts@0.0.0 build
> tsc && vite build

vite v3.0.9 building for production...
✓ 5 modules transformed.
../dist/sample1/index.html                          0.26 KiB
../dist/sample2/index.html                          0.26 KiB
../dist/assets/sample1.12d04bc2.js                  0.14 KiB / gzip: 0.14 KiB
../dist/assets/sample2.c24de582.js                  0.14 KiB / gzip: 0.14 KiB
../dist/assets/modulepreload-polyfill.c7c6310f.js   0.69 KiB / gzip: 0.39 KiB
shiratoritakashi@shiratoinoM1MBP webgl-vite-ts % 
```

## Reference

<a href="https://youtu.be/STeKBm67l6M" target="_blank">Setup Multiple Pages with VITE</a>

