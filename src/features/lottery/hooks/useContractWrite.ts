/**
 * Contract write hooks for WaffleMarket interactions.
 * These hooks implement the simulate -> write -> wait pattern for safe transactions.
 * useEnterMarket uses MiniKit sendTransaction for Permit2 support.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { decodeAbiParameters, type Address } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { BaseError } from 'wagmi'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { CHAIN_ID, PARTICIPANT_DEPOSIT, WLD_TOKEN_ADDRESS } from '@/config/contracts'
import { waffleMarketAbi } from '@/contracts/generated'
import {
  useWriteWaffleMarketSettle,
  useWriteWaffleMarketClaimRefund,
  useSimulateWaffleMarketSettle,
  useSimulateWaffleMarketClaimRefund,
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

  // Simulate first to catch errors before spending gas
  const { data: simulateData, error: simulateError } = useSimulateWaffleMarketClaimRefund({
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
  } = useWriteWaffleMarketClaimRefund()

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

  const claimRefund = useCallback(() => {
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
    claimRefund,
    reset,
    step,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? (error as BaseError).shortMessage || error.message : null,
    canClaim: !!simulateData?.request,
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

  // Calculate required value from passed ticketPrice
  const requiredValue = useMemo(() => {
    if (!ticketPriceWei || ticketPriceWei === '0') return undefined
    return BigInt(ticketPriceWei) + PARTICIPANT_DEPOSIT
  }, [ticketPriceWei])

  /**
   * Single-step entry: WorldID verification → sendTransaction in one go.
   */
  const enterMarket = useCallback(async (lotteryId: string) => {
    if (!marketAddress || !requiredValue) return

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

      // Step 2: Build transaction with WorldID proof
      setStep('signing')

      const decoded = decodeAbiParameters(
        [{ type: 'uint256[8]' }],
        verifyPayload.proof as `0x${string}`
      )
      const proofArray = (decoded[0] as readonly bigint[]).map(v => v.toString())

      const permitDeadline = Math.floor(Date.now() / 1000) + 3600
      const permitNonce = Date.now()

      const txArgs = [
        verifyPayload.merkle_root,          // _root
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
            address: marketAddress,
            abi: waffleMarketAbi as readonly object[],
            functionName: 'enter',
            args: txArgs,
          },
        ],
        permit2: [
          {
            permitted: {
              token: WLD_TOKEN_ADDRESS,
              amount: requiredValue.toString(),
            },
            spender: marketAddress,
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
