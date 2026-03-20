function stripReactPeers(pkg) {
  if (!pkg.peerDependencies) return;

  delete pkg.peerDependencies.react;
  delete pkg.peerDependencies["react-dom"];

  if (Object.keys(pkg.peerDependencies).length === 0) {
    delete pkg.peerDependencies;
  }

  if (pkg.peerDependenciesMeta) {
    delete pkg.peerDependenciesMeta.react;
    delete pkg.peerDependenciesMeta["react-dom"];

    if (Object.keys(pkg.peerDependenciesMeta).length === 0) {
      delete pkg.peerDependenciesMeta;
    }
  }
}

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (
        pkg.name === "@ant-design/x-sdk" ||
        pkg.name === "@rc-component/util"
      ) {
        stripReactPeers(pkg);
      }
      return pkg;
    },
  },
};
