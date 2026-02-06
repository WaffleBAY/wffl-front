import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WaffleFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const waffleFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_worldId', internalType: 'address', type: 'address' },
      { name: '_appId', internalType: 'string', type: 'string' },
      { name: '_worldFoundation', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_operator', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'appId',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_root', internalType: 'uint256', type: 'uint256' },
      { name: '_sellerNullifierHash', internalType: 'uint256', type: 'uint256' },
      { name: '_sellerProof', internalType: 'uint256[8]', type: 'uint256[8]' },
      {
        name: '_mType',
        internalType: 'enum WaffleLib.MarketType',
        type: 'uint8',
      },
      { name: '_ticketPrice', internalType: 'uint256', type: 'uint256' },
      { name: '_goalAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_preparedQuantity', internalType: 'uint256', type: 'uint256' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createMarket',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllMarkets',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
    name: 'getMarket',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMarketCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isMarket',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'marketCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'markets',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'operator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_worldFoundation', internalType: 'address', type: 'address' },
    ],
    name: 'updateFeeRecipients',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newOperator', internalType: 'address', type: 'address' },
    ],
    name: 'updateOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'worldFoundation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'worldId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'worldFoundation',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'opsWallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FeeRecipientsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'marketId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'marketAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'mType',
        internalType: 'enum WaffleLib.MarketType',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldOperator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOperator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OperatorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WaffleMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const waffleMarketAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_seller', internalType: 'address', type: 'address' },
      { name: '_worldId', internalType: 'address', type: 'address' },
      { name: '_appId', internalType: 'string', type: 'string' },
      { name: '_worldFoundation', internalType: 'address', type: 'address' },
      { name: '_opsWallet', internalType: 'address', type: 'address' },
      { name: '_operator', internalType: 'address', type: 'address' },
      {
        name: '_mType',
        internalType: 'enum WaffleLib.MarketType',
        type: 'uint8',
      },
      { name: '_ticketPrice', internalType: 'uint256', type: 'uint256' },
      { name: '_goalAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_preparedQuantity', internalType: 'uint256', type: 'uint256' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_sellerNullifierHash', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PARTICIPANT_DEPOSIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REVEAL_BLOCK_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelByTimeout',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'closeEntries',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'commitment',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'endTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_root', internalType: 'uint256', type: 'uint256' },
      { name: '_nullifierHash', internalType: 'uint256', type: 'uint256' },
      { name: '_proof', internalType: 'uint256[8]', type: 'uint256[8]' },
    ],
    name: 'enter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'externalNullifier',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getParticipants',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWinners',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'goalAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mType',
    outputs: [
      { name: '', internalType: 'enum WaffleLib.MarketType', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nullifierHashSum',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'nullifierHashes',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'openMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'operator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'opsWallet',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'participantInfos',
    outputs: [
      { name: 'hasEntered', internalType: 'bool', type: 'bool' },
      { name: 'isWinner', internalType: 'bool', type: 'bool' },
      { name: 'paidAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'depositRefunded', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'participants',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pickWinners',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'preparedQuantity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_root', internalType: 'uint256', type: 'uint256' },
      { name: '_nullifierHash', internalType: 'uint256', type: 'uint256' },
      { name: '_proof', internalType: 'uint256[8]', type: 'uint256[8]' },
    ],
    name: 'revealSecret',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'secretRevealed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'seller',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sellerDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sellerNullifierHash',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'snapshotBlock',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'snapshotPrevrandao',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'status',
    outputs: [
      { name: '', internalType: 'enum WaffleLib.MarketStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ticketPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'winners',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'worldFoundation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'worldId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Entered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'MarketFailed',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'MarketOpen' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nullifierHash',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SecretRevealed',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'Settled' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'winners',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'WinnerSelected',
  },
  { type: 'error', inputs: [], name: 'AlreadyParticipated' },
  { type: 'error', inputs: [], name: 'GoalNotReached' },
  { type: 'error', inputs: [], name: 'InsufficientFunds' },
  {
    type: 'error',
    inputs: [
      {
        name: 'current',
        internalType: 'enum WaffleLib.MarketStatus',
        type: 'uint8',
      },
      {
        name: 'expected',
        internalType: 'enum WaffleLib.MarketStatus',
        type: 'uint8',
      },
    ],
    name: 'InvalidState',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TimeExpired' },
  { type: 'error', inputs: [], name: 'TimeNotReached' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  { type: 'error', inputs: [], name: 'VerificationFailed' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__
 */
export const useReadWaffleFactory = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
})

export const useReadWaffleFactoryAppId = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'appId',
})

export const useReadWaffleFactoryGetAllMarkets =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getAllMarkets',
  })

export const useReadWaffleFactoryGetMarket =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getMarket',
  })

export const useReadWaffleFactoryGetMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getMarketCount',
  })

export const useReadWaffleFactoryIsMarket = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'isMarket' },
)

export const useReadWaffleFactoryMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'marketCount',
  })

export const useReadWaffleFactoryMarkets = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'markets',
})

export const useReadWaffleFactoryOperator = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'operator' },
)

export const useReadWaffleFactoryTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'treasury',
  })

export const useReadWaffleFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'owner',
})

export const useReadWaffleFactoryWorldFoundation =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'worldFoundation',
  })

export const useReadWaffleFactoryWorldId = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'worldId',
})

export const useWriteWaffleFactory = /*#__PURE__*/ createUseWriteContract({
  abi: waffleFactoryAbi,
})

export const useWriteWaffleFactoryCreateMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'createMarket',
  })

export const useWriteWaffleFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'renounceOwnership',
  })

export const useWriteWaffleFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'transferOwnership',
  })

export const useWriteWaffleFactoryUpdateFeeRecipients =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'updateFeeRecipients',
  })

export const useWriteWaffleFactoryUpdateOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'updateOperator',
  })

export const useSimulateWaffleFactory = /*#__PURE__*/ createUseSimulateContract(
  { abi: waffleFactoryAbi },
)

export const useSimulateWaffleFactoryCreateMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'createMarket',
  })

export const useSimulateWaffleFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'renounceOwnership',
  })

export const useSimulateWaffleFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'transferOwnership',
  })

export const useSimulateWaffleFactoryUpdateFeeRecipients =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'updateFeeRecipients',
  })

export const useSimulateWaffleFactoryUpdateOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'updateOperator',
  })

export const useWatchWaffleFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: waffleFactoryAbi })

export const useWatchWaffleFactoryFeeRecipientsUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'FeeRecipientsUpdated',
  })

export const useWatchWaffleFactoryMarketCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'MarketCreated',
  })

export const useWatchWaffleFactoryOperatorUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'OperatorUpdated',
  })

export const useWatchWaffleFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WaffleMarket React Hooks
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const useReadWaffleMarket = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
})

export const useReadWaffleMarketParticipantDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'PARTICIPANT_DEPOSIT',
  })

export const useReadWaffleMarketRevealBlockTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'REVEAL_BLOCK_TIMEOUT',
  })

export const useReadWaffleMarketCommitment =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'commitment',
  })

export const useReadWaffleMarketEndTime = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'endTime',
})

export const useReadWaffleMarketExternalNullifier =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'externalNullifier',
  })

export const useReadWaffleMarketFactory = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'factory',
})

export const useReadWaffleMarketGetParticipants =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'getParticipants',
  })

export const useReadWaffleMarketGetWinners =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'getWinners',
  })

export const useReadWaffleMarketGoalAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'goalAmount',
  })

export const useReadWaffleMarketMType = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'mType',
})

export const useReadWaffleMarketNullifierHashSum =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'nullifierHashSum',
  })

export const useReadWaffleMarketNullifierHashes =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'nullifierHashes',
  })

export const useReadWaffleMarketOperator = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'operator',
})

export const useReadWaffleMarketOpsWallet = /*#__PURE__*/ createUseReadContract(
  { abi: waffleMarketAbi, functionName: 'opsWallet' },
)

export const useReadWaffleMarketParticipantInfos =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'participantInfos',
  })

export const useReadWaffleMarketParticipants =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'participants',
  })

export const useReadWaffleMarketPreparedQuantity =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'preparedQuantity',
  })

export const useReadWaffleMarketPrizePool = /*#__PURE__*/ createUseReadContract(
  { abi: waffleMarketAbi, functionName: 'prizePool' },
)

export const useReadWaffleMarketSecretRevealed =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'secretRevealed',
  })

export const useReadWaffleMarketSeller = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'seller',
})

export const useReadWaffleMarketSellerDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'sellerDeposit',
  })

export const useReadWaffleMarketSellerNullifierHash =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'sellerNullifierHash',
  })

export const useReadWaffleMarketSnapshotBlock =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'snapshotBlock',
  })

export const useReadWaffleMarketSnapshotPrevrandao =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'snapshotPrevrandao',
  })

export const useReadWaffleMarketStatus = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'status',
})

export const useReadWaffleMarketTicketPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'ticketPrice',
  })

export const useReadWaffleMarketWinners = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'winners',
})

export const useReadWaffleMarketWorldFoundation =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'worldFoundation',
  })

export const useReadWaffleMarketWorldId = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'worldId',
})

export const useWriteWaffleMarket = /*#__PURE__*/ createUseWriteContract({
  abi: waffleMarketAbi,
})

export const useWriteWaffleMarketCancelByTimeout =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'cancelByTimeout',
  })

export const useWriteWaffleMarketClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'claimRefund',
  })

export const useWriteWaffleMarketCloseEntries =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'closeEntries',
  })

export const useWriteWaffleMarketEnter = /*#__PURE__*/ createUseWriteContract({
  abi: waffleMarketAbi,
  functionName: 'enter',
})

export const useWriteWaffleMarketOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'openMarket',
  })

export const useWriteWaffleMarketPickWinners =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'pickWinners',
  })

export const useWriteWaffleMarketRevealSecret =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'revealSecret',
  })

export const useWriteWaffleMarketSettle =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'settle',
  })

export const useSimulateWaffleMarket = /*#__PURE__*/ createUseSimulateContract({
  abi: waffleMarketAbi,
})

export const useSimulateWaffleMarketCancelByTimeout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'cancelByTimeout',
  })

export const useSimulateWaffleMarketClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'claimRefund',
  })

export const useSimulateWaffleMarketCloseEntries =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'closeEntries',
  })

export const useSimulateWaffleMarketEnter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'enter',
  })

export const useSimulateWaffleMarketOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'openMarket',
  })

export const useSimulateWaffleMarketPickWinners =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'pickWinners',
  })

export const useSimulateWaffleMarketRevealSecret =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'revealSecret',
  })

export const useSimulateWaffleMarketSettle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'settle',
  })

export const useWatchWaffleMarketEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: waffleMarketAbi })

export const useWatchWaffleMarketEnteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'Entered',
  })

export const useWatchWaffleMarketMarketFailedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'MarketFailed',
  })

export const useWatchWaffleMarketMarketOpenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'MarketOpen',
  })

export const useWatchWaffleMarketSecretRevealedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'SecretRevealed',
  })

export const useWatchWaffleMarketSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'Settled',
  })

export const useWatchWaffleMarketWinnerSelectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'WinnerSelected',
  })
