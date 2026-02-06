/**
 * Contract write hooks for WaffleMarket interactions.
 * These hooks implement the simulate -> write -> wait pattern for safe transactions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { decodeAbiParameters, type Address } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { BaseError } from 'wagmi'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { CHAIN_ID, PARTICIPANT_DEPOSIT } from '@/config/contracts'
import {
  useWriteWaffleMarketSettle,
  useWriteWaffleMarketClaimRefund,
  useSimulateWaffleMarketSettle,
  useSimulateWaffleMarketClaimRefund,
  useWriteWaffleMarketEnter,
  useSimulateWaffleMarketEnter,
  useReadWaffleMarketTicketPrice,
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
 * WorldID proof data structure returned by MiniKit verify command.
 */
interface WorldIdProof {
  merkle_root: string
  nullifier_hash: string
  proof: `0x${string}` // ABI-encoded bytes
  verification_level: string
}

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
 * Hook for entering a market with WorldID verification.
 * Two-step flow: (1) verify WorldID via MiniKit, (2) call enter contract function.
 * Uses simulate -> write -> wait pattern for safe transaction execution.
 */
export function useEnterMarket(marketAddress: Address | undefined) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [worldIdProof, setWorldIdProof] = useState<WorldIdProof | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  // Read ticket price for value calculation
  const { data: ticketPrice } = useReadWaffleMarketTicketPrice({
    address: marketAddress,
    chainId: CHAIN_ID,
    query: { enabled: !!marketAddress },
  })

  // Calculate required value: ticketPrice + PARTICIPANT_DEPOSIT
  const requiredValue = useMemo(() => {
    if (!ticketPrice) return undefined
    return ticketPrice + PARTICIPANT_DEPOSIT
  }, [ticketPrice])

  // Prepare contract arguments from WorldID proof
  const args = useMemo(() => {
    if (!worldIdProof) return undefined
    try {
      const decoded = decodeAbiParameters(
        [{ type: 'uint256[8]' }],
        worldIdProof.proof
      )
      return {
        root: BigInt(worldIdProof.merkle_root),
        nullifierHash: BigInt(worldIdProof.nullifier_hash),
        proof: decoded[0] as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint],
      }
    } catch {
      return undefined
    }
  }, [worldIdProof])

  // Simulate enter transaction (only when args and value ready)
  const { data: simulateData, error: simulateError } = useSimulateWaffleMarketEnter({
    address: marketAddress,
    chainId: CHAIN_ID,
    args: args ? [args.root, args.nullifierHash, args.proof] : undefined,
    value: requiredValue,
    query: { enabled: !!marketAddress && !!args && !!requiredValue },
  })

  // Write contract
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset: resetWrite,
  } = useWriteWaffleMarketEnter()

  // Wait for confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  /**
   * Step 1: Verify WorldID via MiniKit.
   * Call this first to collect the proof needed for contract entry.
   * @param lotteryId - The lottery ID to use as signal for proof
   */
  const verifyWorldId = async (lotteryId: string) => {
    setIsVerifying(true)
    setVerifyError(null)
    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요')
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'lottery-entry', // Different from 'lottery-verification' used for login
        signal: lotteryId, // Tie proof to specific lottery
        verification_level: VerificationLevel.Orb,
      })

      if (finalPayload.status === 'error') {
        const errorCode = (finalPayload as { error_code?: string }).error_code
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

      setWorldIdProof({
        merkle_root: finalPayload.merkle_root,
        nullifier_hash: finalPayload.nullifier_hash,
        proof: finalPayload.proof as `0x${string}`,
        verification_level: finalPayload.verification_level,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'WorldID 인증에 실패했습니다'
      setVerifyError(message)
      throw err
    } finally {
      setIsVerifying(false)
    }
  }

  /**
   * Step 2: Enter the market by calling the contract.
   * Only works after verifyWorldId succeeds and simulation passes.
   */
  const enter = () => {
    if (simulateData?.request) {
      writeContract(simulateData.request)
    }
  }

  // Combine all error sources
  const contractError = simulateError || writeError
  const error = verifyError || (contractError ? (contractError as BaseError).shortMessage || contractError.message : null)

  /**
   * Reset the hook state to allow a fresh entry attempt.
   */
  const reset = () => {
    resetWrite()
    setWorldIdProof(null)
    setVerifyError(null)
  }

  return {
    // Actions
    verifyWorldId,
    enter,
    reset,
    // WorldID verification state
    isVerifying,
    worldIdProof,
    // Contract write state
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    // Computed values
    canEnter: !!simulateData?.request,
    requiredValue,
    ticketPrice,
    // Error state
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
