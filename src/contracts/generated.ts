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
      { name: '_wldToken', internalType: 'address', type: 'address' },
      { name: '_permit2', internalType: 'address', type: 'address' },
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
      {
        name: '_sellerNullifierHash',
        internalType: 'uint256',
        type: 'uint256',
      },
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
      { name: '_permitAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_permitNonce', internalType: 'uint256', type: 'uint256' },
      { name: '_permitDeadline', internalType: 'uint256', type: 'uint256' },
      { name: '_permitSignature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createMarket',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_market', internalType: 'address', type: 'address' },
      { name: '_nullifierHash', internalType: 'uint256', type: 'uint256' },
      { name: '_proof', internalType: 'uint256[8]', type: 'uint256[8]' },
      { name: '_permitAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_permitNonce', internalType: 'uint256', type: 'uint256' },
      { name: '_permitDeadline', internalType: 'uint256', type: 'uint256' },
      { name: '_permitSignature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'enterMarket',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'permit2',
    outputs: [
      {
        name: '',
        internalType: 'contract ISignatureTransfer',
        type: 'address',
      },
    ],
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
    name: 'wldToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
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
      {
        name: '_sellerNullifierHash',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: '_wldToken', internalType: 'address', type: 'address' },
      { name: '_permit2', internalType: 'address', type: 'address' },
      { name: '_depositAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
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
      { name: '_permitAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_permitNonce', internalType: 'uint256', type: 'uint256' },
      { name: '_permitDeadline', internalType: 'uint256', type: 'uint256' },
      { name: '_permitSignature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'enter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_participant', internalType: 'address', type: 'address' },
      { name: '_nullifierHash', internalType: 'uint256', type: 'uint256' },
      { name: '_proof', internalType: 'uint256[8]', type: 'uint256[8]' },
    ],
    name: 'enterViaFactory',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'permit2',
    outputs: [
      {
        name: '',
        internalType: 'contract ISignatureTransfer',
        type: 'address',
      },
    ],
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
    name: 'wldToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
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

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"appId"`
 */
export const useReadWaffleFactoryAppId = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'appId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"getAllMarkets"`
 */
export const useReadWaffleFactoryGetAllMarkets =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getAllMarkets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"getMarket"`
 */
export const useReadWaffleFactoryGetMarket =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getMarket',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"getMarketCount"`
 */
export const useReadWaffleFactoryGetMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'getMarketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"isMarket"`
 */
export const useReadWaffleFactoryIsMarket = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'isMarket' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"marketCount"`
 */
export const useReadWaffleFactoryMarketCount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'marketCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"markets"`
 */
export const useReadWaffleFactoryMarkets = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'markets',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"operator"`
 */
export const useReadWaffleFactoryOperator = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'operator' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadWaffleFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"permit2"`
 */
export const useReadWaffleFactoryPermit2 = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'permit2',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadWaffleFactoryTreasury = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'treasury' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"wldToken"`
 */
export const useReadWaffleFactoryWldToken = /*#__PURE__*/ createUseReadContract(
  { abi: waffleFactoryAbi, functionName: 'wldToken' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"worldFoundation"`
 */
export const useReadWaffleFactoryWorldFoundation =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleFactoryAbi,
    functionName: 'worldFoundation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"worldId"`
 */
export const useReadWaffleFactoryWorldId = /*#__PURE__*/ createUseReadContract({
  abi: waffleFactoryAbi,
  functionName: 'worldId',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__
 */
export const useWriteWaffleFactory = /*#__PURE__*/ createUseWriteContract({
  abi: waffleFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"createMarket"`
 */
export const useWriteWaffleFactoryCreateMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'createMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"enterMarket"`
 */
export const useWriteWaffleFactoryEnterMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'enterMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteWaffleFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteWaffleFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"updateFeeRecipients"`
 */
export const useWriteWaffleFactoryUpdateFeeRecipients =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'updateFeeRecipients',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"updateOperator"`
 */
export const useWriteWaffleFactoryUpdateOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleFactoryAbi,
    functionName: 'updateOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__
 */
export const useSimulateWaffleFactory = /*#__PURE__*/ createUseSimulateContract(
  { abi: waffleFactoryAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"createMarket"`
 */
export const useSimulateWaffleFactoryCreateMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'createMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"enterMarket"`
 */
export const useSimulateWaffleFactoryEnterMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'enterMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateWaffleFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateWaffleFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"updateFeeRecipients"`
 */
export const useSimulateWaffleFactoryUpdateFeeRecipients =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'updateFeeRecipients',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleFactoryAbi}__ and `functionName` set to `"updateOperator"`
 */
export const useSimulateWaffleFactoryUpdateOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleFactoryAbi,
    functionName: 'updateOperator',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleFactoryAbi}__
 */
export const useWatchWaffleFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: waffleFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleFactoryAbi}__ and `eventName` set to `"FeeRecipientsUpdated"`
 */
export const useWatchWaffleFactoryFeeRecipientsUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'FeeRecipientsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleFactoryAbi}__ and `eventName` set to `"MarketCreated"`
 */
export const useWatchWaffleFactoryMarketCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'MarketCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleFactoryAbi}__ and `eventName` set to `"OperatorUpdated"`
 */
export const useWatchWaffleFactoryOperatorUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'OperatorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchWaffleFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__
 */
export const useReadWaffleMarket = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"PARTICIPANT_DEPOSIT"`
 */
export const useReadWaffleMarketParticipantDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'PARTICIPANT_DEPOSIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"REVEAL_BLOCK_TIMEOUT"`
 */
export const useReadWaffleMarketRevealBlockTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'REVEAL_BLOCK_TIMEOUT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"commitment"`
 */
export const useReadWaffleMarketCommitment =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'commitment',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"endTime"`
 */
export const useReadWaffleMarketEndTime = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'endTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"externalNullifier"`
 */
export const useReadWaffleMarketExternalNullifier =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'externalNullifier',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"factory"`
 */
export const useReadWaffleMarketFactory = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"getParticipants"`
 */
export const useReadWaffleMarketGetParticipants =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'getParticipants',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"getWinners"`
 */
export const useReadWaffleMarketGetWinners =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'getWinners',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"goalAmount"`
 */
export const useReadWaffleMarketGoalAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'goalAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"mType"`
 */
export const useReadWaffleMarketMType = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'mType',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"nullifierHashSum"`
 */
export const useReadWaffleMarketNullifierHashSum =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'nullifierHashSum',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"nullifierHashes"`
 */
export const useReadWaffleMarketNullifierHashes =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'nullifierHashes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"operator"`
 */
export const useReadWaffleMarketOperator = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'operator',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"opsWallet"`
 */
export const useReadWaffleMarketOpsWallet = /*#__PURE__*/ createUseReadContract(
  { abi: waffleMarketAbi, functionName: 'opsWallet' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"participantInfos"`
 */
export const useReadWaffleMarketParticipantInfos =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'participantInfos',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"participants"`
 */
export const useReadWaffleMarketParticipants =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'participants',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"permit2"`
 */
export const useReadWaffleMarketPermit2 = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'permit2',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"preparedQuantity"`
 */
export const useReadWaffleMarketPreparedQuantity =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'preparedQuantity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"prizePool"`
 */
export const useReadWaffleMarketPrizePool = /*#__PURE__*/ createUseReadContract(
  { abi: waffleMarketAbi, functionName: 'prizePool' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"secretRevealed"`
 */
export const useReadWaffleMarketSecretRevealed =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'secretRevealed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"seller"`
 */
export const useReadWaffleMarketSeller = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'seller',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"sellerDeposit"`
 */
export const useReadWaffleMarketSellerDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'sellerDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"sellerNullifierHash"`
 */
export const useReadWaffleMarketSellerNullifierHash =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'sellerNullifierHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"snapshotBlock"`
 */
export const useReadWaffleMarketSnapshotBlock =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'snapshotBlock',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"snapshotPrevrandao"`
 */
export const useReadWaffleMarketSnapshotPrevrandao =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'snapshotPrevrandao',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"status"`
 */
export const useReadWaffleMarketStatus = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'status',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"ticketPrice"`
 */
export const useReadWaffleMarketTicketPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'ticketPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"winners"`
 */
export const useReadWaffleMarketWinners = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'winners',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"wldToken"`
 */
export const useReadWaffleMarketWldToken = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'wldToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"worldFoundation"`
 */
export const useReadWaffleMarketWorldFoundation =
  /*#__PURE__*/ createUseReadContract({
    abi: waffleMarketAbi,
    functionName: 'worldFoundation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"worldId"`
 */
export const useReadWaffleMarketWorldId = /*#__PURE__*/ createUseReadContract({
  abi: waffleMarketAbi,
  functionName: 'worldId',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__
 */
export const useWriteWaffleMarket = /*#__PURE__*/ createUseWriteContract({
  abi: waffleMarketAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"cancelByTimeout"`
 */
export const useWriteWaffleMarketCancelByTimeout =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'cancelByTimeout',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useWriteWaffleMarketClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"closeEntries"`
 */
export const useWriteWaffleMarketCloseEntries =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'closeEntries',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"enter"`
 */
export const useWriteWaffleMarketEnter = /*#__PURE__*/ createUseWriteContract({
  abi: waffleMarketAbi,
  functionName: 'enter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"enterViaFactory"`
 */
export const useWriteWaffleMarketEnterViaFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'enterViaFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"openMarket"`
 */
export const useWriteWaffleMarketOpenMarket =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"pickWinners"`
 */
export const useWriteWaffleMarketPickWinners =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'pickWinners',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"revealSecret"`
 */
export const useWriteWaffleMarketRevealSecret =
  /*#__PURE__*/ createUseWriteContract({
    abi: waffleMarketAbi,
    functionName: 'revealSecret',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"settle"`
 */
export const useWriteWaffleMarketSettle = /*#__PURE__*/ createUseWriteContract({
  abi: waffleMarketAbi,
  functionName: 'settle',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__
 */
export const useSimulateWaffleMarket = /*#__PURE__*/ createUseSimulateContract({
  abi: waffleMarketAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"cancelByTimeout"`
 */
export const useSimulateWaffleMarketCancelByTimeout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'cancelByTimeout',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useSimulateWaffleMarketClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"closeEntries"`
 */
export const useSimulateWaffleMarketCloseEntries =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'closeEntries',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"enter"`
 */
export const useSimulateWaffleMarketEnter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'enter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"enterViaFactory"`
 */
export const useSimulateWaffleMarketEnterViaFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'enterViaFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"openMarket"`
 */
export const useSimulateWaffleMarketOpenMarket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'openMarket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"pickWinners"`
 */
export const useSimulateWaffleMarketPickWinners =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'pickWinners',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"revealSecret"`
 */
export const useSimulateWaffleMarketRevealSecret =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'revealSecret',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link waffleMarketAbi}__ and `functionName` set to `"settle"`
 */
export const useSimulateWaffleMarketSettle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: waffleMarketAbi,
    functionName: 'settle',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__
 */
export const useWatchWaffleMarketEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: waffleMarketAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"Entered"`
 */
export const useWatchWaffleMarketEnteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'Entered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"MarketFailed"`
 */
export const useWatchWaffleMarketMarketFailedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'MarketFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"MarketOpen"`
 */
export const useWatchWaffleMarketMarketOpenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'MarketOpen',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"SecretRevealed"`
 */
export const useWatchWaffleMarketSecretRevealedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'SecretRevealed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"Settled"`
 */
export const useWatchWaffleMarketSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'Settled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link waffleMarketAbi}__ and `eventName` set to `"WinnerSelected"`
 */
export const useWatchWaffleMarketWinnerSelectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: waffleMarketAbi,
    eventName: 'WinnerSelected',
  })
