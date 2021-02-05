# AEM Use Sprite Plugin

[![npm version](https://badge.fury.io/js/aem-use-sprite-plugin.svg)](http://badge.fury.io/js/aem-use-sprite-plugin)

A wrapper plugin for [SVG Sprite Loader](https://github.com/JetBrains/svg-sprite-loader). This plugin generates a [JavaScript Use-API JS](https://experienceleague.adobe.com/docs/experience-manager-htl/using/htl/use-api-javascript.html) file containing the dynamically generated path(s) of your SVG sprites which can be used in your HTL/Sightly files. This is very useful if your clientlibs are dynamically named or if you prefer to provide hashes with your sprites.

## Example Configuration

```js
// under plugins
plugins: [
  new AEMUseSpritePlugin({
    // This `spriteLoaderOptions` object is passed to the underlying Sprite Loader Plugin: https://github.com/JetBrains/svg-sprite-loader#plain-sprite
    spriteLoaderOptions: undefined,
    clientlibLocation: `FOLDER_CONTAINING_SPRITE`,
    outputUseFileLocation: `/apps/project/components/icon/icon.use.js`,
  }),
]

// under module.rules
{
  test: /\.svg$/,
  include: [path.resolve(__dirname, 'src/assets/sprite')],
  use: [
    {
      loader: 'svg-sprite-loader',
      options: {
        symbolId: '[name]',
        extract: true,
        // the sprite file must be under resources; [chunkname] here represents the clientlib (entry) name
        spriteFilename: `[chunkname]/resources/sprite-[hash].svg`,
      },
    },
    'svgo-loader',
  ],
},
```

## Example Output File

```js
use(function () {
  var path = parseInt(this.path, 10) || 0;
  var sprites = [
    "/apps/project/clientlibs/publish/resources/sprite-[hash].svg",
  ];

  return sprites[path];
});
```

## Example Usage (in a page component)

_customheaderlibs.html_

```html
<link
  data-sly-use.sprite="${'project/components/icon/icon.use.js'}"
  rel="preload"
  href="${sprite}"
  as="image"
/>
```

## Example Usage (in a component)

_icon.html_

```html
<!--/* 
  icon: selector containing the symbol id
  path: an optional integer describing which sprite path (if multiple) to use
*/-->
<sly
  data-sly-test.icon="${request.requestPathInfo.selectors[0]}"
  data-sly-test.path="${request.requestPathInfo.selectors[1] || '0'}"
/>
<svg data-sly-test="${icon}" data-sly-use.sprite="${'icon.use.js' @ path=path}">
  <use xlink:href="${sprite}#${icon}"></use>
</svg>
```
