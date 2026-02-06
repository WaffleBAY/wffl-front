import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/contracts/generated.ts',
  plugins: [
    foundry({
      project: '../wffl-contract',
      include: [
        'WaffleFactory.sol/WaffleFactory.json',
        'WaffleMarket.sol/WaffleMarket.json',
      ],
      forge: {
        build: false, // Skip forge build - run manually via contracts:build script
        path: `${process.env.HOME}/.foundry/bin/forge`,
      },
    }),
    react(),
  ],
})
