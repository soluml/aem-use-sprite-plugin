const fs = require("fs");
const path = require("path");
const _uniq = require("lodash/uniq");
const { validate } = require("schema-utils");
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");

const NAMESPACE = "AEM Use Sprite Plugin";

const schema = {
  type: "object",
  properties: {
    spriteLoaderOptions: {
      type: "object",
    },
    clientlibLocation: {
      description:
        "Location of the Sprite file within the clientlib's resources folder.",
      type: "string",
    },
    outputUseFileLocation: {
      description: "Output location of the JS use file.",
      type: "string",
    },
  },
  additionalProperties: false,
};

class AEMUseSpritePlugin {
  constructor(options = {}) {
    validate(schema, options, NAMESPACE);

    const {
      spriteLoaderOptions,
      clientlibLocation,
      outputUseFileLocation,
    } = options;

    this.SpriteLoaderPlugin = new SpriteLoaderPlugin(spriteLoaderOptions);
    this.clientlibLocation = clientlibLocation || "";
    this.outputUseFileLocation = outputUseFileLocation;
  }

  apply(compiler) {
    this.SpriteLoaderPlugin.apply(compiler);

    compiler.hooks.done.tap(NAMESPACE, (stats) => {
      const generatedSprites = _uniq(
        this.SpriteLoaderPlugin.map.items.map(
          ({ resource, spriteFilename }) => spriteFilename
        )
      );

      const spriteDetails = Object.entries(stats.compilation.assets)
        .filter(([key]) => generatedSprites.some((s) => key.includes(s)))
        .map(([key, details]) => ({
          key,
          details,
          jcrLocation: this.clientlibLocation + key,
        }));

      fs.writeFileSync(
        this.outputUseFileLocation,
        `use(function () {
  var path = parseInt(this.path, 10) || 0;
  var sprites = ${JSON.stringify(
    spriteDetails.map(({ jcrLocation }) => jcrLocation)
  )};

  return sprites[path];
});`
      );

      console.log("Created Sprite JS Use File!");
    });
  }
}

module.exports = AEMUseSpritePlugin;
