/**
 * Contract write hooks for WaffleMarket interactions.
 * These hooks implement the simulate -> write -> wait pattern for safe transactions.
 * useEnterMarket uses MiniKit sendTransaction for Permit2 support.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { createPublicClient, http, decodeAbiParameters, type Address } from 'viem'
import { worldChain } from '@/config/wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { BaseError } from 'wagmi'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { CHAIN_ID, PARTICIPANT_DEPOSIT, WLD_TOKEN_ADDRESS, getWaffleFactoryAddress } from '@/config/contracts'
import { waffleFactoryAbi, waffleMarketAbi } from '@/contracts/generated'
import {
  useWriteWaffleMarketSettle,
  useSimulateWaffleMarketSettle,
  useWriteWaffleMarketOpenMarket,
  useSimulateWaffleMarketOpenMarket,
} from '@/contracts/generated'

/**
 * Step tracking for openMarket transaction progress.
 */
export type OpenMarketStep = 'idle' | 'signing' | 'confirming' | 'success' | 'error'

/**
 * Step tracking for settlement transaction progress (settle, claimRefund).
 */
export type SettlementStep = 'idle' | 'signing' | 'confirming' | 'success' | 'error'

/**
 * Step tracking for entry flow.
 */
export type EntryStep = 'idle' | 'verifying' | 'signing' | 'confirming' | 'success' | 'error'

/**
 * Hook for settling a market after winners are revealed.
 * LOTTERY: 95% → winner, 5% → ops, seller deposit returned.
 * RAFFLE: pool + deposit → seller.
 * Uses simulate -> write -> wait pattern for safe transaction execution.
 */
export function useSettle(marketAddress: Address | undefined) {
  const [step, setStep] = useState<SettlementStep>('idle')

  // Simulate first to catch errors before spending gas
  const { data: simulateData, error: simulateError } = useSimulateWaffleMarketSettle({
    address: marketAddress,
    chainId: CHAIN_ID,
    query: { enabled: !!marketAddress },
  })

  // Write contract
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset: resetWrite,
  } = useWriteWaffleMarketSettle()

  // Wait for confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash })

  // Update step based on transaction state
  useEffect(() => {
    if (writeError || receiptError) {
      setStep('error')
    } else if (isConfirmed) {
      setStep('success')
    } else if (hash && isConfirming) {
      setStep('confirming')
    } else if (isPending) {
      setStep('signing')
    }
  }, [isPending, hash, isConfirming, isConfirmed, writeError, receiptError])

  const settle = useCallback(() => {
    if (simulateData?.request) {
      setStep('signing')
      writeContract(simulateData.request)
    }
  }, [simulateData?.request, writeContract])

  const reset = useCallback(() => {
    resetWrite()
    setStep('idle')
  }, [resetWrite])

  // Combine all error sources
  const error = simulateError || writeError || receiptError

  return {
    settle,
    reset,
    step,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? (error as BaseError).shortMessage || error.message : null,
    canSettle: !!simulateData?.request,
  }
}

/**
 * Hook for claiming a refund.
 * FAILED: deposit + pool share returned.
 * COMPLETED: deposit only returned (for all participants).
 * Uses simulate -> write -> wait pattern for safe transaction execution.
 */
export function useClaimRefund(marketAddress: Address | undefined) {
  const [step, setStep] = useState<SettlementStep>('idle')
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)

  const claimRefund = useCallback(async () => {
    if (!marketAddress) {
      setError('컨트랙트 주소가 없습니다')
      setStep('error')
      return
    }

    setStep('signing')
    setError(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요')
      }

      // Call market's claimRefund() directly (no args, uses msg.sender).
      // Cannot go through factory because old markets reference a different factory address,
      // and onlyFactory modifier would reject calls from the current factory.
      console.log('[Refund] Sending MiniKit transaction directly to market...', { marketAddress })
      let result
      try {
        result = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: marketAddress,
              abi: waffleMarketAbi as readonly object[],
              functionName: 'claimRefund',
              args: [],
            },
          ],
        })
      } catch (txError) {
        const msg = txError instanceof Error
          ? txError.message
          : typeof txError === 'object'
            ? JSON.stringify(txError, null, 0)
            : String(txError)
        throw new Error(`MiniKit 에러: ${msg.slice(0, 300)}`)
      }

      const { finalPayload: txPayload } = result
      console.log('[Refund] MiniKit response:', JSON.stringify(txPayload).slice(0, 300))

      if (txPayload.status === 'error') {
        const errorCode = (txPayload as { error_code?: string }).error_code
        const errorDetail = errorCode === 'user_rejected'
          ? '사용자가 거부했습니다'
          : `TX 에러: ${JSON.stringify(txPayload).slice(0, 200)}`
        throw new Error(errorDetail)
      }

      // Poll for confirmation
      setStep('confirming')

      const transactionId = (txPayload as { transaction_id: string }).transaction_id
      const appId = process.env.NEXT_PUBLIC_APP_ID
      console.log('[Refund] Polling for tx hash, transactionId:', transactionId)

      let realHash: string | null = null
      for (let i = 0; i < 30; i++) {
        try {
          const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            console.log(`[Refund] Poll ${i}:`, data.transactionStatus, data.transactionHash?.slice(0, 10))
            if (data.transactionStatus === 'failed') {
              throw new Error(`트랜잭션 실패 (relayer): ${JSON.stringify(data).slice(0, 200)}`)
            }
            if (data.transactionHash) {
              realHash = data.transactionHash
              break
            }
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('트랜잭션 실패')) throw e
        }
        await new Promise(r => setTimeout(r, 2000))
      }

      if (!realHash) {
        throw new Error('트랜잭션 해시를 가져오지 못했습니다 (timeout)')
      }

      console.log('[Refund] Success! txHash:', realHash)
      setHash(realHash as `0x${string}`)
      setStep('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '환불에 실패했습니다'
      console.error('[Refund] Error:', message, err)
      setError(message)
      setStep('error')
    }
  }, [marketAddress])

  const reset = useCallback(() => {
    setStep('idle')
    setHash(undefined)
    setError(null)
  }, [])

  return {
    claimRefund,
    reset,
    step,
    hash,
    error,
    isConfirmed: step === 'success',
    canClaim: !!marketAddress,
  }
}

/**
 * Hook for entering a market - single step: WorldID verify + Permit2 tx combined.
 * ticketPriceWei is passed from lottery data (no contract read needed).
 */
export function useEnterMarket(marketAddress: Address | undefined, ticketPriceWei: string) {
  const [step, setStep] = useState<EntryStep>('idle')
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Calculate required value: ticketPrice + fixed 5 WLD deposit
  const requiredValue = useMemo(() => {
    try {
      return BigInt(ticketPriceWei || '0') + PARTICIPANT_DEPOSIT
    } catch {
      return PARTICIPANT_DEPOSIT
    }
  }, [ticketPriceWei])

  /**
   * Single-step entry: WorldID verification → sendTransaction in one go.
   */
  const enterMarket = useCallback(async (lotteryId: string) => {
    if (!marketAddress) {
      setError('컨트랙트 주소가 없습니다')
      setStep('error')
      return
    }
    if (requiredValue === undefined) {
      setError('응모 금액을 계산할 수 없습니다')
      setStep('error')
      return
    }

    setStep('verifying')
    setError(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요')
      }

      // Step 1: WorldID verification
      const { finalPayload: verifyPayload } = await MiniKit.commandsAsync.verify({
        action: 'lottery-entry',
        signal: lotteryId,
        verification_level: VerificationLevel.Orb,
      })

      if (verifyPayload.status === 'error') {
        const errorCode = (verifyPayload as { error_code?: string }).error_code
        switch (errorCode) {
          case 'user_rejected':
            throw new Error('인증이 취소되었습니다')
          case 'verification_failed':
            throw new Error('인증에 실패했습니다. 다시 시도해주세요')
          case 'max_verifications_reached':
            throw new Error('이미 이 복권에 응모했습니다')
          case 'credential_unavailable':
            throw new Error('Orb 인증이 필요합니다. World App에서 Orb 인증을 먼저 완료해주세요')
          default:
            throw new Error('WorldID 인증에 실패했습니다')
        }
      }

      // Step 2: Build transaction via Factory proxy (MiniKit only allows permitted addresses)
      setStep('signing')

      const factoryAddress = getWaffleFactoryAddress(CHAIN_ID)

      const decoded = decodeAbiParameters(
        [{ type: 'uint256[8]' }],
        verifyPayload.proof as `0x${string}`
      )
      const proofArray = (decoded[0] as readonly bigint[]).map(v => v.toString())

      const permitDeadline = Math.floor(Date.now() / 1000) + 3600
      const permitNonce = Date.now()

      // Factory.enterMarket(market, nullifierHash, proof, permitAmount, permitNonce, permitDeadline, permitSignature)
      const txArgs = [
        marketAddress,                       // _market
        verifyPayload.nullifier_hash,       // _nullifierHash
        proofArray,                          // _proof uint256[8]
        requiredValue.toString(),            // _permitAmount
        permitNonce.toString(),              // _permitNonce
        permitDeadline.toString(),           // _permitDeadline
        'PERMIT2_SIGNATURE_PLACEHOLDER_0',   // _permitSignature
      ]

      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: factoryAddress,
            abi: waffleFactoryAbi as readonly object[],
            functionName: 'enterMarket',
            args: txArgs,
          },
        ],
        permit2: [
          {
            permitted: {
              token: WLD_TOKEN_ADDRESS,
              amount: requiredValue.toString(),
            },
            spender: factoryAddress,
            nonce: permitNonce.toString(),
            deadline: permitDeadline.toString(),
          },
        ],
      })

      const { finalPayload: txPayload } = result

      if (txPayload.status === 'error') {
        throw new Error(`TX 에러: ${JSON.stringify(txPayload).slice(0, 200)}`)
      }

      // Step 3: Poll for confirmation
      setStep('confirming')

      const transactionId = (txPayload as { transaction_id: string }).transaction_id
      const appId = process.env.NEXT_PUBLIC_APP_ID

      let realHash: string | null = null
      for (let i = 0; i < 30; i++) {
        try {
          const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            if (data.transactionStatus === 'failed') {
              throw new Error('트랜잭션이 실패했습니다')
            }
            if (data.transactionHash) {
              realHash = data.transactionHash
              break
            }
          }
        } catch (e) {
          if (e instanceof Error && e.message === '트랜잭션이 실패했습니다') throw e
        }
        await new Promise(r => setTimeout(r, 2000))
      }

      if (!realHash) {
        throw new Error('트랜잭션 해시를 가져오지 못했습니다')
      }

      setHash(realHash as `0x${string}`)
      setStep('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '응모에 실패했습니다'
      setError(message)
      setStep('error')
    }
  }, [marketAddress, requiredValue])

  const reset = useCallback(() => {
    setStep('idle')
    setHash(undefined)
    setError(null)
  }, [])

  return {
    enterMarket,
    reset,
    step,
    hash,
    requiredValue,
    error,
  }
}

/**
 * Step tracking for draw transaction progress.
 */
export type DrawStep = 'idle' | 'signing' | 'confirming' | 'success' | 'error'

/**
 * Hook for closing, drawing winners, and settling a market in one step.
 * Uses MiniKit sendTransaction via Factory proxy (closeDrawAndSettle).
 * No Permit2 needed since no token transfer from user.
 */
export function useCloseDrawAndSettle(marketAddress: Address | undefined) {
  const [step, setStep] = useState<DrawStep>('idle')
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)

  const closeDrawAndSettle = useCallback(async () => {
    if (!marketAddress) {
      setError('컨트랙트 주소가 없습니다')
      setStep('error')
      return
    }

    setStep('signing')
    setError(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요')
      }

      const factoryAddress = getWaffleFactoryAddress(CHAIN_ID)

      // Pre-flight: simulate contract call to catch reverts early
      console.log('[Draw] Pre-flight simulation...', { factoryAddress, marketAddress })
      try {
        const publicClient = createPublicClient({ chain: worldChain, transport: http() })
        await publicClient.simulateContract({
          address: factoryAddress,
          abi: waffleFactoryAbi,
          functionName: 'closeDrawAndSettle',
          args: [marketAddress],
        })
        console.log('[Draw] Simulation passed')
      } catch (simError: unknown) {
        const reason = simError instanceof Error ? simError.message : String(simError)
        console.error('[Draw] Simulation failed:', reason)
        // User-friendly messages for known revert reasons
        if (reason.includes('Not open')) {
          throw new Error('이미 추첨이 완료된 마켓입니다. 페이지를 새로고침합니다...')
        }
        if (reason.includes('Not expired')) {
          throw new Error('아직 마감 시간이 지나지 않았습니다.')
        }
        if (reason.includes('Not a valid market')) {
          throw new Error('유효하지 않은 마켓입니다.')
        }
        throw new Error(`컨트랙트 호출 실패: ${reason.slice(0, 300)}`)
      }

      console.log('[Draw] Sending MiniKit transaction...')
      let result
      try {
        result = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: factoryAddress,
              abi: waffleFactoryAbi as readonly object[],
              functionName: 'closeDrawAndSettle',
              args: [marketAddress],
            },
          ],
        })
      } catch (txError) {
        const msg = txError instanceof Error
          ? txError.message
          : typeof txError === 'object'
            ? JSON.stringify(txError, null, 0)
            : String(txError)
        throw new Error(`MiniKit 에러: ${msg.slice(0, 300)}`)
      }

      const { finalPayload: txPayload } = result
      console.log('[Draw] MiniKit response:', JSON.stringify(txPayload).slice(0, 300))

      if (txPayload.status === 'error') {
        const errorCode = (txPayload as { error_code?: string }).error_code
        const errorDetail = errorCode === 'user_rejected'
          ? '사용자가 거부했습니다'
          : `TX 에러: ${JSON.stringify(txPayload).slice(0, 200)}`
        throw new Error(errorDetail)
      }

      // Poll for confirmation
      setStep('confirming')

      const transactionId = (txPayload as { transaction_id: string }).transaction_id
      const appId = process.env.NEXT_PUBLIC_APP_ID
      console.log('[Draw] Polling for tx hash, transactionId:', transactionId)

      let realHash: string | null = null
      for (let i = 0; i < 30; i++) {
        try {
          const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            console.log(`[Draw] Poll ${i}:`, data.transactionStatus, data.transactionHash?.slice(0, 10))
            if (data.transactionStatus === 'failed') {
              throw new Error(`트랜잭션 실패 (relayer): ${JSON.stringify(data).slice(0, 200)}`)
            }
            if (data.transactionHash) {
              realHash = data.transactionHash
              break
            }
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('트랜잭션 실패')) throw e
        }
        await new Promise(r => setTimeout(r, 2000))
      }

      if (!realHash) {
        throw new Error('트랜잭션 해시를 가져오지 못했습니다 (timeout)')
      }

      console.log('[Draw] Success! txHash:', realHash)
      setHash(realHash as `0x${string}`)
      setStep('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '추첨에 실패했습니다'
      console.error('[Draw] Error:', message, err)
      setError(message)
      setStep('error')
    }
  }, [marketAddress])

  const reset = useCallback(() => {
    setStep('idle')
    setHash(undefined)
    setError(null)
  }, [])

  return {
    closeDrawAndSettle,
    reset,
    step,
    hash,
    error,
  }
}

/**
 * Hook for opening a market as seller.
 * Transitions market from CREATED to OPEN status.
 * Uses simulate -> write -> wait pattern with step tracking for UI feedback.
 */
export function useOpenMarket(marketAddress: Address | undefined) {
  const [step, setStep] = useState<OpenMarketStep>('idle')

  // Simulate first to catch errors before spending gas
  const { data: simulateData, error: simulateError } = useSimulateWaffleMarketOpenMarket({
    address: marketAddress,
    chainId: CHAIN_ID,
    query: { enabled: !!marketAddress },
  })

  // Write contract
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset: resetWrite,
  } = useWriteWaffleMarketOpenMarket()

  // Wait for confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash })

  // Update step based on transaction state
  useEffect(() => {
    if (writeError || receiptError) {
      setStep('error')
    } else if (isConfirmed) {
      setStep('success')
    } else if (hash && isConfirming) {
      setStep('confirming')
    } else if (isPending) {
      setStep('signing')
    }
  }, [isPending, hash, isConfirming, isConfirmed, writeError, receiptError])

  const openMarket = useCallback(() => {
    if (simulateData?.request) {
      setStep('signing')
      writeContract(simulateData.request)
    }
  }, [simulateData?.request, writeContract])

  const reset = useCallback(() => {
    resetWrite()
    setStep('idle')
  }, [resetWrite])

  // Combine all error sources
  const error = simulateError || writeError || receiptError

  return {
    openMarket,
    reset,
    step,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? (error as BaseError).shortMessage || error.message : null,
    canOpen: !!simulateData?.request,
  }
}
