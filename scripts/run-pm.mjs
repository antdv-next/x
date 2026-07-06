// Forward all arguments to `vp pm` (the Vite+ package-manager forwarder).
//
// Why this script exists:
// `vp pm` is only implemented by the full Vite+ CLI binary, not by the local
// `node_modules/.bin/vp` JS wrapper (which only covers core commands like
// dev/build/run/exec/install/...). When a package.json script is executed via
// `vp run <script>`, the task runner prepends `node_modules/.bin` to `PATH`, so
// any `vp pm ...` launched from that script resolves to the local JS wrapper
// and fails with:
//
//     error: Command 'pm' not found
//
// `vp run` exposes the path to the full CLI binary through the `VP_CLI_BIN`
// environment variable, so we use that to invoke `vp pm` directly. We fall back
// to `vp` (resolved from PATH) when `VP_CLI_BIN` is not set — e.g. when this
// script is run outside of `vp run`, where `vp` already resolves to the full
// binary.
//
// Usage (from a package.json script):
//   node scripts/run-pm.mjs publish --filter @scope/pkg --access public --no-git-checks
//   node scripts/run-pm.mjs pack -r --filter "./packages/*" --filter "!./packages/docs"
import { spawnSync } from "node:child_process";

const bin = process.env.VP_CLI_BIN || "vp";
const result = spawnSync(bin, ["pm", ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  console.error(`[run-pm] failed to spawn '${bin}': ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
